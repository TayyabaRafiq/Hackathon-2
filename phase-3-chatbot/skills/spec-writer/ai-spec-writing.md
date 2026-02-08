# AI System Technical Specification Writing

**Skill ID:** `ai-spec-writing`
**Category:** Specification Writing
**Last Updated:** 2026-02-05

## Description

Write comprehensive technical specifications for AI-powered systems that clearly define:
- System behavior (prompts, context management, model selection)
- API contracts (request/response formats, streaming)
- Tool contracts (MCP tool definitions, schemas)
- Error handling rules (AI failures, tool errors, rate limits)

This skill ensures AI systems are well-defined, testable, and implementable before code is written.

## When to Use This Skill

- Designing new AI-powered features or applications
- Integrating LLMs (OpenAI, Anthropic, etc.) into existing systems
- Defining MCP tools for AI agents
- Specifying conversational AI behavior
- Planning multi-step AI workflows
- Documenting AI agent capabilities and limitations

## Prerequisites

**Required Knowledge:**
- Understanding of LLM capabilities and limitations
- Familiarity with tool/function calling concepts
- API design principles
- Prompt engineering basics
- Error handling patterns

**Context Needed:**
- User requirements (what the AI should accomplish)
- System constraints (performance, cost, privacy)
- Integration points (existing APIs, databases)
- Target LLM provider (OpenAI, Anthropic, custom)

## AI Specification Philosophy

### Core Principles

1. **Deterministic Specification, Non-Deterministic Execution:**
   - Spec defines expected behavior patterns, not exact outputs
   - Acceptance criteria based on capabilities, not word-for-word responses
   - Test for semantic correctness, not string matching

2. **Behavior Over Implementation:**
   - Specify WHAT the AI should do, not HOW it generates responses
   - Define system prompts and context rules
   - Describe tool usage patterns, not tool implementation

3. **Graceful Degradation:**
   - Define behavior for AI failures (hallucinations, refusals)
   - Specify fallback strategies
   - Document error boundaries

4. **Observable Behavior:**
   - All specifications must be testable
   - Define success metrics for AI behavior
   - Specify logging and observability requirements

---

## AI Specification Structure

```markdown
# [AI Feature Name] - Technical Specification

## 1. System Overview
   - AI capability summary
   - Integration architecture
   - Model selection

## 2. System Behavior
   - Agent role and persona
   - System prompts
   - Context management
   - Multi-turn conversation handling

## 3. API Contracts
   - Endpoints (REST, streaming)
   - Request/response schemas
   - Streaming protocols
   - Rate limits

## 4. Tool Contracts
   - MCP tool definitions
   - Tool schemas (input/output)
   - Tool execution rules
   - Tool error handling

## 5. Error Rules
   - AI error scenarios
   - Tool error scenarios
   - Retry strategies
   - User-facing error messages

## 6. Performance & Constraints
   - Token budgets
   - Response time targets
   - Cost constraints
   - Context window limits

## 7. Observability & Testing
   - Logging requirements
   - Metrics to track
   - Test scenarios
   - Acceptance criteria
```

---

## Section 1: System Overview

**Purpose:** Provide high-level understanding of the AI system's capabilities and architecture.

### Template

```markdown
## System Overview

### AI Capability Summary
[2-3 sentences describing what the AI does from user perspective]

### Integration Architecture
```
[ASCII diagram showing AI integration points]
```

### Model Selection

**Primary Model:** [Model name and version]
- **Reasoning:** [Why this model was chosen]
- **Capabilities:** [Key features: tool use, streaming, context window]
- **Limitations:** [Known constraints]

**Fallback Model:** [Optional - backup model]
- **When to use:** [Conditions for fallback]

### Key Dependencies
- LLM Provider API (OpenAI, Anthropic, etc.)
- MCP Server (for tool execution)
- Database (for conversation history, state)
- External APIs (if AI calls third-party services)
```

### Example

```markdown
## System Overview

### AI Capability Summary
An AI assistant that helps users manage tasks through natural conversation. Users can create, view, update, and delete tasks by chatting with the AI, which uses database tools to persist task data.

### Integration Architecture
```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Chat message
       ▼
┌──────────────────────┐
│   FastAPI Backend    │
│  ┌────────────────┐  │
│  │  AI Agent      │  │
│  │  (Claude 3.5)  │  │
│  └────────┬───────┘  │
│           │           │
│  ┌────────▼───────┐  │
│  │  MCP Tools     │  │
│  │  - create_task │  │
│  │  - get_tasks   │  │
│  │  - update_task │  │
│  └────────┬───────┘  │
└───────────┼──────────┘
            │
     ┌──────▼──────┐
     │ PostgreSQL  │
     │   (tasks)   │
     └─────────────┘
```

### Model Selection

**Primary Model:** Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- **Reasoning:** Excellent tool use, fast responses, strong instruction following
- **Capabilities:**
  - Native tool/function calling
  - 200K token context window
  - Streaming support
  - JSON mode for structured output
- **Limitations:**
  - Rate limits: 50 requests/minute (tier 2)
  - Cost: $3/MTok input, $15/MTok output

**Fallback Model:** Claude 3 Haiku (claude-3-haiku-20240307)
- **When to use:** If rate limit exceeded or cost optimization needed for simple queries

### Key Dependencies
- Anthropic API (claude-3-5-sonnet)
- MCP Server (task management tools)
- PostgreSQL database (task persistence)
- User authentication service (for user_id validation)
```

**Quality Checks:**
- ✅ Clear summary of AI capabilities
- ✅ Architecture diagram shows integration points
- ✅ Model selection justified with rationale
- ✅ Limitations and constraints documented
- ✅ Dependencies identified

