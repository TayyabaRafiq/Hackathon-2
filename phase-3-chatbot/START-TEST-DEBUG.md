# TodoFlow Phase 3: Complete Start → Test → Debug Guide

## 🎯 Overview

This guide will help you:
1. **Setup** - Configure all services
2. **Start** - Launch all services in correct order
3. **Test** - Verify integration end-to-end
4. **Debug** - Fix common issues

**Estimated time:** 15-20 minutes

---

## 📋 Pre-Flight Checklist

### ✅ Prerequisites

```bash
# Verify installations
node --version    # Should be v18+
npm --version     # Should be v9+
python --version  # Should be v3.10+
```

### ✅ Environment Variables

**1. Backend (`backend/.env`):**
```bash
# Database (Use provided Neon PostgreSQL)
DATABASE_URL="postgresql://todoflow_owner:***@ep-cool-morning-a5lvjxmk-pooler.us-east-2.aws.neon.tech/todoflow?sslmode=require"
DIRECT_URL="postgresql://todoflow_owner:***@ep-cool-morning-a5lvjxmk.us-east-2.aws.neon.tech/todoflow?sslmode=require"

# Better Auth (IMPORTANT: Generate a secure 32+ char secret)
BETTER_AUTH_SECRET="your-secure-secret-minimum-32-characters-replace-this"
BETTER_AUTH_URL="http://localhost:8000"

# CORS
CORS_ORIGIN="http://localhost:3000"

# Server
PORT=8000
NODE_ENV=development

# AI Service
AI_SERVICE_URL="http://localhost:8001"
```

**2. AI Service (`ai-service/.env`):**
```bash
# Cohere API (Get from https://dashboard.cohere.com/api-keys)
COHERE_API_KEY="your-cohere-api-key-here"
COHERE_MODEL="command-r"

# Backend Express URL
BACKEND_URL="http://localhost:8000"

# Server
PORT=8001
LOG_LEVEL="info"
```

**3. Frontend (`frontend/.env.local`):**
```bash
# IMPORTANT: Set to false for Phase 3 testing
NEXT_PUBLIC_DEMO_MODE=false

# API URL (use relative path for same-origin)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Auth URL
NEXT_PUBLIC_AUTH_URL=http://localhost:8000/api/auth
```

---

## 🔧 Step 1: Setup (One-Time)

### A. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database (if not already done)
npm run db:push

# Verify database connection
npx prisma studio
# This opens a browser - check if you can see User/Session/Task tables
# Close Prisma Studio after verification
```

**Expected output:**
```
✔ Generated Prisma Client
✔ The database is in sync with the Prisma schema
```

### B. AI Service Setup

```bash
cd ../ai-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import cohere; print('Cohere SDK installed:', cohere.__version__)"
```

**Expected output:**
```
Successfully installed cohere-5.x.x fastapi-0.x.x ...
Cohere SDK installed: 5.x.x
```

### C. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Verify Next.js installation
npx next --version
```

**Expected output:**
```
Next.js 14.x.x
```

---

## 🚀 Step 2: Start All Services

### Option A: Start with Batch Script (Windows - Easiest)

```bash
# From project root
cd D:\Hackathon-2\phase-3-chatbot
start-all.bat
```

This will open 3 terminal windows for backend, AI service, and frontend.

### Option B: Start Manually (Recommended for Debugging)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Wait for:** `Server running on http://127.0.0.1:8000`

**Terminal 2 - AI Service:**
```bash
cd ai-service
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Wait for:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
[Config] Cohere API configured with model: command-r
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```

**Wait for:**
```
✓ Ready in 2.5s
○ Local:   http://localhost:3000
```

---

## 🧪 Step 3: Integration Testing

### Test 1: Health Checks

**Backend Health:**
```bash
curl http://localhost:8000/health
```

