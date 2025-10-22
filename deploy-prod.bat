@echo off
setlocal enabledelayedexpansion

echo ========================================
echo  Scale42 Projects Production Deployment
echo ========================================
echo.

:: Set project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

:: Kill processes on port 3000
echo [STEP 1] Killing any existing processes on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    set pid=%%a
    echo [INFO] Killing process !pid!...
    taskkill /F /PID !pid! >nul 2>&1
)
timeout /t 2 /nobreak >nul

:: Install dependencies
echo [STEP 2] Installing dependencies...
npm ci --production=false
if %errorlevel% neq 0 (
    echo [ERROR] Dependency installation failed
    exit /b 1
)

:: Build the application
echo [STEP 3] Building application...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)

:: Start production server
echo [STEP 4] Starting production server...
echo [INFO] Application will be available at http://localhost:3000
npm run start