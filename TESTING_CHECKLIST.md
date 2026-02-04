# Authentication Debug Testing Checklist

## LOCAL TESTING STEPS

### 1. Clear Next.js Cache and Restart Frontend
```bash
# In frontend directory
cd frontend
rm -rf .next
npm run dev
```

### 2. Restart Backend
```bash
# In backend directory
cd backend
npm run dev
```

### 3. Verify Environment Variables in Browser Console
- Open browser: http://localhost:3000
- Open DevTools (F12) → Console tab
- Look for these logs:
  ```
  DEMO_AUTH_MODE: false
  NEXT_PUBLIC_DEMO_MODE: false
  Auth client BASE_URL: http://localhost:8000
  ```
- ✅ DEMO_AUTH_MODE MUST be `false`
- ❌ If `true`, environment variable not loaded correctly

### 4. Test Sign-Up Flow

#### Open Network Tab
- F12 → Network tab
- Keep it open

#### Fill Sign-Up Form
- Go to http://localhost:3000/sign-up
- Enter email: test@example.com
- Enter password: password123
- Enter confirm password: password123
- Click "Sign Up"

#### Check Browser Console Logs
Look for:
```
Attempting sign up with: test@example.com
Sign up result: { data: {...}, error: null }
```

#### Check Network Tab
- Find request to: `http://localhost:8000/api/auth/sign-up`
- Click on it
- Check "Headers" tab:
  - Request URL should be: `http://localhost:8000/api/auth/sign-up`
  - Request Method: POST
  - Status: 200 OK
- Check "Response" tab:
  - Should show user data or success response
- Check "Cookies" tab (in Response Headers):
  - Should see `Set-Cookie` header with session cookie

#### Check Browser Cookies
- F12 → Application tab → Cookies → http://localhost:8000
- Should see session cookie (name varies, e.g., `better-auth.session_token`)
- ✅ Cookie exists = authentication working
- ❌ No cookie = session not being set

#### Check Backend Console
Should see logs like:
```
[Info] User signed up: test@example.com
```
Or similar authentication logs

### 5. Test Sign-In Flow

#### Same steps as Sign-Up:
- Network tab open
- Go to http://localhost:3000/sign-in
- Enter credentials
- Click "Sign In"
- Check console logs, network request, cookies

### 6. Verify Dashboard Access
- After successful sign-in, should redirect to /dashboard
- Check Network tab for: `http://localhost:8000/api/tasks`
- Status should be: 200 OK (not 404 or 401)
- ✅ 200 = authenticated, session cookie working
- ❌ 401 = authentication failed, no session
- ❌ 404 = endpoint issue

---

## VERCEL DEPLOYMENT FIX

### 1. Set Environment Variables in Vercel
- Go to: https://vercel.com/your-project/settings/environment-variables
- Add/Update these variables:

**Production:**
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_AUTH_URL=https://your-backend-url.com
```

**Preview & Development:**
```
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_AUTH_URL=https://your-backend-url.com
```

### 2. Redeploy Vercel
- Go to Deployments tab
- Click "Redeploy" on latest deployment
- OR push a new commit to trigger rebuild:
  ```bash
  git commit --allow-empty -m "Trigger Vercel rebuild with env vars"
  git push
  ```

### 3. Verify on Vercel Deployment
- Open deployed URL
- F12 → Console
- Check logs:
  ```
  DEMO_AUTH_MODE: false
  NEXT_PUBLIC_DEMO_MODE: false
  ```
- Test sign-up/sign-in
- Verify cookies are set for your backend domain

---

## TROUBLESHOOTING

### Issue: DEMO_AUTH_MODE still true after restart
**Solution:**
1. Delete .next folder: `rm -rf .next`
2. Kill all node processes: `pkill -f next-dev` (Linux/Mac) or Task Manager (Windows)
3. Restart: `npm run dev`
4. Hard refresh browser: Ctrl+Shift+R

### Issue: "Attempting sign up" log appears, but no backend request
**Solution:**
- Check auth.ts baseURL is correct
- Verify CORS allows http://localhost:3000
- Check backend is running on port 8000

### Issue: Backend request made but 404 error
**Solution:**
- Verify backend route: `app.use("/api/auth", toNodeHandler(auth))`
- Check backend console for errors
- Restart backend

### Issue: Sign-up succeeds but tasks endpoint returns 401
**Solution:**
- Session cookie not being sent with requests
- Check cookie domain/path settings
- Verify `credentials: "include"` in fetch options
- Check backend cookie settings: `secure: false` for localhost

### Issue: Cookies not visible in DevTools
**Solution:**
- Check Application → Cookies → http://localhost:8000 (not localhost:3000)
- Backend must send `Set-Cookie` header
- CORS must have `credentials: true`
- Frontend must use `credentials: "include"`

---

## SUCCESS CRITERIA

✅ Browser console shows: `DEMO_AUTH_MODE: false`
✅ Sign-up makes network request to backend
✅ Backend returns 200 status
✅ `Set-Cookie` header present in response
✅ Session cookie visible in Application → Cookies
✅ Sign-in works and redirects to dashboard
✅ Tasks endpoint returns 200 (not 401/404)
✅ User can create/view tasks

---

## FILES CHANGED

1. `frontend/lib/config.ts` - Fixed demo mode logic
2. `backend/src/auth.ts` - Added cookie configuration
3. `backend/src/index.ts` - Fixed Better Auth route mounting
