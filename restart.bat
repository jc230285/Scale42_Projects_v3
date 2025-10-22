@echo off
echo ========================================
echo    Restart Scale42 Projects (Dev)
echo ========================================

:: Kill all processes first
call kill.bat

:: Start development server
echo [STEP 2] Starting development server...
echo [INFO] Navigate to http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.
npm run dev