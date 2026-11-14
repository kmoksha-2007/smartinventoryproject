@echo off
TITLE Smart Inventory System Launcher
cd /d "%~dp0"

echo ========================================================
echo   Starting Smart Inventory System (Full Stack App)
echo ========================================================
echo.

:: 1. Check if running inside an unextracted zip
echo "%~dp0" | findstr /i "\.zip" >nul
if %ERRORLEVEL% equ 0 (
    echo ========================================================
    echo [ERROR] You are running directly inside a ZIP archive!
    echo ========================================================
    echo.
    echo Windows opened this file inside "SmartInventorySystem.zip".
    echo Node.js cannot run packages from inside a compressed zip file.
    echo.
    echo TO FIX THIS IN 10 SECONDS:
    echo 1. Right-click on "SmartInventorySystem.zip"
    echo 2. Click "Extract All..."
    echo 3. Choose a destination folder and click "Extract"
    echo 4. Open the extracted folder and run start-app.bat
    echo.
    pause
    exit /b 1
)

:: 2. Check if backend folder exists
if not exist "%~dp0backend" (
    echo [ERROR] Backend folder not found at: "%~dp0backend"
    pause
    exit /b 1
)

:: 3. Check if frontend folder exists
if not exist "%~dp0frontend" (
    echo [ERROR] Frontend folder not found at: "%~dp0frontend"
    pause
    exit /b 1
)

:: 4. Auto-install backend dependencies if missing
if not exist "%~dp0backend\node_modules\express" (
    echo [INFO] Backend node_modules not found. Installing packages...
    cd /d "%~dp0backend"
    call npm install
    cd /d "%~dp0"
    echo [OK] Backend dependencies installed successfully!
    echo.
)

:: 5. Auto-install frontend dependencies if missing
if not exist "%~dp0frontend\node_modules\vite" (
    echo [INFO] Frontend node_modules not found. Installing packages...
    cd /d "%~dp0frontend"
    call npm install
    cd /d "%~dp0"
    echo [OK] Frontend dependencies installed successfully!
    echo.
)

echo [1/2] Starting Backend API Server (Port 5000)...
start "Smart Inventory - Backend" /D "%~dp0backend" cmd /k "npm start"

ping 127.0.0.1 -n 4 >nul

echo [2/2] Starting Frontend React App (Port 5173)...
start "Smart Inventory - Frontend" /D "%~dp0frontend" cmd /k "npm run dev"

ping 127.0.0.1 -n 6 >nul

echo Opening browser at http://localhost:5173/ ...
start "" "http://localhost:5173/"

echo.
echo ========================================================
echo   Smart Inventory System is running!
echo   👉 Frontend: http://localhost:5173
echo   👉 Backend:  http://localhost:5000/api/health
echo ========================================================
echo (Keep this window open or press any key to close this launcher)
pause
