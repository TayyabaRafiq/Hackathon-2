# AI FastAPI Chat Backend

**Skill ID:** `ai-fastapi-chat-backend`
**Category:** Backend Engineering
**Last Updated:** 2026-02-05

## Description

Build a production-ready, stateless AI chatbot backend using FastAPI that:
- Loads conversation history from PostgreSQL
- Streams AI responses in real-time
- Uses MCP tools for all database operations (no direct DB access by AI agent)
- Handles tool execution and AI errors gracefully
- Follows clean architecture patterns

## When to Use This Skill

- Building conversational AI features with persistent message history
- Creating chatbot APIs that integrate with LLM providers (OpenAI, Anthropic, etc.)
- Implementing stateless backends where conversation state lives in the database
- Setting up MCP tool-based architectures for AI agents

## Prerequisites

**Required:**
- FastAPI >= 0.100.0
- SQLModel >= 0.0.8
- PostgreSQL database (local or remote)
- Python >= 3.10
- AI SDK (OpenAI SDK, Anthropic SDK, etc.)
- MCP (Model Context Protocol) server configured

**Knowledge:**
- FastAPI routing and dependency injection
- SQLModel ORM patterns
- Async Python (async/await)
- Streaming HTTP responses (SSE or chunked transfer)
- Basic understanding of LLM tool/function calling

## Architecture Overview

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ POST /api/{user_id}/chat
       │ {"message": "user input"}
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Backend                 │
│  ┌───────────────────────────────────┐ │
│  │  1. Load message history from DB  │ │
│  │  2. Append new user message       │ │
│  │  3. Call AI agent with MCP tools  │ │
│  │  4. Stream response tokens        │ │
│  │  5. Save assistant message to DB  │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
       │                    ▲
       │                    │
       ▼                    │
┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │    │  MCP Server  │
│  (Messages)  │    │  (Tools)     │
└──────────────┘    └──────────────┘
```

**Key Principles:**
- **Stateless**: No in-memory session state; all conversation history in DB
- **MCP-First**: AI agent uses MCP tools for all operations (DB, external APIs, etc.)
- **Streaming**: Real-time token streaming for better UX
- **Error Resilient**: Graceful degradation on tool failures or AI errors

---

## Implementation Process

### Phase 1: Database Schema & Models

**Goal:** Define message storage schema using SQLModel

#### Step 1.1: Create Message Model

```python
# app/models/message.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
import uuid

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    role: str = Field(nullable=False)  # "user" or "assistant"
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Optional: for tracking tool calls
    tool_calls: Optional[str] = Field(default=None)  # JSON string
    tool_results: Optional[str] = Field(default=None)  # JSON string
```

#### Step 1.2: Database Connection Setup

```python
# app/db.py
from sqlmodel import create_engine, Session, SQLModel
from contextlib import contextmanager
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/chatdb")

engine = create_engine(DATABASE_URL, echo=False)

def init_db():
    """Initialize database tables"""
    SQLModel.metadata.create_all(engine)

@contextmanager
def get_session():
    """Context manager for database sessions"""
    with Session(engine) as session:
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
```

**Quality Checks:**
- ✅ Message model includes `user_id` index for fast lookups
- ✅ `role` field distinguishes user vs assistant messages
- ✅ `created_at` timestamp for chronological ordering
- ✅ Connection pooling enabled in production
- ✅ Environment variable for DATABASE_URL (never hardcode)

---

### Phase 2: MCP Tool Implementation

**Goal:** Create MCP tools that the AI agent will use for database operations

#### Step 2.1: Define MCP Tool Schemas

```python
# app/mcp_tools/schemas.py
from pydantic import BaseModel, Field
from typing import List, Optional

class GetMessagesInput(BaseModel):
    user_id: str = Field(..., description="User ID to fetch messages for")
    limit: Optional[int] = Field(50, description="Max messages to return")

class SaveMessageInput(BaseModel):
    user_id: str = Field(..., description="User ID")
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")

class ToolResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
```

#### Step 2.2: Implement MCP Tool Functions

```python
# app/mcp_tools/message_tools.py
from sqlmodel import select
from app.db import get_session
from app.models.message import Message
from app.mcp_tools.schemas import GetMessagesInput, SaveMessageInput, ToolResponse
import json

def get_messages_tool(input_data: GetMessagesInput) -> ToolResponse:
    """
    MCP Tool: Retrieve conversation history for a user

    This tool is called by the AI agent to load context.
    """
    try:
        with get_session() as session:
            statement = (
                select(Message)
                .where(Message.user_id == input_data.user_id)
                .order_by(Message.created_at.asc())
                .limit(input_data.limit)
            )
            messages = session.exec(statement).all()

            messages_dict = [
                {
                    "role": msg.role,
                    "content": msg.content,
                    "created_at": msg.created_at.isoformat()
                }
                for msg in messages
            ]

            return ToolResponse(success=True, data={"messages": messages_dict})

    except Exception as e:
        return ToolResponse(success=False, error=str(e))

def save_message_tool(input_data: SaveMessageInput) -> ToolResponse:
    """
    MCP Tool: Save a message to the database

    This tool is called by the AI agent to persist messages.
    """
    try:
        with get_session() as session:
            message = Message(
                user_id=input_data.user_id,
                role=input_data.role,
                content=input_data.content
            )
            session.add(message)
            session.commit()
            session.refresh(message)

            return ToolResponse(
                success=True,
                data={"message_id": str(message.id)}
            )

    except Exception as e:
        return ToolResponse(success=False, error=str(e))
```

#### Step 2.3: Register MCP Tools

```python
# app/mcp_tools/registry.py
from typing import Dict, Callable, Any

# MCP Tool Registry
MCP_TOOLS: Dict[str, Callable] = {
    "get_messages": get_messages_tool,
    "save_message": save_message_tool,
}

def execute_mcp_tool(tool_name: str, tool_input: dict) -> dict:
    """
    Execute an MCP tool by name with given input

    Args:
        tool_name: Name of the tool to execute
        tool_input: Dictionary of tool parameters

    Returns:
        Tool execution result as dictionary
    """
    if tool_name not in MCP_TOOLS:
        return {
            "success": False,
            "error": f"Tool '{tool_name}' not found"
        }

    tool_func = MCP_TOOLS[tool_name]

    # Determine input schema based on tool
    if tool_name == "get_messages":
        from app.mcp_tools.schemas import GetMessagesInput
        input_obj = GetMessagesInput(**tool_input)
    elif tool_name == "save_message":
        from app.mcp_tools.schemas import SaveMessageInput
        input_obj = SaveMessageInput(**tool_input)
    else:
        return {"success": False, "error": "Unknown tool schema"}

    result = tool_func(input_obj)
    return result.dict()
```

**Quality Checks:**
- ✅ All MCP tools return consistent `ToolResponse` schema
- ✅ Tool functions are stateless and idempotent where possible
- ✅ Input validation via Pydantic schemas
- ✅ Errors captured and returned (no exceptions thrown to agent)
- ✅ Tools registered in centralized registry

---

### Phase 3: AI Agent Integration (SDK-Agnostic Pattern)

**Goal:** Create AI agent wrapper that works with any LLM SDK

#### Step 3.1: AI Agent Interface

```python
# app/ai/agent.py
from typing import AsyncIterator, List, Dict, Any
from abc import ABC, abstractmethod

class AIMessage:
    """Generic message format"""
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

class AIAgent(ABC):
    """
    Abstract AI Agent interface - implement for your chosen SDK

    Implementations:
    - OpenAIAgent (using openai SDK)
    - AnthropicAgent (using anthropic SDK)
    - LangChainAgent (using langchain)
    """

    @abstractmethod
    async def stream_response(
        self,
        messages: List[AIMessage],
        tools: List[Dict[str, Any]],
        tool_executor: callable
    ) -> AsyncIterator[str]:
        """
        Stream AI response tokens

        Args:
            messages: Conversation history
            tools: Available MCP tools (JSON schema format)
            tool_executor: Function to execute tool calls

        Yields:
            Response tokens as strings
        """
        pass
