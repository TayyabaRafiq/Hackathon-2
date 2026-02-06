# Quickstart: TodoFlow AI Chatbot

**Feature**: 1-ai-chatbot  
**Date**: 2026-02-06

---

## Prerequisites

- Node.js 18+ installed
- Python 3.10+ installed
- npm package manager
- pip package manager
- Git
- Cohere API key (get from [dashboard.cohere.com](https://dashboard.cohere.com))

---

## 1. Backend Setup (Express + Better Auth)

The backend is already set up from Phase 2, but we need to add AI service client.

```bash
cd backend

# Install dependencies if not already installed
npm install

# Verify .env file has required variables
cat .env
```

Required environment variables in `backend/.env`:
```env
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="your-secret-key-min-32-chars"
BETTER_AUTH_URL="http://localhost:8000"
CORS_ORIGIN="http://localhost:3000"
AI_SERVICE_URL="http://localhost:8001"
```

---

## 2. AI Service Setup (FastAPI + Cohere)

```bash
cd ai-service

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create `ai-service/.env` from `.env.example`:
```env
COHERE_API_KEY="your-cohere-api-key-from-dashboard"
COHERE_MODEL="command-r"
BACKEND_URL="http://localhost:8000"
PORT=8001
LOG_LEVEL="info"
```

---

## 3. Frontend Setup (Next.js + React)

```bash
cd frontend

# Install dependencies if not already installed
npm install

# Install ChatKit UI library (if not installed)
npm install @chatscope/chat-ui-kit-react @chatscope/chat-ui-kit-styles
```

No additional .env required for frontend - it uses the backend URL via API routes.

---

## 4. Database Migration

Apply the Prisma migrations for conversation and message tables:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

This creates:
- `Conversation` table for tracking chat sessions
- `Message` table for storing chat history

---

## 5. Start All Services

You need **three terminal windows** open:

### Terminal 1: Backend (Express)
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:8000`

### Terminal 2: AI Service (FastAPI)
```bash
cd ai-service
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
python -m app.main
# or: uvicorn app.main:app --reload --port 8001
```
AI Service runs on `http://localhost:8001`

### Terminal 3: Frontend (Next.js)
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:3000`

---

## 6. Verify Services are Running

### Check Backend Health
```bash
curl http://localhost:8000/health
```
Expected: `{"status":"ok"}`

### Check AI Service Health
```bash
curl http://localhost:8001/health
```
Expected: `{"status":"healthy","cohere_configured":true}`

### Check Frontend
Open browser to `http://localhost:3000`
- You should see the dashboard with task list
- A blue chat icon should appear in the bottom-right corner

---

## 7. Test the Chatbot

1. **Open the chat**: Click the blue message icon in the bottom-right corner
2. **Create a task**: Type "Add task: Buy groceries" and send
3. **List tasks**: Type "What tasks do I have?" and send
4. **Complete a task**: Type "Mark Buy groceries as done" and send
5. **Update a task**: Type "Change priority of Buy groceries to high" and send
6. **Delete a task**: Type "Delete Buy groceries task" and send (requires confirmation)

---

## 8. Troubleshooting

### AI Service Connection Refused
**Problem**: Backend can't reach AI service  
**Solution**: 
- Verify AI service is running on port 8001
- Check `AI_SERVICE_URL` in backend/.env
- Check firewall settings

### Cohere API Errors
**Problem**: "Unauthorized" or "Invalid API key"  
**Solution**:
- Verify `COHERE_API_KEY` in ai-service/.env
- Get a new key from [dashboard.cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
- Check API key has sufficient quota

### Database Errors
**Problem**: "Table does not exist" or migration errors  
**Solution**:
```bash
cd backend
rm -rf prisma/migrations  # Reset migrations (dev only!)
rm prisma/dev.db
npx prisma migrate dev --name init_sqlite
```

### Frontend Build Errors
**Problem**: Module not found errors  
**Solution**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Rate Limiting Issues
**Problem**: "Too many requests" error  
**Solution**:
- Wait 1 minute for rate limit to reset
- Or set `NODE_ENV=test` to disable rate limiting (dev only)

---

## 9. Development Workflow

### Make Changes to Backend
1. Edit files in `backend/src/`
2. ts-node-dev will auto-reload
3. Test changes in browser

### Make Changes to AI Service
1. Edit files in `ai-service/app/`
2. Restart FastAPI server manually (or use `--reload` flag)
3. Test with curl or browser

### Make Changes to Frontend
1. Edit files in `frontend/app/`
2. Next.js will hot-reload automatically
3. Changes appear in browser instantly

---

## 10. Next Steps

- **Add custom tools**: Extend MCP tools in `backend/src/services/mcpTools.ts`
- **Customize AI behavior**: Edit system prompt in `ai-service/app/agent/runner.py`
- **Add authentication**: Users must log in to see their own tasks
- **Deploy to production**: See `deployment.md` for cloud deployment guide

---

## Quick Reference

| Service | Port | URL | Health Check |
|---------|------|-----|--------------|
| Frontend | 3000 | http://localhost:3000 | Open in browser |
| Backend | 8000 | http://localhost:8000 | /health |
| AI Service | 8001 | http://localhost:8001 | /health |

**Environment Files**:
- `backend/.env` - Database, auth, CORS, AI service URL
- `ai-service/.env` - Cohere API key, backend URL
- `frontend/` - No .env needed (uses API routes)

**Key Directories**:
- `backend/src/routes/` - API endpoints
- `backend/src/services/` - Business logic and MCP tools
- `ai-service/app/agent/` - AI agent and tool definitions
- `frontend/app/components/` - React components including ChatWindow