**Expected:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-08T..."
}
```

**AI Service Health:**
```bash
curl http://localhost:8001/health
```

**Expected:**
```json
{
  "status": "healthy",
  "cohere_configured": true,
  "backend_url_configured": true
}
```

**Frontend Health:**
Open browser: http://localhost:3000

**Expected:** TodoFlow landing page loads

---

### Test 2: Authentication Flow

1. **Sign Up:**
   - Navigate to http://localhost:3000/sign-up
   - Email: `test@example.com`
   - Password: `password123`
   - Click "Sign Up"

   **Expected:** Redirects to `/dashboard`

2. **Verify Session:**
   ```bash
   # Check browser DevTools > Application > Cookies
   # Should see: better-auth.session_token
   ```

3. **Sign Out & Sign In:**
   - Click profile menu → Sign Out
   - Navigate to http://localhost:3000/sign-in
   - Sign in with same credentials

   **Expected:** Returns to dashboard

---

### Test 3: Task Management (REST API)

**In Dashboard (http://localhost:3000/dashboard):**

1. **Create Task:**
   - Click "Add Task"
   - Title: "Test Task 1"
   - Description: "Testing task creation"
   - Click "Create"

   **Expected:** Task appears in list

2. **Toggle Complete:**
   - Click checkbox next to task

   **Expected:** Task marked as complete (strikethrough)

3. **Edit Task:**
   - Click "Edit" button
   - Change title to "Updated Task"
   - Click "Save"

   **Expected:** Task updates immediately

4. **Delete Task:**
   - Click "Delete" button
   - Confirm deletion

   **Expected:** Task removed from list

**Verify Backend Logs:**
```
[POST /api/tasks] 201 Created
[PATCH /api/tasks/:id] 200 OK
[DELETE /api/tasks/:id] 200 OK
```

---

### Test 4: AI Chatbot (SSE Streaming + MCP Tools)

**Critical Test - This verifies the entire integration:**

1. **Open Chat:**
   - Click floating chat button (bottom-right)

   **Expected:** Chat window opens

2. **Test Basic Conversation:**
   - Type: "Hello"
   - Press Enter

   **Expected:**
   - Streaming response appears token-by-token
   - Assistant responds with greeting

3. **Test Tool Call - Create Task:**
   - Type: "Add task: Buy groceries"
   - Press Enter

   **Expected:**
   - [Streaming] "I'll create that task for you..."
   - [Tool Call] `add_task` executed
   - [Response] "Task created! ✓"
   - Task appears in dashboard immediately

4. **Test Tool Call - List Tasks:**
   - Type: "What tasks do I have?"
   - Press Enter

   **Expected:**
   - [Tool Call] `list_tasks` executed
   - [Response] Lists all tasks with numbering

5. **Test Tool Call - Complete Task:**
   - Type: "Mark the first task as done"
   - Press Enter

   **Expected:**
   - [Tool Call] `list_tasks` (to find task ID)
   - [Tool Call] `complete_task`
   - [Response] "Task marked as complete! ✓"
   - Task updates in dashboard

6. **Test Conversation History:**
   - Close chat window
   - Reopen chat
   - Click "💬" icon (conversations)

   **Expected:** Previous conversation listed

---

### Test 5: Error Handling

**Test Rate Limiting:**
```bash
# Send 50 rapid requests
for i in {1..50}; do
  curl -X POST http://localhost:8000/api/tasks \
    -H "Content-Type: application/json" \
    -d '{"title":"Task '$i'"}' &
done
```

**Expected:** Some requests return 429 (rate limited)

**Test Invalid Auth:**
```bash
curl http://localhost:8000/api/tasks
```

**Expected:** 401 Unauthorized

**Test AI Service Down:**
1. Stop AI service (Ctrl+C in Terminal 2)
2. Try sending chat message

**Expected:** Frontend shows "AI service unavailable" error

**Restart AI service after test**

---

## 🐛 Step 4: Common Issues & Debugging

### Issue 1: Backend Won't Start

**Symptom:**
```
Error: P1001: Can't reach database server
```

**Solution:**
```bash
# Check DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
cd backend
npx prisma db push

