# Feature Specification: AI-Powered Todo Chatbot

**Feature Branch**: `1-ai-chatbot`
**Created**: 2026-02-05
**Status**: Draft
**Input**: User description: "Phase-3 AI-powered Todo Chatbot with Cohere API, MCP tools, natural language understanding, stateless backend, OpenAI ChatKit UI integration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Task via Chat (Priority: P1)

A logged-in user wants to add a new task to their todo list by typing a natural language command in the chat interface.

**Why this priority**: Core functionality - without task creation via chat, the chatbot provides no value. This is the primary use case that differentiates Phase-3 from Phase-2.

**Independent Test**: Can be fully tested by sending "Create task: Buy groceries" in chat and verifying the task appears in the task list. Delivers immediate value as users can create tasks without navigating the traditional UI.

**Acceptance Scenarios**:

1. **Given** user is logged in and chat window is open, **When** user types "Add task: Buy groceries", **Then** chatbot creates task and responds with confirmation message
2. **Given** user is logged in, **When** user types "Create todo: Finish report by Friday", **Then** chatbot creates task with title "Finish report by Friday" and responds with task ID
3. **Given** user is logged in, **When** user types vague command "I need to do something", **Then** chatbot asks for clarification about task details
4. **Given** user is logged in, **When** user types "Add high priority task: Call client", **Then** chatbot creates task with high priority and confirms creation

---

### User Story 2 - List Tasks via Chat (Priority: P1)

A logged-in user wants to view their tasks by asking the chatbot in natural language.

**Why this priority**: Essential for verifying task creation and understanding current workload. Users need to see what tasks exist before updating or completing them.

**Independent Test**: Can be fully tested by asking "What tasks do I have?" and verifying chatbot displays user's task list. Works independently as a read-only query feature.

**Acceptance Scenarios**:

1. **Given** user has 3 pending tasks, **When** user asks "What tasks do I have?", **Then** chatbot lists all 3 pending tasks with titles
2. **Given** user has no tasks, **When** user asks "Show my todos", **Then** chatbot responds "You don't have any tasks yet"
3. **Given** user has completed and pending tasks, **When** user asks "Show completed tasks", **Then** chatbot lists only completed tasks
4. **Given** user has tasks with different priorities, **When** user asks "What are my high priority tasks?", **Then** chatbot lists only high-priority tasks

---

### User Story 3 - Mark Task Complete via Chat (Priority: P2)

A logged-in user wants to mark a task as completed by telling the chatbot.

**Why this priority**: Common workflow action - users frequently complete tasks. However, users can still mark tasks complete via traditional UI if chat is unavailable.

**Independent Test**: Can be fully tested by creating a task, then saying "Mark 'Buy groceries' as done" and verifying task status changes to completed. Delivers value as a hands-free completion method.

**Acceptance Scenarios**:

1. **Given** user has pending task "Buy groceries", **When** user says "Mark Buy groceries as done", **Then** chatbot marks task complete and confirms action
2. **Given** user has multiple tasks with similar names, **When** user says "Complete my task", **Then** chatbot asks which specific task to complete
3. **Given** user has already completed task "Buy groceries", **When** user says "Mark Buy groceries as done", **Then** chatbot informs user task is already complete
4. **Given** user has pending task, **When** user says "I finished the grocery shopping task", **Then** chatbot identifies task by content match and marks it complete

---

### User Story 4 - Update Task via Chat (Priority: P2)

A logged-in user wants to modify an existing task's details through natural language commands.

**Why this priority**: Useful for task maintenance, but not critical for MVP. Users can update tasks via traditional UI if needed.

**Independent Test**: Can be fully tested by creating a task, then saying "Change the priority of 'Buy groceries' to high" and verifying the update. Delivers value for quick task edits without UI navigation.

**Acceptance Scenarios**:

1. **Given** user has task "Buy groceries" with normal priority, **When** user says "Change priority to high for Buy groceries", **Then** chatbot updates priority and confirms change
2. **Given** user has task "Buy groceries", **When** user says "Update task title to Buy groceries and milk", **Then** chatbot updates title and confirms
3. **Given** user has task "Buy groceries", **When** user says "Add description: get organic vegetables", **Then** chatbot updates task description
4. **Given** task doesn't exist, **When** user tries to update non-existent task, **Then** chatbot informs user task not found

