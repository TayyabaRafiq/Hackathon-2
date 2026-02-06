"""
FastAPI AI Service Entry Point
Handles AI chat requests using Cohere API with native tool calling.
Proxies MCP tool calls to Express backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="TodoFlow AI Service",
    description="AI-powered chat service for task management using Cohere API",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Frontend
        "http://localhost:8000",  # Backend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "service": "TodoFlow AI Service",
        "version": "1.0.0",
        "status": "running",
        "cohere_model": os.getenv("COHERE_MODEL", "command-r"),
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    cohere_api_key = os.getenv("COHERE_API_KEY")
    backend_url = os.getenv("BACKEND_URL")

    status = {
        "status": "healthy",
        "cohere_configured": bool(cohere_api_key),
        "backend_url_configured": bool(backend_url),
    }

    if not cohere_api_key:
        status["status"] = "unhealthy"
        status["error"] = "COHERE_API_KEY not configured"

    if not backend_url:
        status["status"] = "unhealthy"
        status["error"] = "BACKEND_URL not configured"

    return JSONResponse(status, status_code=200 if status["status"] == "healthy" else 503)


# Chat routes (Phase 4: US1)
from app.routes.chat import router as chat_router
app.include_router(chat_router, prefix="/ai", tags=["ai"])


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8001))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
