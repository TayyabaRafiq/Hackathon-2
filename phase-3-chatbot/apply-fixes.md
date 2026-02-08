# TodoFlow Phase 3 - Critical Fixes

## Fix 1: Backend Stream Handling (CRITICAL)

**File:** `backend/src/services/aiServiceClient.ts`

Replace entire file with:

```typescript
import fetch from "node-fetch";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8001";

interface ChatRequest {
  user_id: string;
  message: string;
  conversation_id?: string;
  context: any[];
}

export async function proxyChatToAIService(
  payload: ChatRequest,
  res: any
) {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: payload.user_id,
        message: payload.message,
        conversation_id: payload.conversation_id,
        context: payload.context,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`AI Service error: ${response.status}`);
    }

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream response body to client (node-fetch v3 uses web streams)
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Write chunk to response
        const chunk = decoder.decode(value, { stream: true });
        res.write(chunk);
      }
    } finally {
      reader.releaseLock();
      res.end();
    }
  } catch (error: any) {
    console.error("❌ AI Service Proxy Error:", error);

    // Send error event if headers not sent yet
    if (!res.headersSent) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
    }

    res.write(`data: ${JSON.stringify({
      type: "error",
      message: "AI service unavailable",
      code: "AI_SERVICE_ERROR"
    })}\n\n`);
    res.end();
  }
}
```

---

## Fix 2: Remove Schema Mismatch Fields

**File:** `ai-service/app/agent/tools.py`

Remove `priority` and `due_date` from all tool definitions:

```python
# Line 36-47: Update get_add_task_tool
def get_add_task_tool() -> Dict[str, Any]:
    return {
        "name": "add_task",
        "description": "Create a new task for the user. Use this when the user wants to add, create, or make a new todo item.",
        "parameter_definitions": {
            "user_id": {
                "description": "The ID of the authenticated user",
                "type": "str",
                "required": True,
            },
            "title": {
                "description": "The task title or description (what needs to be done)",
                "type": "str",
                "required": True,
            },
            "description": {
                "description": "Additional details about the task (optional)",
                "type": "str",
                "required": False,
            },
            # REMOVED: priority and due_date
        },
    }

# Lines 100-137: Update get_update_task_tool
def get_update_task_tool() -> Dict[str, Any]:
    return {
        "name": "update_task",
        "description": "Update a task's details (title, description, or status). Use this when the user wants to change or modify a task.",
        "parameter_definitions": {
            "user_id": {
                "description": "The ID of the authenticated user",
                "type": "str",
                "required": True,
            },
            "task_id": {
                "description": "The ID of the task to update",
                "type": "str",
                "required": True,
            },
            "title": {
                "description": "New task title (optional)",
                "type": "str",
                "required": False,
            },
            "description": {
                "description": "New task description (optional)",
                "type": "str",
                "required": False,
            },
            "status": {
                "description": "New status: pending or completed (optional)",
                "type": "str",
                "required": False,
            },
            # REMOVED: priority
        },
    }

# Lines 179-228: Update execute_tool to remove priority/due_date
async def execute_tool(tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    try:
        if tool_name == "add_task":
            return await MCPClient.add_task(
                user_id=parameters["user_id"],
                title=parameters["title"],
                description=parameters.get("description"),
                # REMOVED: priority and due_date
            )

        elif tool_name == "update_task":
            return await MCPClient.update_task(
                user_id=parameters["user_id"],
                task_id=parameters["task_id"],
                title=parameters.get("title"),
                description=parameters.get("description"),
                status=parameters.get("status"),
                # REMOVED: priority
            )

        # ... rest unchanged
```

**File:** `ai-service/app/services/mcp_client.py`

Update method signatures:

```python
# Lines 72-89: Update add_task
@staticmethod
async def add_task(
    user_id: str,
    title: str,
    description: str = None,
) -> Dict[str, Any]:
    """Call add_task MCP tool"""
    return await MCPClient.call_tool(
        "add_task",
        {
            "user_id": user_id,
            "title": title,
            "description": description,
            # REMOVED: priority, due_date
        },
    )

# Lines 110-136: Update update_task
@staticmethod
async def update_task(
    user_id: str,
    task_id: str,
    title: str = None,
    description: str = None,
    status: str = None,
) -> Dict[str, Any]:
    """Call update_task MCP tool"""
    payload = {
        "user_id": user_id,
        "task_id": task_id,
    }
    if title is not None:
        payload["title"] = title
    if description is not None:
        payload["description"] = description
    if status is not None:
        payload["status"] = status
    # REMOVED: priority, due_date

    return await MCPClient.call_tool("update_task", payload)
```

**File:** `backend/src/schemas/mcpTools.ts`

Remove priority and due_date:

```typescript
// Lines 8-17: Update AddTaskInputSchema
export const AddTaskInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  title: z.string().min(1, "Title is required").max(500, "Title too long (max 500 chars)"),
  description: z.string().max(5000, "Description too long (max 5000 chars)").optional(),
  // REMOVED: priority and due_date
});

// Lines 29-38: Update UpdateTaskInputSchema
export const UpdateTaskInputSchema = z.object({
  user_id: z.string().cuid("Invalid user ID format"),
  task_id: z.string().cuid("Invalid task ID format"),
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(["pending", "completed"]).optional(),
  // REMOVED: priority and due_date
});
```

---

## Fix 3: Add Message/Conversation IDs to AI Service

**File:** `ai-service/app/agent/runner.py`

Add at top:
```python
import uuid
```

Update function signature (line 53):
```python
async def run_agent_with_streaming(
    user_id: str,
    message: str,
    conversation_id: str,  # ADD THIS
    context: List[Dict[str, str]],
) -> AsyncGenerator[Dict[str, Any], None]:
```

Add after line 60:
```python
    # Generate message ID for persistence
    message_id = str(uuid.uuid4())
```

Update done event (line 146):
```python
    # Done
    yield {
        "type": "done",
        "message_id": message_id,
        "conversation_id": conversation_id or "new",
    }
    return
```

**File:** `ai-service/app/routes/chat.py`

Update line 32:
```python
async for event in run_agent_with_streaming(
    user_id=request.user_id,
    message=request.message,
    conversation_id=request.conversation_id,  # ADD THIS
    context=[msg.dict() for msg in request.context],
):
```

---

## Fix 4: Use Prisma Singleton

**File:** `backend/src/services/mcpTools.ts`

Line 19:
```typescript
// REMOVE:
const prisma = new PrismaClient();

// ADD:
import { prisma } from "../lib/prisma.js";
```

**File:** `backend/src/services/conversationService.ts`

Line 3:
```typescript
// REMOVE:
const prisma = new PrismaClient();

// ADD:
import { prisma } from "../lib/prisma.js";
```

---

## Fix 5: Frontend Fixes

**File:** `frontend/app/components/ChatWindow.tsx`

Line 88:
```typescript
// REMOVE:
id: Math.random().toString(),

// ADD:
id: crypto.randomUUID(),
```

**File:** `frontend/app/page.tsx`

Line 5:
```typescript
// REMOVE:
<div className="min-h-screen bg-linear-to-b from-white to-neutral-50">

// ADD:
<div className="min-h-screen bg-gradient-to-b from-white to-neutral-50">
```

---

## Summary of Changes

✅ Backend: Fixed SSE streaming with proper web streams API
✅ AI Service: Removed priority/due_date fields (schema mismatch)
✅ AI Service: Added message_id and conversation_id to done event
✅ Backend: Fixed duplicate PrismaClient instances
✅ Frontend: Fixed random ID generation
✅ Frontend: Fixed CSS gradient typo
