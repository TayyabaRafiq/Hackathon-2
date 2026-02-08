# 🚀 Phase 3 Chatbot - Quick Start Guide

## 📋 Summary of Fixes Applied

I've fixed **4 critical issues** that were preventing the chatbot from working:

### ✅ 1. Backend AI Service Client (Function Signature)
- **Problem**: Function expected 4 separate parameters but was called with an object
- **Fixed**: Updated to accept a single `payload` object
- **File**: `backend/src/services/aiServiceClient.ts`

### ✅ 2. AI Service Route URL
- **Problem**: Backend called `/chat` but AI service registered at `/ai/chat`
- **Fixed**: Updated URL to `/ai/chat`
- **File**: `backend/src/services/aiServiceClient.ts`

### ✅ 3. Frontend Hardcoded User ID
- **Problem**: ChatWindow used `"user_placeholder"` instead of real authenticated user
- **Fixed**: Integrated Better Auth session, added authentication checks
- **File**: `frontend/app/components/ChatWindow.tsx`

### ✅ 4. Missing Credentials in Auth Client
- **Problem**: Credentials not explicitly included in requests
- **Fixed**: Added `credentials: 'include'` to auth client
- **File**: `frontend/lib/auth.ts`

---

## 🛠️ Pre-Flight Checklist

Before starting services, run these commands:

### 1. Setup Database (REQUIRED - First Time Only)

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

**Expected Output:**
```
✔ Generated Prisma Client
✔ Database dev.db created
✔ Migrations applied successfully
```

### 2. Verify Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

**AI Service:**
```bash
cd ai-service
pip install -r requirements.txt
```

---

## 🚀 Start All Services (3 Options)

### Option 1: Automated (Windows) - RECOMMENDED

**Double-click** `start-all.bat` in the project root.

This will:
- Open 3 terminal windows (Backend, AI Service, Frontend)
- Start all services automatically
- Open browser to http://localhost:3000

### Option 2: Manual (3 Separate Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Wait for: `Server running on http://127.0.0.1:8000`

**Terminal 2 - AI Service:**
```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8001
```
Wait for: `Application startup complete.`

**Terminal 3 - Frontend:**
```bash
cd frontend
npm run dev
```
Wait for: `✓ Ready on http://localhost:3000`

### Option 3: PowerShell/Terminal (All in Background)

```bash
# From project root
cd backend && start npm run dev
cd ../ai-service && start python -m uvicorn app.main:app --reload --port 8001
cd ../frontend && start npm run dev
```

---

## 🧪 Testing the Chatbot (Step-by-Step)

### Step 1: Create an Account

1. Open browser to **http://localhost:3000**
2. Click **"Sign Up"**
3. Enter:
   - Email: `test@example.com`
   - Password: `password123` (min 8 characters)
4. Click **"Sign Up"**

**Expected Result:** Account created, redirected to dashboard

---

### Step 2: Sign In (if already have account)

1. Click **"Sign In"**
2. Enter your email and password
3. Click **"Sign In"**

**Expected Result:** Redirected to dashboard at `/dashboard`

---

### Step 3: Open Chat Window

1. Look for **blue chat icon** (💬) in **bottom-right corner**
2. Click the icon

**Expected Result:** Chat window opens showing "👋 Welcome to Todo Assistant!"

---

### Step 4: Test Basic Chat

Type and send:
```
Hello!
```

**Expected Behavior:**
- ✅ Your message appears immediately
- ✅ "Assistant is typing..." indicator shows
- ✅ AI response streams in token-by-token
- ✅ Response completes

**Example Response:**
```
Hello! I'm your Todo Assistant. I can help you manage your tasks.
You can ask me to add, list, update, complete, or delete tasks.
```

---

### Step 5: Test Task Management

#### Test 1: Add a Task

```
Add task: Buy groceries
```

**Expected:**
- ✅ AI responds: "I've created a new task: 'Buy groceries'"
- ✅ Task appears in dashboard task list (refresh if needed)

#### Test 2: List Tasks

```
Show me all my tasks
```

**Expected:**
- ✅ AI lists all your tasks with status
- ✅ Shows task titles and completion status

#### Test 3: Complete a Task

```
Complete the "Buy groceries" task
```

