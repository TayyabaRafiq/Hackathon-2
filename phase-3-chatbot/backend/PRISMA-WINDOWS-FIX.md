# 🔧 Fix Prisma EPERM Error on Windows

## Error Message
```
EPERM: operation not permitted, rename
'node_modules/.prisma/client/query_engine-windows.dll.node.tmp'
```

## Why This Happens

The Prisma query engine DLL file is locked by:
- ✗ Running Node.js processes (dev servers)
- ✗ VSCode or other editors with the project open
- ✗ Windows Defender/Antivirus scanning the file
- ✗ File permissions issues

---

## ✅ Solution 1: Automated Fix (RECOMMENDED)

### Run the fix script:

**Option A: Double-click the file**
```
backend/fix-prisma-windows.bat
```

**Option B: From terminal**
```bash
cd backend
.\fix-prisma-windows.bat
```

**What it does:**
1. Stops all Node.js processes
2. Deletes `.prisma` folder
3. Regenerates Prisma Client
4. Runs database migrations

---

## ✅ Solution 2: Manual Fix (Step-by-Step)

### Step 1: Stop All Node Processes

**Option A: Task Manager**
1. Press `Ctrl + Shift + Esc`
2. Find all **Node.js** processes
3. Right-click → **End Task** for each

**Option B: Command Prompt (as Administrator)**
```cmd
taskkill /F /IM node.exe
```

### Step 2: Close VSCode/Editors
- Close VSCode completely
- Close any other editors with the project open

### Step 3: Delete .prisma Folder

**Option A: File Explorer**
1. Navigate to: `backend/node_modules/.prisma`
2. Delete the `.prisma` folder
3. If deletion fails, see Solution 3 below

**Option B: Command Prompt**
```cmd
cd backend
rmdir /S /Q node_modules\.prisma
```

### Step 4: Regenerate Prisma Client
```cmd
cd backend
npx prisma generate
```

### Step 5: Run Migrations
```cmd
npx prisma migrate dev --name init
```

---

## ✅ Solution 3: If Deletion Still Fails

### Run as Administrator

**Right-click** `fix-prisma-windows.bat` → **Run as administrator**

---

## ✅ Solution 4: Disable Antivirus Temporarily

### Windows Defender

1. Open **Windows Security**
2. Go to **Virus & threat protection**
3. Click **Manage settings**
4. Turn off **Real-time protection** (temporarily)
5. Run the fix script again
6. **Turn Real-time protection back ON** after fixing

### Third-party Antivirus

Add exclusions for:
- `D:\Hackathon-2\phase-3-chatbot\backend\node_modules`
- `D:\Hackathon-2\phase-3-chatbot\backend\prisma`

---

## ✅ Solution 5: Nuclear Option (Complete Reinstall)

If nothing else works:

```bash
cd backend

# 1. Stop all Node processes
taskkill /F /IM node.exe

# 2. Delete node_modules and package-lock
rmdir /S /Q node_modules
del package-lock.json

# 3. Reinstall dependencies
npm install

# 4. Generate Prisma Client
npx prisma generate

# 5. Run migrations
npx prisma migrate dev --name init
```

**⚠️ Warning**: This will take 5-10 minutes to reinstall all dependencies.

---

## ✅ Solution 6: Alternative Database Setup (SQLite)

If you just want to test quickly:

### Use existing database file (if it exists)

```bash
cd backend
npx prisma db push
```

This skips migrations and just syncs the schema to the database.

---

## 🧪 Verify the Fix

After applying any solution, verify Prisma works:

### 1. Check Prisma Client
```bash
npx prisma --version
```

**Expected output:**
```
prisma                  : 5.x.x
@prisma/client          : 5.x.x
```

### 2. Open Prisma Studio
```bash
npx prisma studio
```

**Expected:** Browser opens to http://localhost:5555 with database GUI

### 3. Start Backend
```bash
npm run dev
```

**Expected:** Server starts without Prisma errors

---

## 🚫 Prevention Tips

To avoid this error in the future:

### 1. Always stop dev server before running Prisma commands

**Stop server first:**
```
Press Ctrl+C in terminal running dev server
```

**Then run Prisma commands:**
```bash
npx prisma generate
npx prisma migrate dev
```

### 2. Close VSCode before Prisma operations

If you're having persistent issues:
1. Stop dev server
2. Close VSCode
3. Run Prisma commands
4. Reopen VSCode

### 3. Exclude from antivirus

Add these folders to antivirus exclusions:
- `node_modules/`
- `.prisma/`
- `prisma/`

---

## 🐛 Still Not Working?

### Check file permissions

**Right-click** `backend/node_modules/.prisma` → **Properties** → **Security**

Make sure your user account has **Full Control**.

### Use PowerShell (alternative)

```powershell
# Run PowerShell as Administrator
cd backend

# Force delete
Remove-Item -Path "node_modules\.prisma" -Recurse -Force

# Regenerate
npx prisma generate
```

### Check for locked files

Use **Process Explorer** (Microsoft tool):
1. Download: https://learn.microsoft.com/en-us/sysinternals/downloads/process-explorer
2. Run as Administrator
3. `Ctrl+F` → Search for "query_engine"
4. See which process is locking the file
5. Close that process

---

## 📋 Quick Reference

| Problem | Solution |
|---------|----------|
| EPERM error | Stop Node.js processes |
| Can't delete folder | Run as Administrator |
| Still locked | Close VSCode |
| Antivirus blocking | Temporarily disable |
| Nothing works | Delete node_modules + reinstall |

---

## ✅ Confirmed Working?

After fixing, you should be able to:

```bash
cd backend
npx prisma generate    # ✓ Works without EPERM error
npx prisma migrate dev # ✓ Works without EPERM error
npm run dev           # ✓ Server starts successfully
```

---

## 🚀 Next Steps After Fix

Once Prisma is working:

1. **Start backend**: `npm run dev`
2. **Verify health**: http://localhost:8000/health
3. **Continue with chatbot testing**: See `QUICK-START-GUIDE.md`

---

**Need more help? Check the error logs above for specific issues.**