---

### User Story 5 - Delete Task via Chat (Priority: P3)

A logged-in user wants to delete a task by asking the chatbot.

**Why this priority**: Nice-to-have feature. Users can delete via traditional UI. Less frequently used than create/list/complete operations.

**Independent Test**: Can be fully tested by creating a task, saying "Delete my grocery task" and verifying task is removed. Delivers value for quick cleanup without UI clicks.

**Acceptance Scenarios**:

1. **Given** user has task "Buy groceries", **When** user says "Delete the Buy groceries task", **Then** chatbot asks for confirmation
2. **Given** user confirmed deletion, **When** chatbot receives confirmation, **Then** chatbot deletes task and confirms deletion
3. **Given** user has multiple tasks, **When** user says "Delete my task" without specifying which, **Then** chatbot asks which task to delete
4. **Given** user says "Cancel" during confirmation, **When** chatbot asks for confirmation, **Then** chatbot cancels deletion and task remains

---

### User Story 6 - Conversation History Persistence (Priority: P1)

A logged-in user wants their chat conversation to persist across sessions so they can reference previous exchanges.

**Why this priority**: Essential for user experience - users expect chat history to be saved like other messaging apps. Without this, every interaction starts fresh, breaking continuity.

**Independent Test**: Can be fully tested by having a conversation, logging out, logging back in, and verifying previous messages are still visible. Delivers value through continuity and context preservation.

**Acceptance Scenarios**:

1. **Given** user had conversation with chatbot yesterday, **When** user logs in today and opens chat, **Then** previous conversation history is displayed
2. **Given** user is mid-conversation, **When** user refreshes the page, **Then** conversation history persists and user can continue
3. **Given** user has very long conversation history, **When** user opens chat, **Then** chatbot displays last 50 messages (pagination)
4. **Given** user starts new conversation, **When** user clicks "New conversation" button, **Then** chatbot starts fresh conversation thread

---

### Edge Cases

- What happens when user is not logged in and tries to access chatbot? → Chatbot icon is hidden or disabled, clicking shows "Please log in" message
- How does system handle when Cohere API is down? → Chatbot displays "AI service temporarily unavailable. Please try again later" and logs error
- What happens when user sends very long message (>5000 characters)? → Frontend truncates at 5000 chars and shows "Message too long" error
- How does chatbot handle ambiguous commands like "Do the thing"? → Chatbot asks for clarification: "I'm not sure what you mean. Could you be more specific?"
- What happens when user asks non-task-related question like "What's the weather?"? → Chatbot responds "I'm a task management assistant. I can help you create, view, update, and delete tasks. How can I help with your tasks?"
- How does system handle when database is unavailable? → Chatbot attempts operation, receives error from MCP tool, displays "Unable to process request. Please try again"
- What happens when user has 100+ tasks and asks "Show all tasks"? → Chatbot returns paginated list (e.g., "You have 120 tasks. Showing first 20...")
- How does chatbot handle profanity or offensive content? → System logs content but does not block (content moderation out of scope for Phase-3)
- What happens when user sends message while previous AI response is still streaming? → New message queued until current response completes
- How does system handle concurrent requests from same user? → Backend queues requests, processes sequentially per user

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & Authorization**

- **FR-001**: System MUST restrict chatbot access to logged-in users only (authenticated via Better Auth session)
- **FR-002**: System MUST verify user identity on every chat request using session-based authentication
- **FR-003**: MCP tools MUST enforce user ownership (users can only access their own tasks)

**Chatbot Interface**

- **FR-004**: Frontend MUST display chatbot icon in the application UI (visible when user is logged in)
- **FR-005**: Clicking chatbot icon MUST open a chat window with message history and input field
- **FR-006**: Chat window MUST display conversation history (user messages and AI responses)
- **FR-007**: Chat input field MUST accept text input up to 5000 characters
- **FR-008**: System MUST provide visual feedback when AI is processing (typing indicator or loading state)
- **FR-009**: Chat window MUST support real-time streaming of AI responses (tokens appear as they generate)

**Natural Language Understanding**