---

## Section 2: System Behavior

**Purpose:** Define how the AI agent behaves, including prompts, context, and conversation handling.

### Template

```markdown
## System Behavior

### Agent Role and Persona
**Role:** [What the AI is]
**Tone:** [Communication style]
**Constraints:** [What the AI should NOT do]

### System Prompt
```
[The core instruction given to the AI on every request]
```

### Context Management

**Context Sources:**
1. Conversation history (last N messages)
2. User profile data
3. Retrieved documents
4. Tool execution results

**Context Window Strategy:**
- Maximum context: [N tokens]
- History limit: [M messages]
- Truncation strategy: [How to handle overflow]

### Multi-Turn Conversation Handling

**Session Management:**
- Session identifier: [conversation_id, user_id, etc.]
- Session persistence: [Where conversation state is stored]
- Session expiration: [When to reset context]

**Context Retention:**
- What to remember across turns
- What to forget
- How to summarize long conversations

### Decision-Making Rules

**Tool Use:**
- When to call tools vs. respond directly
- Tool selection criteria
- Tool call sequencing (if multiple tools needed)

**Response Generation:**
- When to ask clarifying questions
- When to refuse requests
- How to handle ambiguity
```

### Example

```markdown
## System Behavior

### Agent Role and Persona
**Role:** Helpful task management assistant
**Tone:** Friendly, concise, action-oriented
**Constraints:**
- Does NOT create tasks without user confirmation if ambiguous
- Does NOT access tasks belonging to other users
- Does NOT make assumptions about task priorities without asking

### System Prompt
```
You are a helpful task management assistant. Your role is to help users create, view, update, and delete tasks through natural conversation.

Guidelines:
- Use the provided MCP tools to interact with the task database
- Always verify the user_id before performing operations
- Confirm task creation if the user's intent is unclear
- Format task lists in a readable, numbered format
- Ask clarifying questions for ambiguous requests (e.g., "Delete my task" when multiple tasks exist)
- Respond concisely and stay focused on task management

Available tools:
- create_task: Create a new task
- get_tasks: Retrieve user's tasks (filtered by status)
- update_task: Modify task details or status
- delete_task: Remove a task (soft delete)

Examples:
User: "Create task: Buy groceries"
You: [Call create_task] "I've created the task 'Buy groceries' for you."

User: "What do I need to do?"
You: [Call get_tasks] "You have 3 pending tasks: 1. Buy groceries, 2. Finish report, 3. Call dentist"

User: "Mark groceries as done"
You: [Call update_task] "Great! I've marked 'Buy groceries' as completed."
```

### Context Management

**Context Sources:**
1. **Conversation history:** Last 20 messages (user + assistant)
2. **User profile:** user_id, username (for personalization)
3. **Tool execution results:** Task data returned from MCP tools
4. **Current request:** User's latest message

**Context Window Strategy:**
- Maximum context: 8000 tokens (~10,000 words)
- History limit: 20 messages (10 exchanges)
- Truncation strategy: Keep system prompt + last 20 messages, drop oldest first if overflow

### Multi-Turn Conversation Handling

**Session Management:**
- Session identifier: `conversation_id` (from database)
- Session persistence: PostgreSQL `conversations` table
- Session expiration: Never (users can resume anytime)

**Context Retention:**
- **Remember:** Ongoing task discussions, user preferences (e.g., preferred date format)
- **Forget:** Completed sub-tasks after summary, detailed error messages after resolution
- **Summarize:** If conversation exceeds 50 messages, summarize older messages

### Decision-Making Rules

**Tool Use:**
- **Call tools when:**
  - User explicitly requests task operation (create, view, update, delete)
  - Need to verify task existence before update/delete
  - Need to check for duplicates before create

- **Respond directly when:**
  - User asks general questions about how task management works
  - Confirming understanding before tool call
  - Providing help or examples

**Tool Selection:**
- Use `get_tasks` before `update_task` or `delete_task` to identify correct task
- Use `create_task` only after extracting clear task title

**Tool Call Sequencing:**
1. `get_tasks` → Identify task ID
2. `update_task` → Modify specific task
3. Return confirmation to user

**Response Generation:**
- **Ask clarifying questions when:**
  - User says "Delete my task" but has multiple tasks
  - Task title is ambiguous (e.g., "Add it to the list" - what is "it"?)
  - Priority or due date is unclear

- **Refuse requests when:**
  - User tries to access another user's tasks
  - Request is unrelated to task management (out of scope)

- **Handle ambiguity:**
  - Present options to user (e.g., "Which task? 1. Buy groceries, 2. Finish report")
  - Default to safest action (e.g., list tasks rather than guess which to delete)
```

**Quality Checks:**
- ✅ Agent role clearly defined
- ✅ System prompt comprehensive and tested
- ✅ Context management strategy specified
- ✅ Multi-turn handling rules defined
- ✅ Decision-making criteria documented

---

## Section 3: API Contracts

**Purpose:** Define the API layer through which users/systems interact with the AI.

### Template

