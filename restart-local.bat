@echo off
echo ================================
echo Restarting Phase 3 Local Dev
echo ================================

echo.
echo [1/4] Clearing Next.js cache...
cd frontend
if exist .next rmdir /s /q .next
echo ✓ Cache cleared

echo.
echo [2/4] Frontend ready to start
echo Run in NEW terminal: cd frontend && npm run dev

echo.
echo [3/4] Backend ready to start
echo Run in NEW terminal: cd backend && npm run dev

echo.
echo [4/4] After both servers start:
echo - Open http://localhost:3000
echo - Check console for: DEMO_AUTH_MODE: false
echo - Test sign-up
echo.
echo See TESTING_CHECKLIST.md for detailed verification steps
pause