```

#### Step 3.2: Example SDK Implementation (Anthropic)

```python
# app/ai/anthropic_agent.py
from anthropic import AsyncAnthropic
from app.ai.agent import AIAgent, AIMessage
from typing import AsyncIterator, List, Dict, Any
import os

class AnthropicAgent(AIAgent):
    def __init__(self):
        self.client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.model = "claude-3-5-sonnet-20241022"

    async def stream_response(
        self,
        messages: List[AIMessage],
        tools: List[Dict[str, Any]],
        tool_executor: callable
    ) -> AsyncIterator[str]:
        """Stream response from Claude with tool use support"""

        # Convert to Anthropic format
        anthropic_messages = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]

        async with self.client.messages.stream(
            model=self.model,
            messages=anthropic_messages,
            tools=tools,
            max_tokens=4096
        ) as stream:
            async for event in stream:
                # Handle text deltas
                if event.type == "content_block_delta":
                    if hasattr(event.delta, "text"):
                        yield event.delta.text

                # Handle tool calls
                elif event.type == "content_block_stop":
                    if hasattr(event, "content_block"):
                        block = event.content_block
                        if block.type == "tool_use":
                            # Execute tool via MCP
                            tool_result = tool_executor(
                                block.name,
                                block.input
                            )
                            # Note: In production, you'd resume the stream
                            # with tool results. This is simplified.
                            yield f"\n[Tool: {block.name} executed]\n"
```

**Quality Checks:**
- ✅ Agent interface is SDK-agnostic
- ✅ Streaming implemented via async generators
- ✅ Tool execution delegated to MCP tool executor
- ✅ API keys loaded from environment variables
- ✅ Error handling for API failures (add try/except in production)

---

### Phase 4: FastAPI Chat Endpoint

**Goal:** Implement the main chat endpoint with streaming response

#### Step 4.1: Request/Response Schemas

```python
# app/schemas/chat.py
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=5000)

class ChatResponse(BaseModel):
    """Used for non-streaming responses"""
    response: str
    user_id: str
```

#### Step 4.2: Chat Endpoint Implementation

```python
# app/routers/chat.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest
from app.models.message import Message
from app.db import get_session
from app.ai.agent import AIMessage
from app.ai.anthropic_agent import AnthropicAgent  # or your chosen agent
from app.mcp_tools.registry import execute_mcp_tool
from sqlmodel import select
import json

router = APIRouter(prefix="/api", tags=["chat"])

# MCP Tool definitions for AI agent
MCP_TOOL_DEFINITIONS = [
    {
        "name": "get_messages",
        "description": "Retrieve conversation history for a user",
        "input_schema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string", "description": "User ID"},
                "limit": {"type": "integer", "description": "Max messages", "default": 50}
            },
            "required": ["user_id"]
        }
    },
    {
        "name": "save_message",
        "description": "Save a message to conversation history",
        "input_schema": {
            "type": "object",
            "properties": {
                "user_id": {"type": "string"},
                "role": {"type": "string", "enum": ["user", "assistant"]},
                "content": {"type": "string"}
            },
            "required": ["user_id", "role", "content"]
        }
    }
]