```markdown
## API Contracts

### Endpoint: [METHOD /path]

**Description:** [What this endpoint does]

**Request:**
```json
{
  "field": "type",
  "description": "purpose"
}
```

**Response (Success):**
```json
{
  "field": "type",
  "description": "meaning"
}
```

**Response (Error):**
```json
{
  "error": "string",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Streaming (if applicable):**
- Protocol: [SSE, WebSocket, chunked transfer]
- Event types: [token, tool_call, completion, error]
- Reconnection strategy: [How to resume]

**Rate Limits:**
- Requests per minute: [N]
- Tokens per request: [Max]
- Concurrent requests: [Max]

**Timeouts:**
- Request timeout: [N seconds]
- Streaming timeout: [N seconds]

**Idempotency:**
- Idempotent: [Yes/No]
- Idempotency key: [Header/field if supported]
```

### Example

```markdown
## API Contracts

### Endpoint: POST /api/{user_id}/chat

**Description:** Send a message to the AI assistant and receive a response. The AI may call MCP tools during processing.

**Request:**
```json
{
  "message": "string (required, 1-5000 chars)",
  "conversation_id": "uuid (optional, null for new conversation)",
  "stream": "boolean (optional, default: true)"
}
```

**Example Request:**
```json
{
  "message": "Create task: Buy groceries tomorrow",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "stream": true
}
```

**Response (Success - Non-Streaming):**
```json
{
  "message_id": "uuid",
  "conversation_id": "uuid",
  "content": "string (AI response)",
  "tool_calls": [
    {
      "tool": "create_task",
      "input": {"title": "Buy groceries", "due_at": "2026-02-06"},
      "result": {"success": true, "task_id": "uuid"}
    }
  ],
  "tokens_used": {
    "input": 150,
    "output": 45
  }
}
```

**Response (Success - Streaming):**
Protocol: Server-Sent Events (SSE)

Event types:
1. `content_delta`: Text chunk
   ```json
   {"type": "content_delta", "delta": "I've created"}
   ```

2. `tool_call`: Tool execution
   ```json
   {
     "type": "tool_call",
     "tool": "create_task",
     "input": {"title": "Buy groceries"}
   }
   ```

3. `tool_result`: Tool completion
   ```json
   {
     "type": "tool_result",
     "tool": "create_task",
     "result": {"success": true, "task_id": "uuid"}
   }
   ```

4. `completion`: Stream end
   ```json
   {
     "type": "completion",
     "message_id": "uuid",
     "conversation_id": "uuid",
     "tokens_used": {"input": 150, "output": 45}
   }
   ```

5. `error`: Stream error
   ```json
   {
     "type": "error",
     "code": "TOOL_EXECUTION_FAILED",
     "message": "Failed to create task: database unavailable"
   }
   ```

**Response (Error):**
```json
{
  "error": "Invalid request: message cannot be empty",
  "code": "VALIDATION_ERROR",
  "status": 400
}
```

**Error Codes:**
- `VALIDATION_ERROR` (400): Invalid input
- `UNAUTHORIZED` (401): Invalid user_id
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `AI_SERVICE_UNAVAILABLE` (503): LLM API down
- `INTERNAL_ERROR` (500): Unexpected error

**Rate Limits:**
- Requests per user: 30/minute
- Tokens per request: 10,000 input + 4,096 output
- Concurrent requests per user: 3

**Timeouts:**
- Request timeout: 60 seconds (non-streaming)
- Streaming timeout: 120 seconds (if no data received)
- First token timeout: 5 seconds (streaming must start within 5s)

**Idempotency:**
- Idempotent: No (each call may generate different AI response)
- Duplicate detection: If same user sends identical message within 5 seconds, return cached response

**Example cURL:**
```bash
# Non-streaming
curl -X POST http://localhost:8000/api/user123/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?", "stream": false}'

# Streaming
curl -X POST http://localhost:8000/api/user123/chat \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message": "Create task: Review PR", "stream": true}'
```

### Endpoint: GET /api/{user_id}/conversations

**Description:** List user's recent conversations.

**Request:**
- Query params:
  - `limit`: integer (optional, default 20, max 100)
  - `offset`: integer (optional, default 0)

**Response (Success):**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "title": "string (auto-generated from first message)",
      "last_message_at": "iso-datetime",
      "message_count": 15,
      "created_at": "iso-datetime"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}
```

**Rate Limits:**
- Requests per user: 60/minute
- No token usage (simple DB query)

**Timeouts:**
- Request timeout: 10 seconds
```

**Quality Checks:**
- ✅ All endpoints documented
- ✅ Request/response schemas complete
- ✅ Streaming protocol specified
- ✅ Error codes defined
- ✅ Rate limits and timeouts documented
- ✅ Example requests provided

---

## Section 4: Tool Contracts

**Purpose:** Define MCP tools that the AI agent uses to perform actions.

### Template

```markdown
## Tool Contracts

### Tool: [tool_name]

**Description:** [What this tool does]

**When to Use:**
- [Scenario 1]
- [Scenario 2]

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "field1": {
      "type": "string",
      "description": "Purpose of field1"
    },
    "field2": {
      "type": "integer",
      "description": "Purpose of field2",
      "minimum": 0,
      "maximum": 100
    }
  },
  "required": ["field1"]
}
```

**Output Schema:**
```json
{
  "success": "boolean",
  "data": {
    "result_field": "type"
  },
  "error": "string | null"
}
```

**Example Usage:**

**Input:**
```json
{
  "field1": "value",
  "field2": 42
}
```

**Output (Success):**
```json
{
  "success": true,
  "data": {"result_field": "result_value"},
  "error": null
}
```

**Output (Error):**
```json
{
  "success": false,
  "data": null,
  "error": "Descriptive error message"
}
```

**Error Handling:**
- [Error scenario 1]: [How to handle]
- [Error scenario 2]: [How to handle]

**Validation Rules:**
- [Rule 1]
- [Rule 2]

**Side Effects:**
- [What changes in the system]

**Idempotency:**
- [Idempotent: Yes/No]
- [Behavior on duplicate calls]
```

### Example

```markdown
## Tool Contracts

### Tool: create_task

**Description:** Create a new task for the user and store it in the database.

