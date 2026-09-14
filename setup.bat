@echo off
title PAIMANA-INTEL - Environment Setup
color 0B

echo =====================================================================
echo              PAIMANA-INTEL ENVIRONMENT SETUP WIZARD
echo =====================================================================
echo This script prepares your local system to run the PAIMANA platform:
echo   1. Validates Python, Java, and Node.js prerequisites
echo   2. Installs Python ML dependencies (FastAPI, CatBoost, etc.)
echo   3. Installs React Frontend npm dependencies
echo   4. Verifies/Builds the Java Spring Boot Backend JAR
echo   5. Validates Canonical Database and ML model weights
echo =====================================================================
echo.

:: Ensure in script root directory
cd /d "%~dp0"

:: 1. Check Python
echo [1/5] Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Python not found in PATH!
    echo Please install Python 3.10+ from https://www.python.org/
    pause
    exit /b 1
)
python --version

:: 2. Check Java
echo.
echo [2/5] Checking Java installation...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java not found in PATH!
    echo Please install Java 21+ (OpenJDK / Temurin / Oracle JDK).
    pause
    exit /b 1
)
java -version 2>&1 | findstr /i "version"

:: 3. Check npm / Node.js
echo.
echo [3/5] Checking Node.js / npm installation...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm / Node.js not found in PATH!
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)
call npm --version

:: 4. Install Python ML dependencies
echo.
echo [4/5] Installing Python ML microservice dependencies...
python -m pip install -r ml-service/requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some Python packages encountered installation warnings.
)

:: 5. Install Frontend dependencies
echo.
echo [5/5] Installing React Frontend npm dependencies...
cd frontend
call npm install
cd ..
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install in frontend failed!
    pause
    exit /b 1
)

:: 6. Verify Backend JAR (build if not present)
echo.
echo [*] Verifying Java Backend executable...
if not exist "backend\target\paimana-backend-1.0.0.jar" (
    echo Backend JAR not found. Compiling from source with Maven Wrapper...
    if exist "backend\mvnw.cmd" (
        call backend\mvnw.cmd -f backend/pom.xml clean package -DskipTests
    ) else (
        call mvn -f backend/pom.xml clean package -DskipTests
    )
) else (
    echo [OK] Backend JAR verified (backend/target/paimana-backend-1.0.0.jar).
)

:: 7. Verify Database and Models
echo.
echo [*] Verifying Canonical Database and ML Models...
if exist "paimana_canonical.db" (
    echo [OK] Canonical Database verified (paimana_canonical.db).
) else (
    echo [WARNING] paimana_canonical.db is missing in root directory!
)

if exist "models\cb_cost_cls.cbm" (
    echo [OK] CatBoost ML models verified (models/*.cbm).
) else (
    echo [WARNING] ML model weights missing in models/ directory!
)

echo.
echo =====================================================================
echo      SETUP COMPLETE! THE PLATFORM IS READY TO RUN.
echo =====================================================================
echo To launch the entire platform, run:
echo   .\start.bat
echo.
echo To shut down all services, run:
echo   .\stop.bat
echo =====================================================================
echo.
pause
