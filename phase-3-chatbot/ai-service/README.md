---
title: TodoFlow AI Service
emoji: 🤖
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
---

# TodoFlow AI Service

AI-powered task management chatbot using Cohere API.

## Configuration

Set these secrets in Hugging Face Space settings:

- `COHERE_API_KEY`: Your Cohere API key
- `BACKEND_URL`: Your backend API URL (e.g., https://your-backend.railway.app)
- `PORT`: 7860 (default for HF Spaces)

## API Endpoints

- `GET /health` - Health check
- `POST /ai/chat` - Chat endpoint with SSE streaming