# If still fails, check if Neon DB is accessible
curl https://ep-cool-morning-a5lvjxmk.us-east-2.aws.neon.tech
```

---

### Issue 2: AI Service Cohere API Errors

**Symptom:**
```
CohereAPIError: invalid api token
```

**Solution:**
```bash
# Verify API key
cd ai-service
cat .env | grep COHERE_API_KEY

# Test API key directly
python -c "
import cohere
import os
from dotenv import load_dotenv
load_dotenv()
co = cohere.Client(os.getenv('COHERE_API_KEY'))
print('API key valid:', co.check_api_key())
"
```

---

### Issue 3: Chat Streaming Not Working

**Symptom:** Chat sends message but no response appears

**Debugging Steps:**

1. **Check Browser Console:**
   ```
   Open DevTools > Console
   Look for errors like:
   - "Failed to fetch"
   - "ERR_CONNECTION_REFUSED"
   - SSE parsing errors
   ```

2. **Check Backend Logs:**
   ```
   Should see:
   [POST /api/chat/:userId] Proxying to AI service
   ```

   If you see:
   ```
   ❌ AI Service Proxy Error: AI Service error: 500
   ```

   Then AI service has an error. Check AI service logs.

3. **Check AI Service Logs:**
   ```
   Should see:
   INFO:     POST /ai/chat
   [Agent] Starting stream for user: ...
   [Tool] Calling add_task with params: ...
   ```

   Common errors:
   - `ValidationError`: Schema mismatch (did you apply Fix 2?)
   - `CohereAPIError`: API key issue or rate limit
   - `ConnectionError`: Can't reach backend MCP endpoints

4. **Test SSE Stream Manually:**
   ```bash
   curl -X POST http://localhost:8000/api/chat/demo-user \
     -H "Content-Type: application/json" \
     -H "Cookie: better-auth.session_token=<your-token>" \
     -d '{
       "message": "Hello",
       "conversation_id": null
     }'
   ```

   **Expected:** See `data: {"type":"token","content":"..."}` streaming

---

### Issue 4: MCP Tools Not Working

**Symptom:** AI says "Failed to create task" or tool errors

**Debugging:**

1. **Check MCP Endpoints Directly:**
   ```bash
   # Test add_task
   curl -X POST http://localhost:8000/mcp/add-task \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "<your-user-id>",
       "title": "Test Task"
     }'
   ```

   **Expected:**
   ```json
   {
     "success": true,
     "data": {
       "task_id": "clxxx..."
     }
   }
   ```

2. **Check Database:**
   ```bash
   cd backend
   npx prisma studio
   ```

   Verify tasks are being created in Task table

3. **Enable MCP Debug Logs:**

   In `ai-service/app/services/mcp_client.py`, add:
   ```python
   async def call_tool(tool_name: str, payload: Dict[str, Any]):
       print(f"[MCP] Calling {tool_name} with payload: {payload}")
       # ... rest of code
   ```

---

### Issue 5: Session/Auth Issues

**Symptom:** "Authentication required" in chat even after sign-in

**Solution:**

1. **Check Cookie Domain:**
   ```
   DevTools > Application > Cookies
   - Domain should be: localhost
   - Path should be: /
   - HttpOnly: true
   ```

2. **Verify Session in Database:**
   ```bash
   cd backend
   npx prisma studio
   # Check Session table - should have active session
   ```

3. **Check CORS:**
   ```
   Backend logs should show:
   - Origin: http://localhost:3000 (allowed)

   NOT:
   - Origin: http://localhost:3001 (blocked)
   ```

---

## 📊 Expected Log Output (Success Case)

**When you send "Add task: Buy milk" in chat:**

**Frontend Console:**
```
[chatApi] Sending message: Add task: Buy milk
[SSE] Event: {type: "token", content: "I'll"}
[SSE] Event: {type: "token", content: " create"}
[SSE] Event: {type: "tool_call", tool_name: "add_task", parameters: {...}}
[SSE] Event: {type: "token", content: "Task"}
[SSE] Event: {type: "done", message_id: "...", conversation_id: "..."}
```

**Backend Logs:**
```
[POST /api/chat/clxxx...] Request received
[Auth] User authenticated: clxxx...
[DB] Loaded conversation context: 5 messages
[Proxy] Forwarding to AI service: http://localhost:8001/ai/chat
[Proxy] Streaming response started
[DB] Saved user message
[DB] Saved assistant response
[POST /api/chat/clxxx...] 200 OK (4.2s)
```

**AI Service Logs:**
```
INFO:     POST /ai/chat
[Agent] Starting stream for user: clxxx...
[Agent] Loaded 5 context messages
[Cohere] Streaming chat with command-r
[Tool] add_task called with params: {'user_id': 'clxxx...', 'title': 'Buy milk'}
[MCP] POST http://localhost:8000/mcp/add-task
[MCP] Response: {'success': True, 'data': {'task_id': 'clyyy...'}}
[Agent] Tool execution successful
[Cohere] Follow-up response streaming
[Agent] Stream completed
```

**Backend MCP Logs:**
```
[POST /mcp/add-task] Request received
[Validate] Input validated: user_id=clxxx..., title=Buy milk
[DB] Creating task for user clxxx...
[DB] Task created: clyyy...
[POST /mcp/add-task] 200 OK (45ms)
```

---

## ✅ Success Criteria

Your Phase 3 integration is working if:

- ✅ All 3 services start without errors
- ✅ Health checks pass
- ✅ You can sign up / sign in
- ✅ You can create/edit/delete tasks via UI
- ✅ Chat opens and streams responses
- ✅ Chat can create tasks via natural language
- ✅ Chat can list existing tasks
- ✅ Chat can mark tasks complete
- ✅ Tasks created in chat appear in dashboard
- ✅ Conversation history persists

---

## 🎓 Testing Checklist

Use this checklist to verify everything works:

```
□ Backend starts on port 8000
□ AI service starts on port 8001
□ Frontend starts on port 3000
□ Can access landing page
□ Can sign up new user
□ Can sign in
□ Can create task via UI
□ Can complete task via UI
□ Can delete task via UI
□ Can open chat window
□ Chat responds to "Hello"
□ Chat can create task: "Add task: Test"
□ Chat can list tasks: "What tasks do I have?"
□ Chat can complete task: "Mark first task done"
□ Tasks sync between chat and dashboard
□ Conversation history persists
□ Can create new conversation
□ Rate limiting works (429 on spam)
□ Auth required (401 without session)
□ AI service error handled gracefully
```

---

## 🚢 Next Steps: Deployment Preparation

Once local testing passes:

1. **Environment Setup:**
   - Generate production BETTER_AUTH_SECRET (32+ chars)
   - Set NODE_ENV=production
   - Update CORS_ORIGIN to production domain

2. **Database Migration:**
   - Run: `npx prisma migrate deploy`
   - Backup database before deploy

3. **Deploy Order:**
   1. Backend (Railway/Render)
   2. AI Service (Hugging Face Space)
   3. Frontend (Vercel)

4. **Post-Deployment:**
   - Verify health checks
   - Test full integration flow
   - Monitor logs for errors

---

## 📞 Support

If you encounter issues not covered here:

1. Check application logs (all 3 services)
2. Check browser DevTools Console/Network
3. Verify all fixes from `apply-fixes.md` are applied
4. Test each service individually before integration
5. Compare your logs with "Expected Log Output" section

**Common Gotchas:**
- Forgot to apply fixes from `apply-fixes.md`
- Wrong environment variables (copy from .env.example)
- Cohere API key invalid or rate limited
- Database connection string wrong
- Ports already in use (8000, 8001, 3000)
- Virtual environment not activated for AI service