- **FR-010**: AI agent MUST interpret natural language commands for task creation (e.g., "Add task: X", "Create todo: Y")
- **FR-011**: AI agent MUST interpret natural language queries for task listing (e.g., "What tasks do I have?", "Show my todos")
- **FR-012**: AI agent MUST interpret natural language commands for task completion (e.g., "Mark X as done", "Complete task Y")
- **FR-013**: AI agent MUST interpret natural language commands for task updates (e.g., "Change priority of X to high")
- **FR-014**: AI agent MUST interpret natural language commands for task deletion (e.g., "Delete task X")
- **FR-015**: AI agent MUST ask for clarification when user command is ambiguous (e.g., "Delete my task" when user has multiple tasks)

**Backend API Endpoints**

- **FR-016**: Backend MUST provide POST `/api/chat/:userId` endpoint that accepts user message and returns AI response
- **FR-017**: Backend MUST provide GET `/api/conversations/:userId` endpoint that returns user's conversation history
- **FR-018**: POST `/api/chat/:userId` endpoint MUST support streaming responses (Server-Sent Events or similar)
- **FR-019**: All chat API endpoints MUST validate Better Auth session before processing

**MCP Tool Contracts**

- **FR-020**: System MUST provide `add_task` MCP tool with input schema: `{user_id, title, description?, priority?, due_date?}`
- **FR-021**: System MUST provide `list_tasks` MCP tool with input schema: `{user_id, status?, priority?, limit?}`
- **FR-022**: System MUST provide `update_task` MCP tool with input schema: `{user_id, task_id, title?, description?, priority?, status?}`
- **FR-023**: System MUST provide `delete_task` MCP tool with input schema: `{user_id, task_id}`
- **FR-024**: System MUST provide `complete_task` MCP tool with input schema: `{user_id, task_id}`
- **FR-025**: All MCP tools MUST return structured output: `{success: boolean, data?: object, error?: string, warning?: string}`
- **FR-026**: All MCP tools MUST validate inputs using Pydantic or TypeScript validation schemas
- **FR-027**: All MCP tools MUST use Prisma ORM for database operations (no raw SQL queries)
- **FR-028**: All MCP tools MUST verify user_id matches authenticated user before executing operations

**AI Agent Behavior**

- **FR-029**: AI agent MUST use only MCP tools to interact with task data (no direct database access)
- **FR-030**: AI agent MUST maintain conversation context by loading previous messages from database on each request
- **FR-031**: AI agent MUST limit conversation history to last 50 messages to avoid token limit issues
- **FR-032**: AI agent MUST use Cohere API (Command R or Command R+ model) via OpenAI Agents SDK
- **FR-033**: AI agent MUST respond only to task management queries (decline non-task-related requests with helpful message)
- **FR-034**: AI agent MUST confirm destructive operations (e.g., delete task) before executing

**Stateless Backend**

- **FR-035**: Backend MUST NOT store conversation state in memory (all state in PostgreSQL database)
- **FR-036**: Backend MUST load conversation context from database on every request
- **FR-037**: Any backend instance MUST be able to handle any user's request (horizontal scalability)

**Data Persistence**

- **FR-038**: System MUST store conversation metadata in `conversations` table (id, user_id, title, created_at, last_message_at)
- **FR-039**: System MUST store individual messages in `messages` table (id, conversation_id, user_id, role, content, created_at)
- **FR-040**: System MUST link messages to conversations via foreign key (messages.conversation_id → conversations.id)
- **FR-041**: System MUST link messages to users via foreign key (messages.user_id → users.id)
- **FR-042**: System MUST create indexes on frequently queried columns (messages.conversation_id, messages.created_at, conversations.user_id)

**Error Handling**

- **FR-043**: System MUST display user-friendly error messages when AI fails to process request
- **FR-044**: System MUST log all errors with sufficient context for debugging (user_id, message, error details)
- **FR-045**: System MUST retry failed Cohere API requests with exponential backoff (max 3 attempts)
- **FR-046**: MCP tools MUST return error details in structured format (never throw exceptions to AI)
- **FR-047**: Frontend MUST display retry button when chat request fails

**Performance & Rate Limiting**

- **FR-048**: System MUST enforce rate limit of 30 requests per minute per user
- **FR-049**: System MUST return first AI response token within 2 seconds (p95 latency)
- **FR-050**: System MUST support at least 100 concurrent chat conversations

