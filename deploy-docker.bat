@echo off
echo ========================================
echo   Scale42 Projects - Docker Production
echo ========================================

:: Kill existing containers and processes
echo [STEP 1] Cleaning up existing containers...
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>nul
docker system prune -f 2>nul

:: Build and start production container
echo [STEP 2] Building production image...
docker-compose -f docker-compose.prod.yml build --no-cache
if %errorlevel% neq 0 (
    echo [ERROR] Docker build failed
    pause
    exit /b 1
)

echo [STEP 3] Starting production container...
docker-compose -f docker-compose.prod.yml up -d
if %errorlevel% neq 0 (
    echo [ERROR] Docker startup failed
    pause
    exit /b 1
)

echo [STEP 4] Checking container status...
timeout /t 10 /nobreak >nul
docker-compose -f docker-compose.prod.yml ps

echo.
echo ========================================
echo   Production Deployment Complete!
echo ========================================
echo.
echo [INFO] Application URL: http://localhost:3000
echo [INFO] Health Check: http://localhost:3000/api/health
echo [INFO] View logs: docker-compose -f docker-compose.prod.yml logs -f
echo [INFO] Stop: docker-compose -f docker-compose.prod.yml down
echo.
pause