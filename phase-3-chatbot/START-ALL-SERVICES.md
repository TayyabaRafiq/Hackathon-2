# 🚀 Phase 3 Chatbot - Start All Services

This guide will help you start all three services for the Phase 3 chatbot.

## ✅ Prerequisites

1. **Backend dependencies installed**: `cd backend && npm install`
2. **Frontend dependencies installed**: `cd frontend && npm install`
3. **AI Service dependencies installed**: `cd ai-service && pip install -r requirements.txt`
4. **Database migrated**: `cd backend && npx prisma migrate dev`

## 🔧 Environment Configuration

### Backend (`.env`)
```
DATABASE_URL="file:./dev.db"
BETTER_AUTH_SECRET="414425496baf6bd761f4089aa1e1b7340837f57668ea068560f824b281aea0a0"
BETTER_AUTH_URL="http://localhost:8000"
CORS_ORIGIN="http://localhost:3000"
PORT=8000
NODE_ENV=development
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:8000
```

### AI Service (`.env`)
```
COHERE_API_KEY="your_cohere_api_key_here"
COHERE_MODEL="command-r"
BACKEND_URL="http://localhost:8000"
PORT=8001
LOG_LEVEL="info"
```

## 📦 Service Startup Order

### 1. Start Backend (Express + Better Auth)

Open **Terminal 1**:
```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on http://127.0.0.1:8000
Environment: development
```

**Verify:**
- Visit: http://localhost:8000
- Should see: `{"name": "TodoFlow API", "version": "2.0.0", ...}`

---

### 2. Start AI Service (FastAPI)

Open **Terminal 2**:
```bash
cd ai-service
python -m uvicorn app.main:app --reload --port 8001
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Application startup complete.
```

**Verify:**
- Visit: http://localhost:8001
- Should see: `{"service": "TodoFlow AI Service", "status": "running", ...}`
- Visit: http://localhost:8001/health
- Should see: `{"status": "healthy", "cohere_configured": true, ...}`

---

### 3. Start Frontend (Next.js)

Open **Terminal 3**:
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
✓ Ready on http://localhost:3000
```

**Verify:**
- Visit: http://localhost:3000
- Should see the TodoFlow homepage

---

## 🧪 Testing the Chatbot

### Step 1: Sign Up / Sign In

1. Go to http://localhost:3000
2. Click **Sign Up** (if new user) or **Sign In**
3. Create an account:
   - Email: `test@example.com`
   - Password: `password123` (min 8 chars)
4. Sign in with your credentials

### Step 2: Access Dashboard

After signing in, you should be redirected to the dashboard at http://localhost:3000/dashboard

### Step 3: Open Chatbot

1. Look for the **blue chat icon** in the bottom-right corner
2. Click the icon to open the chat window
3. You should see: "👋 Welcome to Todo Assistant!"

### Step 4: Test Message Flow

Send a simple message:
```
Hello!
```

**Expected Behavior:**
1. ✅ Your message appears immediately in the chat
2. ✅ "Assistant is typing..." indicator appears
3. ✅ AI response streams in token-by-token
4. ✅ Response completes and typing indicator disappears

### Step 5: Test Task Management

Try these commands:

#### Add a Task
```
Add task: Buy groceries
```

**Expected:**
- AI confirms task creation
- Task appears in your task list (refresh dashboard if needed)

#### List Tasks
```
Show me all my tasks
```

**Expected:**
- AI lists all your tasks with their status

#### Complete a Task
```
Complete the "Buy groceries" task
```

**Expected:**
- AI confirms task completion
- Task status updates in database

#### Update a Task
```
Update the title of my first task to "Buy organic groceries"
```

**Expected:**
- AI confirms task update
- Task title changes in database

#### Delete a Task
```
Delete the "Buy organic groceries" task
```

**Expected:**
- AI confirms deletion
- Task removed from database

### Step 6: Test Conversation History

1. Click the **💬 icon** in the chat header
2. You should see your conversation listed
3. Click **+ icon** to start a new conversation
4. Send a new message
5. Switch between conversations to verify history persistence

---

## 🐛 Troubleshooting

### Issue: Backend fails to start

**Solution:**
```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Issue: AI Service fails with "COHERE_API_KEY not configured"

**Solution:**
1. Get your API key from https://dashboard.cohere.com/api-keys
2. Update `ai-service/.env`:
   ```
   COHERE_API_KEY="your_actual_api_key_here"
   ```
3. Restart AI service

### Issue: Frontend shows "Authentication Required" in chat

**Solution:**
1. Make sure you're signed in
2. Check browser console for auth errors
3. Verify session cookie is set (DevTools > Application > Cookies)

### Issue: Chat shows "AI service unavailable"

**Solution:**
1. Verify AI service is running on port 8001
2. Check AI service logs for errors
3. Verify `BACKEND_URL` in ai-service/.env is `http://localhost:8000`

### Issue: "Failed to communicate with AI service"

**Solution:**
1. Check backend logs for proxy errors
2. Verify AI service is accessible at http://localhost:8001/ai/chat
3. Check CORS configuration in ai-service/app/main.py

### Issue: Tool calls fail (task add/list/update/delete)

**Solution:**
1. Verify MCP routes are registered in backend (check logs)
2. Test MCP endpoint directly:
   ```bash
   curl -X POST http://localhost:8000/mcp/list-tasks \
     -H "Content-Type: application/json" \
     -d '{"user_id": "your_user_id"}'
   ```
3. Check backend logs for MCP errors

---

## 📊 Monitoring

### Check Service Health

**Backend:**
```bash
curl http://localhost:8000/health
```

**AI Service:**
```bash
curl http://localhost:8001/health
```

**Frontend:**
- Visit http://localhost:3000 (should load without errors)

### View Logs

**Backend:**
- Check Terminal 1 for Express logs

**AI Service:**
- Check Terminal 2 for FastAPI logs
- Look for:
  - `POST /ai/chat` requests
  - Tool call executions
  - Cohere API responses

**Frontend:**
- Open Browser DevTools > Console
- Look for:
  - SSE connection messages
  - Token streaming events
  - Error messages

---

## 🎯 Success Criteria

✅ All three services start without errors
✅ User can sign up and sign in
✅ Chat icon appears on dashboard
✅ Chat window opens and displays welcome message
✅ User can send messages and receive AI responses
✅ AI responses stream in real-time
✅ Task commands work (add, list, update, complete, delete)
✅ Conversations are saved and can be accessed from history
✅ Multiple conversations can be created and switched between

---

## 🔄 Next Steps After Testing

1. **Deploy Backend** to production (e.g., Railway, Render)
2. **Deploy AI Service** to production (e.g., Railway, Render)
3. **Deploy Frontend** to Vercel
4. **Update Environment Variables** for production URLs
5. **Test in Production** with real users

---

## 📝 Notes

- **Database**: Currently using SQLite (`dev.db`). For production, use PostgreSQL (Neon).
- **Cohere Model**: Using `command-r`. Upgrade to `command-r-plus` for better responses.
- **Rate Limiting**: Backend has rate limits (30 req/min for chat). Adjust in `middleware/rateLimit.ts`.
- **Session Expiry**: Sessions expire after 7 days. Adjust in `backend/src/auth.ts`.

---

## 🆘 Need Help?

If you encounter issues not covered here:

1. **Check Logs**: All three terminal windows for error messages
2. **Browser Console**: For frontend errors
3. **Network Tab**: To inspect API requests/responses
4. **Database**: Use Prisma Studio to inspect data
   ```bash
   cd backend
   npx prisma studio
   ```

---

**Happy Testing! 🚀**