**When to Use:**
- User explicitly requests task creation (e.g., "Create task: X")
- User describes something they need to do (e.g., "I need to buy milk")
- After confirming task details with user (if ambiguous)

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "User creating the task"
    },
    "title": {
      "type": "string",
      "description": "Task title",
      "minLength": 1,
      "maxLength": 500
    },
    "description": {
      "type": "string",
      "description": "Optional detailed description",
      "maxLength": 5000
    },
    "priority": {
      "type": "integer",
      "description": "Priority level (0=low, 10=high)",
      "minimum": 0,
      "maximum": 10,
      "default": 0
    },
    "due_at": {
      "type": "string",
      "format": "date-time",
      "description": "Optional due date (ISO 8601)"
    },
    "conversation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Conversation where task was created (for audit)"
    }
  },
  "required": ["user_id", "title"]
}
```

**Output Schema:**
```json
{
  "success": "boolean",
  "data": {
    "task_id": "uuid",
    "created_at": "iso-datetime"
  },
  "error": "string | null",
  "warning": "string | null"
}
```

**Example Usage:**

**Input:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": 5,
  "due_at": "2026-02-06T18:00:00Z",
  "conversation_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Output (Success):**
```json
{
  "success": true,
  "data": {
    "task_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-02-05T10:30:00Z"
  },
  "error": null,
  "warning": null
}
```

**Output (Duplicate Warning):**
```json
{
  "success": true,
  "data": {
    "task_id": "770e8400-e29b-41d4-a716-446655440002",
    "created_at": "2026-02-05T10:30:00Z"
  },
  "error": null,
  "warning": "A task with similar title 'Buy groceries' already exists (created 2 hours ago)"
}
```

**Output (Error):**
```json
{
  "success": false,
  "data": null,
  "error": "Database connection failed: unable to reach PostgreSQL server",
  "warning": null
}
```

**Error Handling:**
- **Database unavailable**: Return `success: false` with error message, AI should inform user to try again later
- **Invalid user_id**: Return error, AI should not proceed
- **Title too long**: Return error with character limit, AI should ask user to shorten
- **Duplicate task** (exact same title in last 24h): Return warning but still create task

**Validation Rules:**
- `title` must not be empty or only whitespace
- `priority` must be 0-10 inclusive
- `due_at` if provided must be valid ISO 8601 datetime
- `user_id` must exist in users table
- `title` length validated at Pydantic schema level

**Side Effects:**
- New row inserted in `tasks` table
- `created_at` timestamp set to current UTC time
- `status` set to 'pending' by default
- Task linked to `conversation_id` for audit trail

**Idempotency:**
- **Not idempotent**: Each call creates a new task
- **Duplicate detection**: Warns if identical title exists within 24 hours, but still creates
- **Recommendation**: AI should confirm with user before calling if title seems duplicate

---

### Tool: get_tasks

**Description:** Retrieve tasks for a user, optionally filtered by status.

**When to Use:**
- User asks "What tasks do I have?"
- User asks for pending/completed tasks
- Before updating/deleting a task (to identify correct task)

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid",
      "description": "User whose tasks to retrieve"
    },
    "status": {
      "type": "string",
      "enum": ["pending", "completed", "all"],
      "description": "Filter by task status",
      "default": "pending"
    },
    "limit": {
      "type": "integer",
      "description": "Maximum tasks to return",
      "minimum": 1,
      "maximum": 100,
      "default": 50
    }
  },
  "required": ["user_id"]
}
```

**Output Schema:**
```json
{
  "success": "boolean",
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "string",
        "description": "string | null",
        "status": "pending | completed",
        "priority": "integer (0-10)",
        "created_at": "iso-datetime",
        "completed_at": "iso-datetime | null",
        "due_at": "iso-datetime | null"
      }
    ],
    "total_count": "integer"
  },
  "error": "string | null"
}
```

**Example Usage:**

**Input:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "limit": 10
}
```

**Output (Success):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "status": "pending",
        "priority": 5,
        "created_at": "2026-02-05T10:30:00Z",
        "completed_at": null,
        "due_at": "2026-02-06T18:00:00Z"
      },
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "title": "Finish report",
        "description": null,
        "status": "pending",
        "priority": 8,
        "created_at": "2026-02-04T14:20:00Z",
        "completed_at": null,
        "due_at": null
      }
    ],
    "total_count": 2
  },
  "error": null
}
```

**Output (No Tasks):**
```json
{
  "success": true,
  "data": {
    "tasks": [],
    "total_count": 0
  },
  "error": null
}
```

**Error Handling:**
- **Database unavailable**: Return `success: false`, AI informs user
- **Invalid user_id**: Return error
- **No tasks found**: Not an error, return empty array with friendly message from AI

**Validation Rules:**
- `status` must be one of: pending, completed, all
- `limit` enforced at database query level
- Results ordered by `created_at DESC` (newest first)

**Side Effects:**
- None (read-only operation)

**Idempotency:**
- **Idempotent**: Yes, same input always returns same result (at that point in time)

---

### Tool: update_task

**Description:** Update task details or mark as completed.

