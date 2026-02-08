@echo off
echo ========================================
echo  TodoFlow Phase 3 - Starting All Services
echo ========================================
echo.

echo [1/3] Starting Backend (Express + Better Auth)...
start "Backend - http://localhost:8000" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Starting AI Service (FastAPI)...
start "AI Service - http://localhost:8001" cmd /k "cd ai-service && python -m uvicorn app.main:app --reload --port 8001"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (Next.js)...
start "Frontend - http://localhost:3000" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo  All services are starting...
echo ========================================
echo.
echo  Backend:     http://localhost:8000
echo  AI Service:  http://localhost:8001
echo  Frontend:    http://localhost:3000
echo.
echo  Check each terminal window for startup status.
echo  Wait ~10-15 seconds for all services to be ready.
echo.
echo  Press any key to open the browser...
pause >nul

echo Opening browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo Done! Happy testing!