### Key Entities *(data model)*

- **User**: Represents authenticated user (existing from Phase-2: id, email, username, created_at)
- **Task**: Represents todo item (existing from Phase-2: id, user_id, title, description, priority, status, due_date, created_at, updated_at)
- **Conversation**: Represents chat conversation thread (id, user_id, title, created_at, last_message_at)
- **Message**: Represents individual chat message (id, conversation_id, user_id, role ["user" | "assistant"], content, created_at)
- **Relationship: User → Conversations** (one-to-many: one user can have multiple conversations)
- **Relationship: User → Messages** (one-to-many: one user authors many messages)
- **Relationship: Conversation → Messages** (one-to-many: one conversation contains many messages)
- **Relationship: User → Tasks** (one-to-many: existing Phase-2 relationship)

## AI Agent Integration (Cohere + OpenAI Agents SDK)

### Overview

The AI chatbot uses **Cohere API** for natural language understanding and generation, integrated through the **OpenAI Agents SDK** framework. The agent operates as a stateless component that receives user messages, interprets intent, calls MCP tools to perform operations, and returns natural language responses.

### Architecture Flow

```
User (Frontend)
    ↓
POST /api/chat/:userId
    ↓
Backend Express Route Handler
    ↓
Load Conversation History from PostgreSQL
    ↓
OpenAI Agents SDK Runner
    ↓
Cohere API (Command R or Command R+)
    ↓
MCP Tools (add_task, list_tasks, update_task, delete_task, complete_task)
    ↓
Prisma ORM → PostgreSQL Database
    ↓
Tool Results → AI Agent → Natural Language Response
    ↓
Stream Response to Frontend (Server-Sent Events)
    ↓
ChatKit UI Display
```

### Agent Structure

The AI agent is configured using the OpenAI Agents SDK with the following components:

**1. Agent Configuration**

```python
from agents import (
    Agent,
    AsyncOpenAI,
    OpenAIChatCompletionsModel,
    RunConfig,
    Runner,
    function_tool
)

# Configure Cohere API client
client = AsyncOpenAI(
    base_url="https://api.cohere.ai/v1",
    api_key=os.environ.get("COHERE_API_KEY")
)

# Create chat completions model using Cohere
model = OpenAIChatCompletionsModel(
    model="command-r-plus",  # or "command-r" for faster, lower-cost option
    client=client
)

# Define agent with system prompt
agent = Agent(
    name="TodoTaskAgent",
    instructions="""You are a helpful task management assistant. Your role is to help users:
    - Create new tasks
    - View their task list
    - Update task details
    - Mark tasks as complete
    - Delete tasks

    Guidelines:
    - Use the provided MCP tools to interact with the task database
    - Always verify user_id before performing operations
    - Ask for clarification if user's intent is unclear
    - Format task lists in a readable, numbered format
    - Confirm destructive operations (like delete) before executing
    - Decline non-task-related queries politely

    Available tools:
    - add_task: Create a new task
    - list_tasks: Retrieve user's tasks (filtered by status, priority)
    - update_task: Modify task details
    - complete_task: Mark task as completed
    - delete_task: Remove a task

    Examples:
    User: "Create task: Buy groceries"
    You: [Call add_task] "I've created the task 'Buy groceries' for you."

    User: "What tasks do I have?"
    You: [Call list_tasks] "You have 3 pending tasks: 1. Buy groceries, 2. Finish report, 3. Call dentist"
    """,
    model=model,
    tools=[add_task, list_tasks, update_task, complete_task, delete_task]
)
```

**2. MCP Tool Definitions**

Each MCP tool is defined as a Python function decorated with `@function_tool`:

```python
@function_tool
def add_task(user_id: str, title: str, description: str = None, priority: str = "normal", due_date: str = None):
    """
    Create a new task for the user.

    Args:
        user_id: User ID (UUID string)
        title: Task title (required)
        description: Optional task description
        priority: Task priority (low, normal, high)
        due_date: Optional due date (ISO 8601 format)

    Returns:
        dict: {success: bool, data: {task_id: str}, error: str}
    """
    # Call backend MCP tool implementation via HTTP or direct function call
    # Backend validates inputs with Zod, uses Prisma to insert into PostgreSQL
    result = backend_mcp_call("add_task", {
        "user_id": user_id,
        "title": title,
        "description": description,
        "priority": priority,
        "due_date": due_date
    })
    return result

@function_tool
def list_tasks(user_id: str, status: str = "pending", priority: str = None, limit: int = 50):
    """
    Retrieve user's tasks filtered by status and priority.

    Args:
        user_id: User ID (UUID string)
        status: Filter by status (pending, completed, all)
        priority: Optional priority filter (low, normal, high)
        limit: Maximum tasks to return (default 50)

    Returns:
        dict: {success: bool, data: {tasks: list, total_count: int}, error: str}
    """
    result = backend_mcp_call("list_tasks", {
        "user_id": user_id,
        "status": status,
        "priority": priority,
        "limit": limit
    })
    return result

@function_tool
def update_task(user_id: str, task_id: str, title: str = None, description: str = None, priority: str = None, status: str = None):
    """
    Update an existing task's details.

    Args:
        user_id: User ID (UUID string)
        task_id: Task ID to update (UUID string)
        title: New task title (optional)
        description: New description (optional)
        priority: New priority (optional)
        status: New status (optional)

    Returns:
        dict: {success: bool, data: {task_id: str}, error: str}
    """
    result = backend_mcp_call("update_task", {
        "user_id": user_id,
        "task_id": task_id,
        "title": title,
        "description": description,
        "priority": priority,
        "status": status
    })
    return result

@function_tool
def complete_task(user_id: str, task_id: str):
    """
    Mark a task as completed.

    Args:
        user_id: User ID (UUID string)
        task_id: Task ID to complete (UUID string)

    Returns:
        dict: {success: bool, data: {task_id: str}, error: str}
    """
    result = backend_mcp_call("complete_task", {
        "user_id": user_id,
        "task_id": task_id
    })
    return result

@function_tool
def delete_task(user_id: str, task_id: str):
    """
    Delete a task (soft delete).

    Args:
        user_id: User ID (UUID string)
        task_id: Task ID to delete (UUID string)

    Returns:
        dict: {success: bool, data: {task_id: str}, error: str}
    """
    result = backend_mcp_call("delete_task", {
        "user_id": user_id,
        "task_id": task_id
    })
    return result
```

**3. Agent Execution (Runner)**

```python
# Run agent with user message and conversation context
async def handle_chat_request(user_id: str, message: str, conversation_id: str = None):
    """
    Handle a chat request by running the AI agent.

    Args:
        user_id: Authenticated user ID
        message: User's message text
        conversation_id: Optional conversation ID for context

    Returns:
        Async generator yielding response tokens (for streaming)
    """
    # Load conversation history from database
    conversation_history = await load_conversation_history(user_id, conversation_id, limit=50)

    # Build messages list (system + history + current message)
    messages = [
        {"role": "system", "content": agent.instructions}
    ]

    for msg in conversation_history:
        messages.append({
            "role": msg.role,  # "user" or "assistant"
            "content": msg.content
        })

    messages.append({
        "role": "user",
        "content": message
    })

    # Configure run settings
    run_config = RunConfig(
        max_turns=5,  # Allow up to 5 tool calls per conversation turn
        stream=True   # Enable streaming responses
    )

    # Run agent with streaming
    async for chunk in Runner.run_stream(
        agent=agent,
        messages=messages,
        context={"user_id": user_id},  # Pass user_id to tools
        config=run_config
    ):
        if chunk.type == "content":
            # Stream text tokens to frontend
            yield chunk.delta

        elif chunk.type == "tool_call":
            # Log tool execution for debugging
            print(f"Tool called: {chunk.tool_name} with args {chunk.tool_args}")

        elif chunk.type == "tool_result":
            # Log tool result
            print(f"Tool result: {chunk.result}")

    # Save user message and assistant response to database
    await save_messages_to_db(user_id, conversation_id, message, assistant_response)
```

### Backend Integration Points

**1. POST /api/chat/:userId Endpoint**

