@echo off
echo ========================================
echo     Quick Start - Scale42 Projects
echo ========================================

:: Kill all Node.js processes first
echo [INFO] Killing all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.exe /T >nul 2>&1

:: Kill any process on port 3000
echo [INFO] Checking for processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING" 2^>nul') do (
    echo [INFO] Killing process %%a on port 3000...
    taskkill /F /PID %%a >nul 2>&1
)

:: Wait for processes to fully terminate
echo [INFO] Waiting for processes to terminate...
timeout /t 3 /nobreak >nul

:: Start dev server
echo [INFO] Starting development server...
echo [INFO] Navigate to http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.
npm run dev