**When to Use:**
- User says "Mark [task] as done"
- User wants to change task title, priority, or due date
- User wants to add/edit task description

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "task_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID of task to update"
    },
    "title": {
      "type": "string",
      "minLength": 1,
      "maxLength": 500
    },
    "description": {
      "type": "string",
      "maxLength": 5000
    },
    "status": {
      "type": "string",
      "enum": ["pending", "completed"]
    },
    "priority": {
      "type": "integer",
      "minimum": 0,
      "maximum": 10
    },
    "due_at": {
      "type": "string",
      "format": "date-time"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema:**
```json
{
  "success": "boolean",
  "data": {
    "task_id": "uuid",
    "updated_fields": ["field1", "field2"],
    "updated_at": "iso-datetime"
  },
  "error": "string | null"
}
```

**Example Usage:**

**Input (Mark as completed):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "task_id": "770e8400-e29b-41d4-a716-446655440002",
  "status": "completed"
}
```

**Output (Success):**
```json
{
  "success": true,
  "data": {
    "task_id": "770e8400-e29b-41d4-a716-446655440002",
    "updated_fields": ["status", "completed_at"],
    "updated_at": "2026-02-05T15:45:00Z"
  },
  "error": null
}
```

**Error Handling:**
- **Task not found**: Return error "Task not found or access denied"
- **User doesn't own task**: Return error (security)
- **Database error**: Return error with retry message

**Validation Rules:**
- Only fields provided in input are updated
- `completed_at` automatically set when status → completed
- `updated_at` automatically set to current time
- User must own the task (enforced at DB level)

**Side Effects:**
- Task row updated in database
- `updated_at` timestamp changed
- `completed_at` set if status changed to completed

**Idempotency:**
- **Partially idempotent**: Updating to same values is safe, no state change
- Repeated calls with same input result in same final state

---

### Tool: delete_task

**Description:** Soft delete a task (mark as deleted, don't remove from DB).

**When to Use:**
- User says "Delete [task]"
- User wants to remove a task from their list

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "task_id": {
      "type": "string",
      "format": "uuid"
    }
  },
  "required": ["user_id", "task_id"]
}
```

**Output Schema:**
```json
{
  "success": "boolean",
  "data": {
    "task_id": "uuid",
    "deleted_at": "iso-datetime"
  },
  "error": "string | null"
}
```

**Example Usage:**

**Input:**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "task_id": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Output (Success):**
```json
{
  "success": true,
  "data": {
    "task_id": "770e8400-e29b-41d4-a716-446655440002",
    "deleted_at": "2026-02-05T16:00:00Z"
  },
  "error": null
}
```

**Error Handling:**
- **Task not found**: Return error
- **Already deleted**: Return success (idempotent)
- **User doesn't own task**: Return error

**Validation Rules:**
- Soft delete only (set `deleted_at` timestamp)
- User must own the task

**Side Effects:**
- `deleted_at` field set to current timestamp
- Task no longer appears in `get_tasks` results (filtered by deleted_at IS NULL)

**Idempotency:**
- **Idempotent**: Deleting same task multiple times is safe
```

**Quality Checks:**
- ✅ All tools documented
- ✅ Input/output schemas complete with JSON Schema format
- ✅ Example usage provided
- ✅ Error handling specified
- ✅ Validation rules defined
- ✅ Side effects documented
- ✅ Idempotency behavior clarified

---

## Section 5: Error Rules

**Purpose:** Define how the system handles errors at different layers (AI, tools, API).

### Template

```markdown
## Error Rules

### AI-Level Errors

#### Scenario: [Error type]
**Cause:** [What triggers this error]
**Detection:** [How to identify it occurred]
**Handling:**
- System behavior: [What the system does]
- User message: [What the user sees]
- Logging: [What gets logged]
- Retry: [Should retry? How many times?]

### Tool-Level Errors

#### Scenario: [Tool error type]
**Cause:** [What causes tool to fail]
**Tool response:** [What tool returns]
**AI behavior:** [How AI handles the error]
**User message:** [What user is told]
**Fallback:** [Alternative action if any]

### API-Level Errors

#### HTTP [Status Code]: [Error Name]
**Causes:** [List of triggers]
**Response body:** [JSON error format]
**Client handling:** [What client should do]
**Retry policy:** [When to retry]

### Error Message Guidelines

**Tone:** [Helpful, apologetic, technical, etc.]
**Format:** [Structure of error messages]
**Examples:**
- Good: "[Example of good error message]"
- Bad: "[Example of bad error message]"
```

### Example

```markdown
## Error Rules

### AI-Level Errors

#### Scenario: LLM API Unavailable
**Cause:** Anthropic API returns 503 Service Unavailable

**Detection:**
- API client receives 503 status code
- Or connection timeout after 10 seconds

**Handling:**
- **System behavior:**
  - Catch exception in API client
  - Return error response to user
  - Log full error details with request ID

- **User message:**
  ```
  "I'm temporarily unable to respond due to a service issue. Please try again in a moment."
  ```

- **Logging:**
  ```json
  {
    "level": "error",
    "error_type": "LLM_API_UNAVAILABLE",
    "provider": "anthropic",
    "status_code": 503,
    "user_id": "uuid",
    "request_id": "uuid",
    "timestamp": "iso-datetime"
  }
  ```

- **Retry:**
  - Backend: Auto-retry 2 times with exponential backoff (1s, 2s)
  - Client: User can manually retry immediately
  - Circuit breaker: Open circuit after 5 consecutive failures (1 minute cooldown)

---

#### Scenario: Token Limit Exceeded
**Cause:** Conversation history + user message exceeds model's context window

**Detection:**
- Calculate tokens before API call
- Or API returns 400 with "context_length_exceeded" error

**Handling:**
- **System behavior:**
  - Truncate conversation history (keep system prompt + last 10 messages)
  - Retry with truncated context
  - If still fails, summarize history and retry

- **User message:**
  ```
  "Our conversation has gotten quite long. I've summarized our earlier discussion to continue helping you. [Response to current message]"
  ```

- **Logging:**
  ```json
  {
    "level": "warning",
    "error_type": "TOKEN_LIMIT_EXCEEDED",
    "original_tokens": 210000,
    "truncated_tokens": 8000,
    "conversation_id": "uuid",
    "mitigation": "history_truncation"
  }
  ```