```typescript
// Backend Express route handler (TypeScript)
app.post('/api/chat/:userId', async (req, res) => {
    const { userId } = req.params;
    const { message, conversation_id } = req.body;

    // Validate Better Auth session
    const session = await validateSession(req);
    if (!session || session.userId !== userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Set up Server-Sent Events for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        // Call Python agent runner (via subprocess, HTTP, or embedded)
        for await (const token of handleChatRequest(userId, message, conversation_id)) {
            res.write(`data: ${JSON.stringify({ type: 'token', content: token })}\n\n`);
        }

        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
        res.end();

    } catch (error) {
        res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
        res.end();
    }
});
```

**2. MCP Tool Backend Implementation (TypeScript)**

Each MCP tool has a corresponding TypeScript function in the backend:

```typescript
// backend/src/mcp-tools/task-tools.ts
import { z } from 'zod';
import { prisma } from '../db';

// Input validation schemas
const AddTaskSchema = z.object({
    user_id: z.string().uuid(),
    title: z.string().min(1).max(500),
    description: z.string().max(5000).optional(),
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
    due_date: z.string().datetime().optional()
});

export async function add_task(input: unknown) {
    try {
        // Validate input
        const data = AddTaskSchema.parse(input);

        // Create task in database using Prisma
        const task = await prisma.task.create({
            data: {
                userId: data.user_id,
                title: data.title,
                description: data.description,
                priority: data.priority,
                dueDate: data.due_date ? new Date(data.due_date) : null,
                status: 'pending'
            }
        });

        return {
            success: true,
            data: { task_id: task.id },
            error: null
        };

    } catch (error) {
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : 'Failed to create task'
        };
    }
}

// Similar implementations for list_tasks, update_task, complete_task, delete_task
```

### Frontend Integration (ChatKit UI)

**1. Chatbot Icon & Window**

```tsx
// frontend/app/components/ChatbotIcon.tsx
'use client';

import { useState } from 'react';
import { ChatContainer, MessageList, MessageInput } from '@chatscope/chat-ui-kit-react';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';

export function ChatbotIcon() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating chatbot icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 w-14 h-14 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700"
            >
                <span className="text-white text-2xl">💬</span>
            </button>

            {/* Chat window */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl">
                    <ChatWindow onClose={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
}
```

**2. Streaming Message Handler**

