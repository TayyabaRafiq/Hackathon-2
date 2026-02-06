"""
Chat Routes
Handles AI chat requests with streaming responses.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatErrorResponse
from app.agent.runner import run_agent_with_streaming
import json

router = APIRouter()


@router.post("/chat")
async def chat(request: ChatRequest):
    """
    Handle chat request with AI agent and stream response via SSE
    """
    try:
        # Validate request
        if not request.message or len(request.message) == 0:
            raise HTTPException(status_code=400, detail="Message is required")

        if len(request.message) > 5000:
            raise HTTPException(status_code=400, detail="Message too long (max 5000 characters)")

        # Stream AI response
        async def event_generator():
            """Generate SSE events from agent"""
            try:
                async for event in run_agent_with_streaming(
                    user_id=request.user_id,
                    message=request.message,
                    context=[msg.dict() for msg in request.context],
                ):
                    # Format as SSE event
                    event_data = json.dumps(event)
                    yield f"data: {event_data}\n\n"

            except Exception as e:
                # Error during streaming
                error_event = {
                    "type": "error",
                    "message": str(e),
                    "code": "INTERNAL_ERROR",
                }
                yield f"data: {json.dumps(error_event)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
