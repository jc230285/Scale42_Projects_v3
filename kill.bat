@echo off
echo ========================================
echo      Kill All Node/NPM Processes
echo ========================================

:: Kill all Node.js processes
echo [INFO] Killing all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js processes killed
) else (
    echo [INFO] No Node.js processes found
)

:: Kill all NPM processes
echo [INFO] Killing all NPM processes...
taskkill /F /IM npm.exe /T >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] NPM processes killed
) else (
    echo [INFO] No NPM processes found
)

:: Kill processes on common development ports
echo [INFO] Killing processes on development ports...
for %%p in (3000 3001 8000 8080 5000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":%%p" ^| find "LISTENING" 2^>nul') do (
        echo [INFO] Killing process %%a on port %%p...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [INFO] Waiting 3 seconds for cleanup...
timeout /t 3 /nobreak >nul

echo [OK] All development processes killed
echo.