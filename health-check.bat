@echo off
echo ========================================
echo    Scale42 Projects - Health Check
echo ========================================

set PROD_URL=https://s42_v3.edbmotte.com
set DEV_URL=https://beta.s42_v3.edbmotte.com

echo [INFO] Testing Production URL: %PROD_URL%
echo.

echo [STEP 1] Testing main page...
curl -s -o nul -w "HTTP Status: %%{http_code} | Response Time: %%{time_total}s\n" %PROD_URL%

echo [STEP 2] Testing health endpoint...
curl -s -w "HTTP Status: %%{http_code} | Response Time: %%{time_total}s\n" %PROD_URL%/api/health

echo [STEP 3] Testing with verbose output...
echo Full health check response:
curl -s %PROD_URL%/api/health

echo.
echo ========================================
echo [INFO] Testing Dev URL: %DEV_URL%
echo.

echo [STEP 1] Testing main page...
curl -s -o nul -w "HTTP Status: %%{http_code} | Response Time: %%{time_total}s\n" %DEV_URL%

echo [STEP 2] Testing health endpoint...
curl -s -w "HTTP Status: %%{http_code} | Response Time: %%{time_total}s\n" %DEV_URL%/api/health

echo [STEP 3] Testing with verbose output...
echo Full health check response:
curl -s %DEV_URL%/api/health

echo.
echo ========================================
echo [INFO] Health check complete
pause