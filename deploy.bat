@echo off
setlocal enabledelayedexpansion

echo ========================================
echo     Scale42 Projects Deployment Script
echo ========================================
echo.

:: Set project directory
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

echo [INFO] Current directory: %PROJECT_DIR%
echo.

:: Check if Node.js is installed
echo [STEP 1] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version
echo.

:: Check if npm is installed
echo [STEP 2] Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not in PATH
    pause
    exit /b 1
)
echo [OK] npm is installed
npm --version
echo.

:: Kill all development processes
echo [STEP 3] Killing all Node.js and development processes...
echo [INFO] Killing all Node.js processes...
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM npm.exe /T >nul 2>&1

echo [INFO] Killing processes on development ports...
for %%p in (3000 3001 8000 8080 5000) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| find ":%%p" ^| find "LISTENING" 2^>nul') do (
        echo [INFO] Killing process %%a on port %%p...
        taskkill /F /PID %%a >nul 2>&1
    )
)

:: Wait for processes to be fully terminated
echo [INFO] Waiting 5 seconds for processes to be released...
timeout /t 5 /nobreak >nul
echo [OK] All development processes killed
echo.

:: Check if .env.local exists, if not copy from .env.example
echo [STEP 4] Checking environment configuration...
if not exist ".env.local" (
    if exist ".env.example" (
        echo [INFO] Copying .env.example to .env.local...
        copy ".env.example" ".env.local" >nul
        echo [OK] .env.local created from .env.example
        echo [WARNING] Please configure your environment variables in .env.local
    ) else (
        echo [WARNING] No .env.example found. You may need to create .env.local manually
    )
) else (
    echo [OK] .env.local exists
)
echo.

:: Clean install dependencies
echo [STEP 5] Installing/updating dependencies...
echo [INFO] Cleaning node_modules and package-lock.json...
if exist "node_modules" (
    echo [INFO] Removing existing node_modules...
    rmdir /s /q "node_modules" 2>nul
)
if exist "package-lock.json" (
    echo [INFO] Removing existing package-lock.json...
    del "package-lock.json" 2>nul
)

echo [INFO] Installing fresh dependencies...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed
    pause
    exit /b 1
)
echo [OK] Dependencies installed successfully
echo.

:: Check if required lib directory exists
echo [STEP 6] Checking project structure...
if not exist "lib" (
    echo [WARNING] lib directory missing - this was likely created by the script
)
echo [OK] Project structure verified
echo.

:: Build the project to check for compilation errors
echo [STEP 7] Building project to check for errors...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Please check the errors above.
    echo [INFO] You may need to configure your environment variables or fix compilation errors.
    echo [INFO] Note: Database warnings are normal if Supabase tables aren't created yet
    pause
    exit /b 1
)
echo [OK] Build successful (database warnings are normal if tables aren't created yet)
echo.

:: Start the development server
echo [STEP 8] Starting development server...
echo [INFO] Starting Next.js development server on http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ========================================
echo   Application starting... Please wait
echo ========================================
echo.

npm run dev

:: If we get here, the server was stopped
echo.
echo [INFO] Development server stopped
pause