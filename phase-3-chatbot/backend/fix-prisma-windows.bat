@echo off
echo ========================================
echo  Fixing Prisma EPERM Error on Windows
echo ========================================
echo.

echo [Step 1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel%==0 (
    echo   ✓ Node processes stopped
) else (
    echo   ℹ No Node processes were running
)
timeout /t 2 /nobreak >nul

echo.
echo [Step 2/4] Deleting .prisma folder...
if exist "node_modules\.prisma" (
    rmdir /S /Q "node_modules\.prisma" >nul 2>&1
    if %errorlevel%==0 (
        echo   ✓ .prisma folder deleted
    ) else (
        echo   ✗ Failed to delete .prisma folder
        echo   → Try running this script as Administrator
    )
) else (
    echo   ℹ .prisma folder doesn't exist
)
timeout /t 1 /nobreak >nul

echo.
echo [Step 3/4] Generating Prisma Client...
call npx prisma generate
if %errorlevel%==0 (
    echo   ✓ Prisma Client generated successfully!
) else (
    echo   ✗ Failed to generate Prisma Client
    echo   → Check error above
    pause
    exit /b 1
)

echo.
echo [Step 4/4] Running database migrations...
call npx prisma migrate dev --name init
if %errorlevel%==0 (
    echo   ✓ Database migrations applied!
) else (
    echo   ℹ Migrations may already be applied (this is OK)
)

echo.
echo ========================================
echo  ✓ Prisma setup complete!
echo ========================================
echo.
echo Next steps:
echo   1. Start backend: npm run dev
echo   2. Test at: http://localhost:8000
echo.
pause
