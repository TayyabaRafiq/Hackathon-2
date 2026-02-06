"""
MCP HTTP Client
Handles HTTP calls to Express backend MCP tool endpoints.
"""

import httpx
import os
from typing import Dict, Any

# Backend Express URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
MCP_BASE_PATH = f"{BACKEND_URL}/mcp"

# HTTP client configuration
client = httpx.AsyncClient(
    timeout=httpx.Timeout(30.0),  # 30 second timeout for MCP tool calls
    follow_redirects=True,
)


class MCPClient:
    """Async HTTP client for calling Express MCP tool endpoints"""

    @staticmethod
    async def call_tool(tool_name: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Call an MCP tool endpoint on Express backend.

        Args:
            tool_name: Tool name (e.g., "add_task", "list_tasks")
            payload: Tool input parameters (will be validated by Express Zod schemas)

        Returns:
            ToolResponse dict with {success, data, error, warning} fields

        Raises:
            httpx.HTTPError: If HTTP request fails
        """
        endpoint = f"{MCP_BASE_PATH}/{tool_name.replace('_', '-')}"

        try:
            response = await client.post(endpoint, json=payload)
            response.raise_for_status()  # Raise for 4xx/5xx errors
            return response.json()
        except httpx.HTTPStatusError as e:
            # Backend returned error status code
            error_detail = "Unknown error"
            try:
                error_body = e.response.json()
                error_detail = error_body.get("error", str(e))
            except Exception:
                error_detail = str(e)

            return {
                "success": False,
                "error": f"MCP tool '{tool_name}' failed: {error_detail}",
            }
        except httpx.RequestError as e:
            # Network error (backend unreachable)
            return {
                "success": False,
                "error": f"Cannot reach backend MCP endpoint: {str(e)}",
            }
        except Exception as e:
            # Unexpected error
            return {
                "success": False,
                "error": f"Unexpected MCP client error: {str(e)}",
            }

    @staticmethod
    async def add_task(
        user_id: str,
        title: str,
        description: str = None,
        priority: str = "normal",
        due_date: str = None,
    ) -> Dict[str, Any]:
        """Call add_task MCP tool"""
        return await MCPClient.call_tool(
            "add_task",
            {
                "user_id": user_id,
                "title": title,
                "description": description,
                "priority": priority,
                "due_date": due_date,
            },
        )

    @staticmethod
    async def list_tasks(
        user_id: str,
        status: str = "pending",
        priority: str = None,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """Call list_tasks MCP tool"""
        return await MCPClient.call_tool(
            "list_tasks",
            {
                "user_id": user_id,
                "status": status,
                "priority": priority,
                "limit": limit,
            },
        )

    @staticmethod
    async def update_task(
        user_id: str,
        task_id: str,
        title: str = None,
        description: str = None,
        priority: str = None,
        status: str = None,
        due_date: str = None,
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
        if priority is not None:
            payload["priority"] = priority
        if status is not None:
            payload["status"] = status
        if due_date is not None:
            payload["due_date"] = due_date

        return await MCPClient.call_tool("update_task", payload)

    @staticmethod
    async def complete_task(user_id: str, task_id: str) -> Dict[str, Any]:
        """Call complete_task MCP tool"""
        return await MCPClient.call_tool(
            "complete_task",
            {
                "user_id": user_id,
                "task_id": task_id,
            },
        )

    @staticmethod
    async def delete_task(user_id: str, task_id: str) -> Dict[str, Any]:
        """Call delete_task MCP tool"""
        return await MCPClient.call_tool(
            "delete_task",
            {
                "user_id": user_id,
                "task_id": task_id,
            },
        )


async def close_client():
    """Close HTTP client (call on app shutdown)"""
    await client.aclose()