@router.post("/{user_id}/chat")
async def chat(user_id: str, request: ChatRequest):
    """
    Stateless chat endpoint with streaming response

    Request Lifecycle:
    1. Load conversation history from DB
    2. Append new user message to DB
    3. Build message context for AI
    4. Stream AI response with MCP tool support
    5. Save assistant response to DB

    Args:
        user_id: Unique user identifier
        request: Chat request with user message

    Returns:
        StreamingResponse with AI-generated tokens
    """

    # Step 1: Save user message to database
    try:
        with get_session() as session:
            user_message = Message(
                user_id=user_id,
                role="user",
                content=request.message
            )
            session.add(user_message)
            session.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save message: {str(e)}")

    # Step 2: Load conversation history
    try:
        with get_session() as session:
            statement = (
                select(Message)
                .where(Message.user_id == user_id)
                .order_by(Message.created_at.asc())
            )
            messages = session.exec(statement).all()

            # Convert to AI message format
            ai_messages = [
                AIMessage(role=msg.role, content=msg.content)
                for msg in messages
            ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load history: {str(e)}")

    # Step 3: Initialize AI agent
    agent = AnthropicAgent()  # or your chosen implementation

    # Step 4: Stream response
    async def response_generator():
        """Generator that streams AI response and saves to DB"""
        assistant_response = ""

        try:
            async for token in agent.stream_response(
                messages=ai_messages,
                tools=MCP_TOOL_DEFINITIONS,
                tool_executor=execute_mcp_tool
            ):
                assistant_response += token
                yield token

        except Exception as e:
            error_msg = f"[Error: {str(e)}]"
            yield error_msg
            assistant_response += error_msg

        # Step 5: Save assistant response to database
        try:
            with get_session() as session:
                assistant_message = Message(
                    user_id=user_id,
                    role="assistant",
                    content=assistant_response
                )
                session.add(assistant_message)
                session.commit()
        except Exception as save_error:
            # Log error but don't fail the stream
            yield f"\n[Warning: Failed to save response - {str(save_error)}]"

    return StreamingResponse(
        response_generator(),
        media_type="text/plain"
    )
```

**Quality Checks:**
- ✅ User message saved BEFORE calling AI (ensures history is complete)
- ✅ Conversation history loaded from DB (stateless design)
- ✅ Streaming response for real-time UX
- ✅ Assistant response saved AFTER streaming completes
- ✅ Error handling at each step (DB, AI, tool execution)
- ✅ HTTP 500 returned for critical failures
- ✅ MCP tools passed to AI agent for execution

---

### Phase 5: Application Setup

#### Step 5.1: Main Application File

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat
from app.db import init_db

app = FastAPI(
    title="AI Chat Backend",
    description="Stateless AI chatbot with MCP tool support",
    version="1.0.0"
)

# CORS middleware (configure for your frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
def on_startup():
    init_db()

# Include routers
app.include_router(chat.router)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
```

#### Step 5.2: Environment Configuration

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/chatdb
ANTHROPIC_API_KEY=sk-ant-xxx  # or OPENAI_API_KEY, etc.
```

#### Step 5.3: Run the Application

```bash
# Install dependencies
pip install fastapi uvicorn sqlmodel psycopg2-binary anthropic

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Quality Checks:**
- ✅ Environment variables used for all secrets
- ✅ CORS configured for frontend origin
- ✅ Database initialized on startup
- ✅ Health check endpoint for monitoring
- ✅ API documentation auto-generated at `/docs`

---

## Example Request Lifecycle

### Request
```bash
curl -X POST http://localhost:8000/api/user123/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?"}'
```

### Backend Flow

```
1. POST /api/user123/chat received
   └─> ChatRequest validated: {"message": "What tasks do I have?"}

2. Save user message to DB
   └─> INSERT INTO messages (user_id='user123', role='user', content='What tasks do I have?')

3. Load conversation history from DB
   └─> SELECT * FROM messages WHERE user_id='user123' ORDER BY created_at ASC
   └─> Result: [
         {"role": "user", "content": "Create task: Buy groceries"},
         {"role": "assistant", "content": "Task created successfully"},
         {"role": "user", "content": "What tasks do I have?"}
       ]

4. Initialize AI agent with MCP tools
   └─> Tools: [get_messages, save_message]

5. Stream AI response
   ├─> AI decides to call MCP tool "get_messages"
   │   └─> execute_mcp_tool("get_messages", {"user_id": "user123"})
   │       └─> Returns: {"success": true, "data": {"messages": [...]}}
   │
   ├─> AI generates response: "You have 1 task: Buy groceries"
   │   └─> Tokens streamed to client: "You" → " have" → " 1" → " task" → ...
   │
   └─> Stream completes

6. Save assistant response to DB
   └─> INSERT INTO messages (user_id='user123', role='assistant', content='You have 1 task: Buy groceries')

7. Response completed
```

### Response (Streamed)
```
You have 1 task: Buy groceries
```

---

## Error Handling Patterns

### 1. Database Connection Errors

```python
try:
    with get_session() as session:
        # DB operations
        pass
except OperationalError as e:
    raise HTTPException(
        status_code=503,
        detail="Database unavailable. Please try again later."
    )
```

### 2. MCP Tool Execution Errors

```python
def execute_mcp_tool(tool_name: str, tool_input: dict) -> dict:
    try:
        # Tool execution
        pass
    except Exception as e:
        return {
            "success": False,
            "error": f"Tool execution failed: {str(e)}",
            "tool_name": tool_name
        }
```

### 3. AI Agent Errors

```python
async def response_generator():
    try:
        async for token in agent.stream_response(...):
            yield token
    except APIError as e:
        yield f"\n[AI service temporarily unavailable: {e.message}]"
    except Exception as e:
        yield f"\n[Unexpected error: {str(e)}]"
```

### 4. Streaming Response Errors

```python
# If assistant response save fails, don't break the stream
try:
    with get_session() as session:
        session.add(assistant_message)
        session.commit()
except Exception as e:
    # Log to monitoring system
    logger.error(f"Failed to save assistant message: {e}")
    # Inform client (optional)
    yield f"\n[Warning: Response not saved to history]"
```

**Quality Checks:**
- ✅ All database errors return HTTP 503 (service unavailable)
- ✅ Tool errors returned to AI agent (not thrown)
- ✅ AI errors streamed to client with context
- ✅ Stream never breaks on save errors (graceful degradation)

---

## Production Readiness Checklist

### Security
- [ ] API rate limiting implemented (e.g., SlowAPI)
- [ ] User authentication/authorization added
- [ ] Input sanitization for SQL injection prevention
- [ ] CORS origins restricted to production domains
- [ ] Environment variables never committed to git
- [ ] API keys rotated regularly

### Performance
- [ ] Database connection pooling configured
- [ ] Index on `messages.user_id` for fast lookups
- [ ] Message history limited (e.g., last 50 messages)
- [ ] Async operations used throughout
- [ ] Response streaming optimized (chunk size tuning)

### Observability
- [ ] Structured logging (JSON format)
- [ ] Request ID tracking across services
- [ ] Metrics for:
  - Request latency (p50, p95, p99)
  - Token throughput
  - Tool execution time
  - Database query time
  - Error rates by type
- [ ] Alerts for:
  - High error rate (> 5%)
  - Slow responses (> 5s p95)
  - Database connection failures

### Reliability
- [ ] Retry logic for transient failures
- [ ] Circuit breaker for AI API calls
- [ ] Database migration strategy
- [ ] Backup and restore procedures
- [ ] Load testing completed (e.g., 100 concurrent users)

### Deployment
- [ ] Docker containerization
- [ ] Health check endpoint (`/health`)
- [ ] Graceful shutdown handling
- [ ] Environment-specific configs (dev/staging/prod)
- [ ] CI/CD pipeline configured

---

## Common Pitfalls

### ❌ Direct Database Access by AI Agent
**Problem:** AI agent imports `Message` model and queries DB directly
```python
# WRONG - AI agent should not access DB directly
from app.models.message import Message
messages = session.query(Message).filter_by(user_id=user_id).all()
```

**Solution:** Always use MCP tools
```python
# CORRECT - AI uses MCP tool
tool_result = execute_mcp_tool("get_messages", {"user_id": user_id})
```

### ❌ Not Saving User Message Before AI Call
**Problem:** User message not in DB if AI call fails
```python
# WRONG - AI called before saving user message
response = await agent.stream_response(messages)
save_user_message()  # Too late!
```

**Solution:** Save user message first
```python
# CORRECT - Save before AI call
save_user_message()
response = await agent.stream_response(messages)
```

### ❌ Blocking Streaming Response to Save
**Problem:** Waiting for full response before saving breaks streaming UX
```python
# WRONG - Defeats purpose of streaming
full_response = await collect_all_tokens()
save_to_db(full_response)
return full_response
```

**Solution:** Save after streaming completes
```python
# CORRECT - Save in generator after stream ends
async def generator():
    response = ""
    async for token in stream:
        response += token
        yield token
    save_to_db(response)  # Save after streaming
```

### ❌ Hardcoding Tool Definitions
**Problem:** Tool schemas not aligned with actual tool functions
```python
# WRONG - Manual schema maintenance
tools = [{"name": "get_messages", "parameters": {...}}]  # May drift
```

**Solution:** Generate from Pydantic schemas
```python
# CORRECT - Single source of truth
from app.mcp_tools.schemas import GetMessagesInput
tool_schema = GetMessagesInput.schema()
```

---

## Testing Strategy

### Unit Tests

```python
# tests/test_mcp_tools.py
import pytest
from app.mcp_tools.message_tools import get_messages_tool, save_message_tool
from app.mcp_tools.schemas import GetMessagesInput, SaveMessageInput

def test_save_message_tool(db_session):
    """Test saving a message via MCP tool"""
    input_data = SaveMessageInput(
        user_id="test_user",
        role="user",
        content="Hello"
    )

    result = save_message_tool(input_data)

    assert result.success is True
    assert "message_id" in result.data

def test_get_messages_tool(db_session):
    """Test retrieving messages via MCP tool"""
    # Setup: Create test messages
    save_message_tool(SaveMessageInput(user_id="test_user", role="user", content="Hi"))
    save_message_tool(SaveMessageInput(user_id="test_user", role="assistant", content="Hello"))

    # Test: Retrieve messages
    input_data = GetMessagesInput(user_id="test_user")
    result = get_messages_tool(input_data)

    assert result.success is True
    assert len(result.data["messages"]) == 2
```

### Integration Tests

```python
# tests/test_chat_endpoint.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_chat_endpoint_streaming():
    """Test chat endpoint returns streaming response"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.post(
            "/api/test_user/chat",
            json={"message": "Hello"}
        )

        assert response.status_code == 200

        # Collect streamed tokens
        tokens = []
        async for chunk in response.aiter_text():
            tokens.append(chunk)

        assert len(tokens) > 0  # Response was streamed

        # Verify message saved to DB
        # ... DB assertion here
```

**Quality Checks:**
- ✅ Unit tests for all MCP tools
- ✅ Integration tests for chat endpoint
- ✅ Streaming response tested
- ✅ Error cases covered (DB down, AI error, etc.)
- ✅ Test database used (not production)

---

## Success Criteria

Upon completion, your AI chatbot backend should:

1. **Functional Requirements:**
   - ✅ Accept POST requests to `/api/{user_id}/chat`
   - ✅ Load and return conversation history from PostgreSQL
   - ✅ Stream AI responses in real-time
   - ✅ Save all messages (user and assistant) to database
   - ✅ Execute MCP tools when called by AI agent

2. **Non-Functional Requirements:**
   - ✅ Stateless design (no in-memory session state)
   - ✅ Response latency < 2s for first token
   - ✅ Handle 50+ concurrent users
   - ✅ No direct database access by AI agent
   - ✅ Graceful error handling at all layers

3. **Code Quality:**
   - ✅ Type hints on all functions
   - ✅ Pydantic validation for all inputs
   - ✅ Async/await used consistently
   - ✅ No secrets in code (environment variables)
   - ✅ Clear separation of concerns (models, tools, routes, AI)

---

## Extension Points

Once the base implementation is complete, consider:

1. **Multi-Model Support:** Allow users to choose AI model per conversation
2. **Conversation Branching:** Support forking conversations from any message
3. **Tool Versioning:** Version MCP tools for backward compatibility
4. **Caching:** Cache recent conversations in Redis for faster load times
5. **Analytics:** Track token usage, tool call frequency, error patterns
6. **Webhooks:** Notify external systems on conversation events
7. **Message Reactions:** Allow users to upvote/downvote AI responses

---

## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [Anthropic Streaming Documentation](https://docs.anthropic.com/claude/reference/streaming)
- [OpenAI Streaming Documentation](https://platform.openai.com/docs/api-reference/streaming)

---

**Last Updated:** 2026-02-05
**Maintained By:** Backend Engineering Team