```tsx
// frontend/app/components/ChatWindow.tsx
async function sendMessage(message: string) {
    const userId = session.userId;  // From Better Auth
    const response = await fetch(`/api/chat/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantMessage = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const event = JSON.parse(line.slice(6));

                if (event.type === 'token') {
                    assistantMessage += event.content;
                    // Update UI with streaming token
                    updateStreamingMessage(assistantMessage);
                }

                if (event.type === 'done') {
                    // Finalize message
                    addMessageToHistory('assistant', assistantMessage);
                }

                if (event.type === 'error') {
                    showError(event.message);
                }
            }
        }
    }
}
```

### Key Implementation Notes

1. **Cohere API Configuration**: Use Command R+ for better reasoning or Command R for faster, lower-cost responses
2. **Stateless Design**: Agent loads conversation context from database on every request (no in-memory state)
3. **Tool Security**: All MCP tools validate `user_id` matches authenticated session before database operations
4. **Error Handling**: Tools return structured errors (never throw exceptions to AI agent)
5. **Streaming**: Server-Sent Events (SSE) for real-time token streaming to frontend
6. **Context Window**: Limit conversation history to last 50 messages to avoid token limits

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Logged-in users can create a task via chat in under 10 seconds (including AI response time)
- **SC-002**: 95% of natural language task commands are correctly interpreted by AI on first attempt
- **SC-003**: Chat response streaming begins within 2 seconds of user sending message (p95 latency)
- **SC-004**: Conversation history persists across sessions (user can log out and log back in without losing context)
- **SC-005**: System handles 100 concurrent chat conversations without performance degradation
- **SC-006**: AI chatbot correctly declines non-task-related queries with helpful redirect message
- **SC-007**: Users can complete task management workflow (create → list → complete) entirely through chat interface
- **SC-008**: Zero unauthorized task access incidents (all MCP tools enforce user ownership)
- **SC-009**: 90% of ambiguous commands result in chatbot asking clarifying question (not guessing incorrectly)
- **SC-010**: Backend remains stateless (any server instance can handle any user's request after deployment)
- **SC-011**: Chat interface loads and displays last 50 messages within 3 seconds
- **SC-012**: System maintains 99.5% uptime for chat functionality (excluding Cohere API downtime)

## Assumptions

- **ASSUMPTION-001**: Users are familiar with basic chat interfaces (typing messages, viewing history)
- **ASSUMPTION-002**: Cohere API provides reliable service with >99% uptime (Phase-3 does not implement fallback AI provider)
- **ASSUMPTION-003**: OpenAI Agents SDK is compatible with Cohere API (verified during planning phase)
- **ASSUMPTION-004**: Better Auth session management is already implemented and working in Phase-2
- **ASSUMPTION-005**: Existing Phase-2 task CRUD operations work correctly (Phase-3 extends, not replaces)
- **ASSUMPTION-006**: PostgreSQL (Neon) database has sufficient capacity for conversation/message storage
- **ASSUMPTION-007**: Users will primarily interact with chatbot in English (multi-language support out of scope)
- **ASSUMPTION-008**: Message content filtering/moderation is out of scope for Phase-3 (basic profanity handled gracefully)
- **ASSUMPTION-009**: Conversation history older than 90 days may be archived (data retention policy TBD)
- **ASSUMPTION-010**: Frontend users have modern browsers supporting Server-Sent Events or WebSocket for streaming

## Out of Scope (Phase-3)

- **Voice input/output** for chatbot (text-only in Phase-3)
- **Multi-user conversations** or task sharing (one user per conversation)
- **AI code generation** or execution capabilities (task management only)
- **Analytics dashboard** for chat usage metrics (basic logging only)
- **Mobile app** for chatbot (web interface only in Phase-3)
- **Multi-language support** (English only in Phase-3)
- **Advanced NLP features** like sentiment analysis or intent classification beyond task management
- **Chatbot personality customization** (single default persona)
- **Integration with external calendars** or task management tools (standalone system)
- **Conversation export** or download functionality (view-only in Phase-3)

## Dependencies

- **DEP-001**: Phase-2 backend (Node.js + Express + TypeScript + Prisma + PostgreSQL) must be deployed and functional
- **DEP-002**: Better Auth session management must be configured and working
- **DEP-003**: Cohere API account and API key must be obtained before implementation
- **DEP-004**: OpenAI Agents SDK must support Cohere API integration (verify during planning)
- **DEP-005**: OpenAI ChatKit UI library must be compatible with Next.js 14 App Router
- **DEP-006**: Neon PostgreSQL database must support new tables (conversations, messages) without schema conflicts
- **DEP-007**: Hugging Face Space deployment environment must support Docker containers with Node.js

## Risks & Mitigations

- **RISK-001**: Cohere API rate limits may restrict concurrent users → Mitigation: Implement request queuing and user-level rate limiting (30 req/min)
- **RISK-002**: OpenAI Agents SDK may not support Cohere API → Mitigation: Verify compatibility in planning phase; fallback to direct Cohere SDK if needed
- **RISK-003**: Streaming responses may not work in all browsers → Mitigation: Implement fallback to non-streaming mode with loading indicators
- **RISK-004**: AI may misinterpret complex natural language commands → Mitigation: Provide clarification prompts and allow users to rephrase
- **RISK-005**: MCP tool implementation may be complex in TypeScript backend → Mitigation: Use Zod for validation (TypeScript equivalent of Pydantic)
- **RISK-006**: Conversation history may grow too large, exceeding token limits → Mitigation: Implement sliding window (last 50 messages) and conversation archiving
- **RISK-007**: Database schema changes may conflict with Phase-2 schema → Mitigation: Use Prisma migrations with careful review before deployment

## Next Steps

1. **Clarification Phase** (`/sp.clarify`): Resolve any [NEEDS CLARIFICATION] markers (if present)
2. **Planning Phase** (`/sp.plan`): Design detailed architecture, API endpoints, MCP tool contracts, database schema
3. **Task Breakdown** (`/sp.tasks`): Create testable, atomic tasks for implementation
4. **Implementation Phase**: Execute tasks following SDD principles
5. **Testing Phase**: Validate all acceptance scenarios and success criteria
6. **Deployment Phase**: Deploy to Hugging Face Space (backend) and Vercel (frontend)