- **Retry:**
  - Automatic retry after truncation
  - Max 1 retry (if still fails, ask user to start new conversation)

---

#### Scenario: AI Refusal
**Cause:** AI refuses request due to safety filters (e.g., inappropriate content)

**Detection:**
- AI response contains refusal message
- Or API returns content_policy_violation error

**Handling:**
- **System behavior:**
  - Pass through AI's refusal message
  - Do not retry
  - Flag message for review (if needed)

- **User message:**
  [AI's own refusal message, e.g., "I can't help with that request."]

- **Logging:**
  ```json
  {
    "level": "info",
    "event_type": "AI_REFUSAL",
    "user_message": "[redacted]",
    "ai_response": "I can't help with that",
    "user_id": "uuid"
  }
  ```

- **Retry:** No retry

---

#### Scenario: AI Hallucination (Fabricated Tool Call)
**Cause:** AI attempts to call a tool that doesn't exist

**Detection:**
- Tool name not in MCP_TOOLS registry
- Or AI invents tool parameters not in schema

**Handling:**
- **System behavior:**
  - Reject tool call
  - Send error back to AI: "Tool 'xyz' does not exist. Available tools: [list]"
  - Let AI retry with correct tool

- **User message:**
  - If AI recovers: Normal response
  - If AI fails to recover after 2 attempts: "I'm having trouble processing your request. Could you try rephrasing?"

- **Logging:**
  ```json
  {
    "level": "warning",
    "error_type": "INVALID_TOOL_CALL",
    "attempted_tool": "xyz",
    "available_tools": ["create_task", "get_tasks", ...],
    "conversation_id": "uuid"
  }
  ```

- **Retry:** Allow AI to self-correct (up to 2 attempts)

---

### Tool-Level Errors

#### Scenario: Database Connection Failed
**Cause:** PostgreSQL database is unreachable or connection pool exhausted

**Tool response:**
```json
{
  "success": false,
  "data": null,
  "error": "Database connection failed: unable to reach server at localhost:5432"
}
```

**AI behavior:**
- Receive error from tool
- Inform user that operation couldn't be completed
- Suggest retry

**User message:**
```
"I'm unable to access your tasks right now due to a temporary database issue. Please try again in a moment."
```

**Fallback:**
- No fallback (requires database)
- Return error to user

**Logging:**
```json
{
  "level": "error",
  "error_type": "DATABASE_CONNECTION_FAILED",
  "tool": "get_tasks",
  "database": "postgresql",
  "host": "localhost:5432",
  "user_id": "uuid"
}
```

**Retry:**
- Backend: Tool retries connection 2 times with 500ms delay
- User: Can retry request after 5 seconds

---

#### Scenario: Tool Input Validation Failed
**Cause:** AI provided invalid input to tool (e.g., negative priority)

**Tool response:**
```json
{
  "success": false,
  "data": null,
  "error": "Validation error: priority must be between 0 and 10 (got -5)"
}
```

**AI behavior:**
- Receive validation error
- Self-correct and retry with valid input
- If can't correct, ask user for clarification

**User message:**
- If AI recovers: Normal response
- If can't recover: "Could you clarify the priority for this task? It should be between 0 (low) and 10 (high)."

**Fallback:**
- AI can ask user for correct value

**Logging:**
```json
{
  "level": "info",
  "error_type": "TOOL_VALIDATION_ERROR",
  "tool": "create_task",
  "validation_error": "priority out of range",
  "attempted_value": -5
}
```

**Retry:**
- AI retries with corrected input automatically

---

#### Scenario: Duplicate Task Warning
**Cause:** Tool detects similar task already exists

**Tool response:**
```json
{
  "success": true,
  "data": {"task_id": "uuid"},
  "error": null,
  "warning": "A task with similar title 'Buy groceries' already exists (created 2 hours ago)"
}
```

**AI behavior:**
- Task created successfully despite warning
- Inform user about duplicate

**User message:**
```
"I've created the task 'Buy groceries'. Note: You already have a similar task from earlier today. Would you like to see your tasks?"
```

**Fallback:**
- None (warning only, operation succeeded)

**Logging:**
```json
{
  "level": "info",
  "event_type": "DUPLICATE_TASK_WARNING",
  "tool": "create_task",
  "new_task_id": "uuid",
  "similar_task_id": "uuid",
  "user_id": "uuid"
}
```

---

### API-Level Errors

#### HTTP 400: Bad Request
**Causes:**
- Missing required field (e.g., no `message` in request)
- Invalid field type (e.g., `message` is not a string)
- Field validation failed (e.g., message too long)

**Response body:**
```json
{
  "error": "Validation error: message is required",
  "code": "VALIDATION_ERROR",
  "status": 400,
  "details": {
    "field": "message",
    "constraint": "required"
  }
}
```

**Client handling:**
- Display error to user
- Do NOT retry (client error, won't succeed)

**Retry policy:** No retry

---

#### HTTP 401: Unauthorized
**Causes:**
- Invalid `user_id`
- Missing authentication token (if auth enabled)
- Expired session

**Response body:**
```json
{
  "error": "Unauthorized: invalid user_id",
  "code": "UNAUTHORIZED",
  "status": 401
}
```

**Client handling:**
- Redirect to login
- Clear local session data

**Retry policy:** No retry (must re-authenticate first)

---

#### HTTP 429: Rate Limit Exceeded
**Causes:**
- User exceeded 30 requests/minute
- Token usage exceeded quota

**Response body:**
```json
{
  "error": "Rate limit exceeded: 30 requests per minute",
  "code": "RATE_LIMIT_EXCEEDED",
  "status": 429,
  "retry_after": 15
}
```

**Client handling:**
- Display message: "You're sending messages too quickly. Please wait 15 seconds."
- Disable input for `retry_after` seconds
- Auto-enable input after cooldown

**Retry policy:**
- Retry after `retry_after` seconds
- Exponential backoff if limit exceeded multiple times

---

#### HTTP 500: Internal Server Error
**Causes:**
- Unhandled exception in backend
- Database error not caught by tool
- Unexpected LLM API response

**Response body:**
```json
{
  "error": "Internal server error",
  "code": "INTERNAL_ERROR",
  "status": 500,
  "request_id": "uuid"
}
```

**Client handling:**
- Display generic error: "Something went wrong. Please try again."
- Include request_id in error report (for debugging)

**Retry policy:**
- Retry after 3 seconds (may be transient)
- Max 2 retries with exponential backoff

---

#### HTTP 503: Service Unavailable
**Causes:**
- LLM API is down
- Database is down
- Server is overloaded

**Response body:**
```json
{
  "error": "Service temporarily unavailable",
  "code": "SERVICE_UNAVAILABLE",
  "status": 503,
  "retry_after": 60
}
```

**Client handling:**
- Display: "Service is temporarily unavailable. Please try again in a minute."
- Disable input for `retry_after` seconds

**Retry policy:**
- Retry after `retry_after` seconds
- Use exponential backoff

---

### Error Message Guidelines

**Tone:**
- Helpful and apologetic (not cold or technical)
- Clear about what went wrong
- Actionable (tell user what to do next)

**Format:**
- Start with empathy: "I'm unable to..."
- Explain briefly: "due to a temporary issue"
- Suggest action: "Please try again in a moment"

**Examples:**

✅ **Good:**
- "I'm unable to create that task right now due to a temporary issue. Please try again in a moment."
- "I couldn't find a task with that name. Could you be more specific, or would you like to see all your tasks?"
- "You're sending messages too quickly. Please wait 15 seconds before trying again."

❌ **Bad:**
- "Error 500: Internal server error" (too technical)
- "Task creation failed" (not actionable)
- "Database connection pool exhausted" (exposes internals)
- "An error occurred" (too vague)

**Do NOT expose:**
- Database connection strings
- API keys or tokens
- Internal service names
- Stack traces
- User IDs of other users
```

**Quality Checks:**
- ✅ All error scenarios documented
- ✅ AI-level, tool-level, and API-level errors covered
- ✅ User messages are helpful and actionable
- ✅ Retry policies defined
- ✅ Logging requirements specified
- ✅ Error message guidelines provided

---

## Section 6: Performance & Constraints

**Purpose:** Define performance expectations and system constraints.

```markdown
## Performance & Constraints

### Token Budgets
- **Input tokens per request:** Max 8,000 tokens
- **Output tokens per request:** Max 4,096 tokens
- **Context window:** Claude 3.5: 200K tokens (but limited by cost)
- **Token counting:** Use tiktoken library (approximate for Claude)

### Response Time Targets
- **First token (streaming):** < 500ms (p95)
- **Complete response (non-streaming):** < 5s (p95)
- **Database query time:** < 100ms (p95)
- **Total end-to-end:** < 6s (p95)

### Cost Constraints
- **Cost per request:** Target < $0.02 per request
- **Monthly budget:** $500 for 25,000 requests
- **Model selection:** Use Haiku for simple queries (< $0.001/request)

### Context Window Management
- **History retention:** Last 20 messages (approx. 6,000 tokens)
- **Truncation strategy:** Drop oldest messages first, keep system prompt
- **Summarization:** If conversation exceeds 50 messages, summarize

### Rate Limits
- **User rate limit:** 30 requests/minute
- **LLM API rate limit:** 50 requests/minute (Anthropic tier 2)
- **Database connections:** 20 connection pool size

### Concurrency
- **Max concurrent requests per user:** 3
- **Max concurrent LLM calls (global):** 50
- **Queue depth:** 100 requests (reject if exceeded)

### Observability
**Metrics to track:**
- Request latency (p50, p95, p99)
- Token usage (input/output per request)
- Tool call frequency
- Error rates by type
- Cost per request

**Logging:**
- All requests logged with request_id
- All errors logged with context
- Tool calls logged with input/output
- Token usage logged per request
```

---

## Specification Structure Checklist

Use this checklist to validate your AI system specification:

### ✅ System Overview
- [ ] AI capability summary (2-3 sentences)
- [ ] Integration architecture diagram
- [ ] Model selection with rationale
- [ ] Model capabilities and limitations documented
- [ ] Key dependencies identified

### ✅ System Behavior
- [ ] Agent role and persona defined
- [ ] System prompt written and tested
- [ ] Context management strategy specified
- [ ] Multi-turn conversation handling rules defined
- [ ] Decision-making criteria documented (when to call tools, when to ask questions)

### ✅ API Contracts
- [ ] All endpoints documented (method, path, description)
- [ ] Request schemas complete with examples
- [ ] Response schemas complete (success and error)
- [ ] Streaming protocol specified (if applicable)
- [ ] Error codes defined with HTTP status codes
- [ ] Rate limits documented
- [ ] Timeouts specified
- [ ] Idempotency behavior clarified
- [ ] Example cURL requests provided

### ✅ Tool Contracts
- [ ] All MCP tools documented
- [ ] Each tool has clear "when to use" criteria
- [ ] Input schemas complete (JSON Schema format)
- [ ] Output schemas complete (success and error)
- [ ] Example usage provided for each tool
- [ ] Error handling specified per tool
- [ ] Validation rules defined
- [ ] Side effects documented
- [ ] Idempotency behavior specified

### ✅ Error Rules
- [ ] AI-level errors defined (LLM API failures, token limits, refusals)
- [ ] Tool-level errors defined (DB errors, validation errors)
- [ ] API-level errors defined (4xx and 5xx status codes)
- [ ] User-facing error messages specified
- [ ] Retry policies defined
- [ ] Logging requirements specified
- [ ] Error message guidelines provided

### ✅ Performance & Constraints
- [ ] Token budgets specified
- [ ] Response time targets defined
- [ ] Cost constraints documented
- [ ] Context window management strategy
- [ ] Rate limits specified
- [ ] Concurrency limits defined
- [ ] Observability requirements (metrics, logging)

### ✅ Testing & Validation
- [ ] Test scenarios defined
- [ ] Acceptance criteria specified
- [ ] Success metrics defined
- [ ] Edge cases identified

---

## Common Patterns

### Pattern 1: Conversational Task Management

```markdown
**System Prompt Pattern:**
```
You are a task management assistant. Extract task details from natural language:
- Title: Main task description
- Priority: Infer from urgency words (urgent=8, important=5, normal=0)
- Due date: Parse temporal expressions ("tomorrow", "next week")

Always confirm before creating tasks if details are ambiguous.
```

**Example Interaction:**
User: "I need to finish the Q4 report by Friday"
AI: [Calls create_task with title="Finish Q4 report", due_at="2026-02-07", priority=5]
AI: "I've created a task 'Finish Q4 report' due Friday, Feb 7th."
```

### Pattern 2: Multi-Step Tool Orchestration

```markdown
**Scenario:** User says "Mark my grocery task as done"

**AI Decision Flow:**
1. Call `get_tasks` to find tasks matching "grocery"
2. If multiple matches, ask user which one
3. If single match, call `update_task` with status="completed"
4. Confirm completion to user

**System Prompt Instruction:**
```
When updating or deleting tasks:
1. First call get_tasks to find matching tasks
2. If 0 matches: Inform user no task found
3. If 1 match: Proceed with update/delete
4. If 2+ matches: Ask user to clarify which task
```
```

### Pattern 3: Streaming with Tool Calls

```markdown
**Behavior:**
1. Stream text response tokens as they generate
2. When AI decides to call tool, emit `tool_call` event
3. Backend executes tool (pause streaming)
4. Resume streaming with tool result in context
5. Emit `completion` event when done

**Frontend Handling:**
- Display streaming text immediately
- Show "Using tool: create_task..." during tool execution
- Continue displaying streamed text after tool completes
```

---

## Anti-Patterns

### ❌ Anti-Pattern 1: Vague System Prompt

```
WRONG:
"You are a helpful assistant. Help users with their tasks."
```

**Fix:**
```
CORRECT:
"You are a task management assistant. Your role is to help users create, view, update, and delete tasks through natural conversation.

Available tools: create_task, get_tasks, update_task, delete_task

Guidelines:
- Extract task details from natural language
- Confirm before creating if ambiguous
- Use get_tasks before update/delete to verify
- Format task lists clearly with numbers
- Ask clarifying questions for vague requests

Example:
User: 'Add buy milk to my list'
You: [Call create_task(title='Buy milk')] 'I've added "Buy milk" to your tasks.'"
```

### ❌ Anti-Pattern 2: Missing Error Handling in Tool Contract

```markdown
WRONG:
### Tool: create_task
**Output:**
```json
{"task_id": "uuid"}
```
```

**Fix:**
```markdown
CORRECT:
### Tool: create_task
**Output (Success):**
```json
{
  "success": true,
  "data": {"task_id": "uuid"},
  "error": null
}
```

**Output (Error):**
```json
{
  "success": false,
  "data": null,
  "error": "Database connection failed"
}
```

**Error Handling:**
- Database unavailable: Return error, AI should tell user to retry
- Validation error: Return error with details, AI should ask user to correct
```
```

### ❌ Anti-Pattern 3: No Acceptance Criteria for AI Behavior

```
WRONG:
"The AI should help users with tasks."
```

**Fix:**
```
CORRECT:
**Acceptance Criteria:**
- [ ] Given user says "Create task: X", when AI responds, then task is created in DB
- [ ] Given user says "What tasks do I have?", when AI responds, then all pending tasks are listed
- [ ] Given user says "Delete my task" with 2+ tasks, when AI responds, then AI asks which task to delete
- [ ] Given database is unavailable, when user requests task operation, then AI informs user and suggests retry
```

---

## Success Criteria

### Specification Completeness
- ✅ All sections of the spec template completed
- ✅ All tools documented with schemas
- ✅ All error scenarios defined
- ✅ All API endpoints documented
- ✅ System behavior clearly specified

### Testability
- ✅ All specifications have acceptance criteria
- ✅ AI behavior is observable and measurable
- ✅ Test scenarios cover normal and error cases
- ✅ Success metrics defined

### Implementability
- ✅ Developers can implement from spec without assumptions
- ✅ All tool schemas are complete and unambiguous
- ✅ All API contracts are complete
- ✅ Error handling is comprehensive

### Clarity
- ✅ Non-technical stakeholders understand system behavior
- ✅ Technical team understands implementation requirements
- ✅ No ambiguous language (e.g., "should", "might", "usually")
- ✅ Examples provided for complex scenarios

---

## References

- [Anthropic Tool Use Documentation](https://docs.anthropic.com/claude/docs/tool-use)
- [OpenAPI Specification](https://swagger.io/specification/)
- [JSON Schema](https://json-schema.org/)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)

---

**Last Updated:** 2026-02-05
**Maintained By:** Specification Writing Team
