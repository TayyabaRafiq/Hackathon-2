"""
MCP Tool Definitions for Cohere Agent
Defines function tools that the AI can call to perform task operations.
"""

from typing import Optional, Dict, Any
from app.services.mcp_client import MCPClient

# Tool definitions for Cohere's native function calling


def get_add_task_tool() -> Dict[str, Any]:
    """
    Tool definition for adding a task
    Cohere format: {name, description, parameter_definitions}
    """
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
            "priority": {
                "description": "Task priority level: low, normal, or high",
                "type": "str",
                "required": False,
            },
            "due_date": {
                "description": "Task due date in ISO 8601 format (optional)",
                "type": "str",
                "required": False,
            },
        },
    }


def get_list_tasks_tool() -> Dict[str, Any]:
    """Tool definition for listing tasks"""
    return {
        "name": "list_tasks",
        "description": "Retrieve the user's tasks. Use this when the user asks to see, show, or list their tasks or todos.",
        "parameter_definitions": {
            "user_id": {
                "description": "The ID of the authenticated user",
                "type": "str",
                "required": True,
            },
            "status": {
                "description": "Filter by status: pending, completed, or all",
                "type": "str",
                "required": False,
            },
            "priority": {
                "description": "Filter by priority: low, normal, or high",
                "type": "str",
                "required": False,
            },
            "limit": {
                "description": "Maximum number of tasks to return (default: 50)",
                "type": "int",
                "required": False,
            },
        },
    }


def get_complete_task_tool() -> Dict[str, Any]:
    """Tool definition for marking a task as complete"""
    return {
        "name": "complete_task",
        "description": "Mark a task as completed. Use this when the user wants to mark, complete, finish, or check off a task.",
        "parameter_definitions": {
            "user_id": {
                "description": "The ID of the authenticated user",
                "type": "str",
                "required": True,
            },
            "task_id": {
                "description": "The ID of the task to complete",
                "type": "str",
                "required": True,
            },
        },
    }


def get_update_task_tool() -> Dict[str, Any]:
    """Tool definition for updating a task"""
    return {
        "name": "update_task",
        "description": "Update a task's details (title, description, priority, or status). Use this when the user wants to change or modify a task.",
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
            "priority": {
                "description": "New priority: low, normal, or high (optional)",
                "type": "str",
                "required": False,
            },
            "status": {
                "description": "New status: pending or completed (optional)",
                "type": "str",
                "required": False,
            },
        },
    }


def get_delete_task_tool() -> Dict[str, Any]:
    """Tool definition for deleting a task"""
    return {
        "name": "delete_task",
        "description": "Delete a task permanently. IMPORTANT: Always ask for user confirmation before calling this tool.",
        "parameter_definitions": {
            "user_id": {
                "description": "The ID of the authenticated user",
                "type": "str",
                "required": True,
            },
            "task_id": {
                "description": "The ID of the task to delete",
                "type": "str",
                "required": True,
            },
        },
    }


# Get all tools
def get_all_tools() -> list[Dict[str, Any]]:
    """Return all available MCP tools for Cohere agent"""
    return [
        get_add_task_tool(),
        get_list_tasks_tool(),
        get_complete_task_tool(),
        get_update_task_tool(),
        get_delete_task_tool(),
    ]


# Tool execution handlers
async def execute_tool(tool_name: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute a tool by calling the appropriate MCP client method
    Returns ToolResponse dict
    """
    try:
        if tool_name == "add_task":
            return await MCPClient.add_task(
                user_id=parameters["user_id"],
                title=parameters["title"],
                description=parameters.get("description"),
                priority=parameters.get("priority", "normal"),
                due_date=parameters.get("due_date"),
            )

        elif tool_name == "list_tasks":
            return await MCPClient.list_tasks(
                user_id=parameters["user_id"],
                status=parameters.get("status", "pending"),
                priority=parameters.get("priority"),
                limit=parameters.get("limit", 50),
            )

        elif tool_name == "complete_task":
            return await MCPClient.complete_task(
                user_id=parameters["user_id"],
                task_id=parameters["task_id"],
            )

        elif tool_name == "update_task":
            return await MCPClient.update_task(
                user_id=parameters["user_id"],
                task_id=parameters["task_id"],
                title=parameters.get("title"),
                description=parameters.get("description"),
                priority=parameters.get("priority"),
                status=parameters.get("status"),
            )

        elif tool_name == "delete_task":
            return await MCPClient.delete_task(
                user_id=parameters["user_id"],
                task_id=parameters["task_id"],
            )

        else:
            return {
                "success": False,
                "error": f"Unknown tool: {tool_name}",
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Tool execution error: {str(e)}",
        }
