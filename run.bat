@echo off
title PAIMANA-INTEL - Launch System
color 0A

echo =====================================================================
echo               PAIMANA-INTEL PLATFORM LAUNCHER
echo =====================================================================
echo.

:: Ensure we are in the script's root directory
cd /d "%~dp0"

:: 1. Verify Prerequisites
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found in PATH! Please install Python or add it to PATH.
    pause
    exit /b 1
)

where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found in PATH! Please install Java 21+ or add it to PATH.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm / Node.js not found in PATH! Please install Node.js.
    pause
    exit /b 1
)

echo [1/4] Starting Python ML Service on http://127.0.0.1:8000 ...
start "PAIMANA - ML Service (Port 8000)" /D "%~dp0." cmd /k "title PAIMANA ML Service && color 0B && python -m uvicorn main:app --app-dir ml-service --port 8000 --host 127.0.0.1"

echo [2/4] Starting Java Backend on http://127.0.0.1:8080 ...
start "PAIMANA - Java Backend (Port 8080)" /D "%~dp0." cmd /k "title PAIMANA Java Backend && color 0E && java -jar backend/target/paimana-backend-1.0.0.jar"

echo [3/4] Starting React Frontend on http://127.0.0.1:5173 ...
start "PAIMANA - Frontend (Port 5173)" /D "%~dp0frontend" cmd /k "title PAIMANA Frontend && color 0D && npm run dev -- --host 127.0.0.1"

echo [4/4] Waiting for services to initialize...
powershell -NoProfile -Command "Start-Sleep -Seconds 5"

echo.
echo =====================================================================
echo   ALL SERVICES STARTED SUCCESSFULLY!
echo =====================================================================
echo   - Frontend UI:  http://127.0.0.1:5173/
echo   - Java Backend: http://127.0.0.1:8080/api/v1/home
echo   - ML Service:   http://127.0.0.1:8000/docs
echo =====================================================================
echo.
echo Opening PAIMANA Dashboard in your default browser...
start http://127.0.0.1:5173/

echo.
echo To stop all services at any time, run 'stop.bat' or close the opened service windows.
echo You can close this launcher window safely.
echo.
pause
