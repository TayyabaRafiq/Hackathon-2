"""
Pydantic Schemas for AI Service
Defines request/response models for chat API endpoints.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class ChatMessage(BaseModel):
    """Individual chat message in conversation history"""

    role: Literal["user", "assistant", "system"]
    content: str


class ChatRequest(BaseModel):
    """Request body for POST /ai/chat endpoint"""

    user_id: str = Field(..., description="Authenticated user ID (validated by Express)")
    message: str = Field(
        ..., min_length=1, max_length=5000, description="User's chat message"
    )
    conversation_id: Optional[str] = Field(
        None, description="Optional conversation ID (creates new if omitted)"
    )
    context: List[ChatMessage] = Field(
        default_factory=list,
        description="Conversation history (last N messages from database)",
    )


class ChatResponse(BaseModel):
    """Response body for successful chat completion (non-streaming)"""

    message: str = Field(..., description="AI assistant's response")
    conversation_id: str = Field(..., description="Conversation ID for this exchange")
    message_id: str = Field(..., description="Message ID for persistence")


class ChatErrorResponse(BaseModel):
    """Error response when chat fails"""

    error: str = Field(..., description="User-friendly error message")
    code: Literal[
        "AI_SERVICE_DOWN",
        "COHERE_API_ERROR",
        "RATE_LIMIT",
        "VALIDATION_ERROR",
        "INTERNAL_ERROR",
    ]
    details: Optional[str] = Field(None, description="Technical error details for debugging")


class StreamEvent(BaseModel):
    """Server-Sent Event for streaming responses"""

    type: Literal["token", "done", "error"]
    content: Optional[str] = Field(None, description="Token content or error message")
    message_id: Optional[str] = Field(None, description="Message ID when type=done")
    conversation_id: Optional[str] = Field(None, description="Conversation ID when type=done")
    code: Optional[str] = Field(None, description="Error code when type=error")