**Expected:**
- ✅ AI confirms: "Task 'Buy groceries' marked as complete"
- ✅ Task shows as completed in dashboard

#### Test 4: Update a Task

```
Update the title of my first task to "Buy organic groceries"
```

**Expected:**
- ✅ AI confirms update
- ✅ Task title changes

#### Test 5: Delete a Task

```
Delete the "Buy organic groceries" task
```

**Expected:**
- ✅ AI confirms deletion
- ✅ Task removed from list

---

### Step 6: Test Conversation Features

#### View Conversation History

1. Click **💬 icon** in chat header
2. See your conversation listed
3. Click conversation to load its messages

#### Create New Conversation

1. Click **+ icon** in chat header
2. Chat clears
3. Send a new message
4. New conversation is created

#### Switch Between Conversations

1. Click **💬 icon**
2. Select a different conversation
3. Messages load for that conversation

---

## 🔍 Verification Checklist

Use this checklist to verify everything works:

### Services Running
- [ ] Backend running on http://localhost:8000
- [ ] AI Service running on http://localhost:8001
- [ ] Frontend running on http://localhost:3000

### Backend Health
- [ ] Visit http://localhost:8000 shows API info
- [ ] Visit http://localhost:8000/health shows `{"status": "ok"}`

### AI Service Health
- [ ] Visit http://localhost:8001 shows service info
- [ ] Visit http://localhost:8001/health shows `{"status": "healthy"}`

### Authentication
- [ ] Can create new account
- [ ] Can sign in with credentials
- [ ] Session persists on page refresh
- [ ] Can sign out

### Chat Interface
- [ ] Chat icon visible on dashboard (bottom-right)
- [ ] Chat window opens when clicked
- [ ] Shows "Authentication Required" when signed out
- [ ] Shows welcome message when signed in

### Chat Functionality
- [ ] Can send messages
- [ ] AI responses stream in real-time
- [ ] Typing indicator shows while waiting
- [ ] Messages persist after page refresh

### Task Management via Chat
- [ ] Add task works
- [ ] List tasks shows all tasks
- [ ] Update task works
- [ ] Complete task works
- [ ] Delete task works

### Conversation Management
- [ ] Conversations are saved
- [ ] Can view conversation history
- [ ] Can create new conversations
- [ ] Can switch between conversations
- [ ] Conversation titles auto-generated

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to connect to backend"

**Symptoms:**
- Chat shows "AI service unavailable"
- Console shows network errors

**Solutions:**
1. Verify backend is running on port 8000
2. Check backend terminal for errors
3. Restart backend: `cd backend && npm run dev`

---

### Issue: "Authentication Required" when signed in

**Symptoms:**
- Chat shows lock icon
- Console shows "session is null"

**Solutions:**
1. Clear browser cookies: DevTools > Application > Cookies > Delete all
2. Sign out and sign in again
3. Check if `NEXT_PUBLIC_API_URL` is set correctly in `frontend/.env.local`
4. Verify session cookie is set after sign-in

---

### Issue: "COHERE_API_KEY not configured"

**Symptoms:**
- AI Service health check fails
- Chat returns "Internal error"

**Solutions:**
1. Get API key from https://dashboard.cohere.com/api-keys
2. Update `ai-service/.env`:
   ```
   COHERE_API_KEY="your_actual_key_here"
   ```
3. Restart AI service

---

### Issue: Messages not streaming (appear all at once)

**Symptoms:**
- No typing indicator
- Full response appears instantly

**Solutions:**
1. Check browser console for SSE errors
2. Verify AI service is returning proper SSE format
3. Check backend logs for proxy errors
4. Try different browser (test in Chrome/Edge)

---

### Issue: "User not found" or "Unauthorized" errors

**Symptoms:**
- Backend returns 401 errors
- Chat fails to load

**Solutions:**
1. Sign out and sign in again
2. Check that user ID matches in session
3. Verify database has user record:
   ```bash
   cd backend
   npx prisma studio
   ```
   Look for your user in Users table

---

### Issue: Task commands don't work

**Symptoms:**
- AI says "Failed to add task"
- Tasks don't appear in database

**Solutions:**
1. Check backend logs for MCP errors
2. Verify MCP routes are registered: Look for `/mcp/*` in backend logs
3. Test MCP endpoint directly:
   ```bash
   curl -X POST http://localhost:8000/mcp/list-tasks \
     -H "Content-Type: application/json" \
     -d '{"user_id": "your_user_id"}'
   ```
