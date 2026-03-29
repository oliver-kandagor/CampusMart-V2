@echo off
REM CampusMart V2 - Development Server Launcher

echo.
echo ========================================
echo CampusMart V2 - Starting Development
echo ========================================
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: pnpm is not installed
    echo Please install: npm install -g pnpm
    pause
    exit /b 1
)

echo Starting both API server and frontend...
echo.
echo This will open 2 new windows:
echo - API Server (port 5000)
echo - Frontend (port 5173)
echo.
echo Press any key to continue...
pause

REM Start API Server in new window
start "CampusMart API Server" cmd /k "cd artifacts\api-server && pnpm run start"

REM Wait a moment for API to start
timeout /t 2 /nobreak

REM Start Frontend in new window
start "CampusMart Frontend" cmd /k "cd artifacts\campusmart && pnpm run dev"

echo.
echo ========================================
echo Servers starting...
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo API: http://localhost:5000
echo.
echo Check the new windows for server output.
echo.
pause
