"""
Cohere Agent Runner
Handles AI agent execution with native Cohere tool calling and streaming.
"""

import cohere
import asyncio
from typing import AsyncGenerator, Dict, Any, List
from app.agent.config import COHERE_API_KEY, COHERE_MODEL, MAX_AGENT_TURNS, MAX_RETRIES, RETRY_DELAYS
from app.agent.tools import get_all_tools, execute_tool

# Initialize Cohere client
co = cohere.AsyncClient(api_key=COHERE_API_KEY)

# System prompt for task management assistant
SYSTEM_PROMPT = """You are a helpful task management assistant for TodoFlow. Your role is to help users manage their todo list through natural conversation.

**Available Actions:**
- Create tasks with title, description, priority, and due date
- List tasks (filtered by status or priority)
- Update task details (title, description, priority, status)
- Mark tasks as complete
- Delete tasks (ALWAYS ask for confirmation first)

**Guidelines:**
1. **Be helpful and conversational** - Use natural language, not robotic responses
2. **Ask for clarification** - If the user's request is unclear or ambiguous, ask specific questions
3. **Confirm destructive actions** - Before deleting a task, ask "Are you sure you want to delete this task?"
4. **Format task lists clearly** - When listing tasks, use numbered lists with clear formatting
5. **Handle errors gracefully** - If a tool call fails, explain the error and suggest next steps
6. **Stay focused on tasks** - Politely decline requests unrelated to task management

**Examples:**

User: "Add task: Buy groceries"
You: [Call add_task(title="Buy groceries")] → "I've created the task 'Buy groceries' for you! ✓"

User: "What tasks do I have?"
You: [Call list_tasks(status="pending")] → "You have 3 pending tasks:
1. Buy groceries
2. Finish report
3. Call dentist"

User: "Mark the first task as done"
You: [Call list_tasks first to identify task_id, then complete_task] → "Great! I've marked 'Buy groceries' as complete. ✓"

User: "Delete the report task"
You: "Are you sure you want to delete the 'Finish report' task? This cannot be undone."

**Important:** Always use tools to interact with tasks. Never assume or make up task data."""


async def run_agent_with_streaming(
    user_id: str,
    message: str,
    context: List[Dict[str, str]],
) -> AsyncGenerator[Dict[str, Any], None]:
    """
    Run Cohere agent with streaming response
    Yields SSE events: {type: "token"|"tool_call"|"done"|"error", ...}
    """
    # Build conversation history
    chat_history = []
    for msg in context:
        chat_history.append({
            "role": "USER" if msg["role"] == "user" else "CHATBOT",
            "message": msg["content"],
        })

    # Get tool definitions
    tools = get_all_tools()

    # Retry loop for Cohere API errors
    for attempt in range(MAX_RETRIES):
        try:
            # Stream chat with tool use
            response = co.chat_stream(
                model=COHERE_MODEL,
                message=message,
                preamble=SYSTEM_PROMPT,
                chat_history=chat_history,
                tools=tools,
            )

            # Variables to track tool calls
            tool_calls = []
            current_text = ""

            async for event in response:
                # Text generation event
                if event.event_type == "text-generation":
                    if hasattr(event, "text") and event.text:
                        current_text += event.text
                        yield {
                            "type": "token",
                            "content": event.text,
                        }

                # Tool call event
                elif event.event_type == "tool-calls-generation":
                    if hasattr(event, "tool_calls") and event.tool_calls:
                        for tool_call in event.tool_calls:
                            tool_calls.append(tool_call)
                            yield {
                                "type": "tool_call",
                                "tool_name": tool_call.name,
                                "parameters": tool_call.parameters,
                            }

                # Stream end event
                elif event.event_type == "stream-end":
                    # Execute any tool calls
                    if tool_calls:
                        tool_results = []
                        for tool_call in tool_calls:
                            result = await execute_tool(tool_call.name, tool_call.parameters)
                            tool_results.append({
                                "call": tool_call,
                                "outputs": [result],
                            })

                        # Get follow-up response after tool execution
                        follow_up = co.chat_stream(
                            model=COHERE_MODEL,
                            message="",  # Empty message for tool result processing
                            preamble=SYSTEM_PROMPT,
                            chat_history=chat_history + [
                                {"role": "USER", "message": message},
                                {"role": "CHATBOT", "message": current_text, "tool_calls": tool_calls},
                            ],
                            tools=tools,
                            tool_results=tool_results,
                        )

                        # Stream follow-up response
                        async for follow_event in follow_up:
                            if follow_event.event_type == "text-generation":
                                if hasattr(follow_event, "text") and follow_event.text:
                                    yield {
                                        "type": "token",
                                        "content": follow_event.text,
                                    }

                    # Done
                    yield {
                        "type": "done",
                    }
                    return

            # Success - exit retry loop
            return

        except Exception as e:
            error_str = str(e).lower()
            # Rate limit error - retry with backoff
            if "rate limit" in error_str or "too many requests" in error_str or "429" in error_str:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_DELAYS[attempt])
                    continue
                else:
                    yield {
                        "type": "error",
                        "message": "Rate limit exceeded. Please try again in a moment.",
                        "code": "RATE_LIMIT",
                    }
                    return
            else:
                yield {
                    "type": "error",
                    "message": f"AI service error: {str(e)}",
                    "code": "INTERNAL_ERROR",
                }
                return