4. Check database connection

---

### Issue: Database errors

**Symptoms:**
- "Table does not exist" errors
- "Cannot find module '@prisma/client'"

**Solutions:**
1. Regenerate Prisma Client:
   ```bash
   cd backend
   npx prisma generate
   ```
2. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
3. If still fails, delete `dev.db` and re-run migrations

---

## 📊 Monitoring & Logs

### Check Service Status

```bash
# Backend health
curl http://localhost:8000/health

# AI Service health
curl http://localhost:8001/health
```

### View Logs

**Backend Logs:** Terminal 1
- Watch for POST /api/chat requests
- Look for MCP tool calls
- Check for errors

**AI Service Logs:** Terminal 2
- Watch for POST /ai/chat requests
- Look for Cohere API calls
- Check for tool executions

**Frontend Logs:** Browser Console (F12)
- Watch for SSE events
- Look for authentication errors
- Check for API failures

### Database Inspection

```bash
cd backend
npx prisma studio
```

This opens a GUI to view:
- Users table
- Tasks table
- Conversations table
- Messages table

---

## 📁 Project Structure

```
phase-3-chatbot/
├── backend/                 # Express + Better Auth
│   ├── src/
│   │   ├── routes/
│   │   │   ├── chat.ts     # Chat SSE streaming
│   │   │   └── mcp.ts      # MCP tool endpoints
│   │   ├── services/
│   │   │   ├── aiServiceClient.ts    # ✅ FIXED
│   │   │   ├── conversationService.ts
│   │   │   └── mcpTools.ts
│   │   └── auth.ts
│   ├── prisma/
│   │   └── schema.prisma   # Database models
│   └── .env                # Backend config
│
├── frontend/               # Next.js
│   ├── app/
│   │   └── components/
│   │       ├── ChatWindow.tsx        # ✅ FIXED
│   │       └── ChatbotIcon.tsx
│   ├── lib/
│   │   ├── auth.ts         # ✅ FIXED
│   │   └── chatApi.ts      # SSE client
│   └── .env.local          # Frontend config
│
├── ai-service/             # FastAPI + Cohere
│   ├── app/
│   │   ├── routes/
│   │   │   └── chat.py     # AI chat endpoint
│   │   ├── agent/
│   │   │   ├── runner.py   # Agent execution
│   │   │   └── tools.py    # MCP tool definitions
│   │   └── services/
│   │       └── mcp_client.py # HTTP client for MCP
│   └── .env                # AI service config
│
├── start-all.bat           # ✅ NEW - Automated startup
├── START-ALL-SERVICES.md   # ✅ NEW - Detailed guide
├── FIXES-APPLIED.md        # ✅ NEW - Fix documentation
└── QUICK-START-GUIDE.md    # ✅ NEW - This file
```

---

## 🎯 Success Indicators

You know everything is working when:

✅ All three services start without errors
✅ User can sign up and sign in
✅ Chat icon appears after sign in
✅ Chat opens and shows welcome message
✅ Messages stream in real-time
✅ Task commands execute successfully
✅ Conversations save to database
✅ Can switch between conversations
✅ No errors in browser console
✅ No errors in service logs

---

## 🚀 Next Steps

After confirming everything works:

1. **Deploy to Production**
   - Backend → Railway/Render/Heroku
   - AI Service → Railway/Render
   - Frontend → Vercel

2. **Switch to PostgreSQL** (for production)
   - Update `DATABASE_URL` in backend `.env`
   - Run migrations: `npx prisma migrate deploy`

3. **Upgrade Cohere Model**
   - Change to `command-r-plus` for better responses
   - Update in `ai-service/.env`

4. **Add More Features**
   - Task priorities
   - Due dates
   - Task categories
   - Search functionality

---

## 📞 Support

If you encounter issues not covered here:

1. **Check the logs** in all three terminals
2. **Browser console** for frontend errors
3. **Database** using Prisma Studio
4. **Network tab** in DevTools to inspect API calls

For detailed troubleshooting, see `START-ALL-SERVICES.md`

---

**You're all set! Start the services and test the chatbot. Good luck! 🚀**
