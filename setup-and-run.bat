@echo off
echo ========================================================
echo   Pediatric Health Hub - One-Click Setup ^& Run Script
echo ========================================================
echo.

echo Checking for Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js v18+ and try again.
    pause
    exit /b
)

echo.
echo [1/4] Installing Backend Dependencies...
cd backend
call npm install

echo.
echo [2/4] Setting up Database and Seeding Default Users...
echo Note: Make sure your MySQL database is running and backend/.env is correctly configured.
call npx prisma generate
call npx prisma db push
echo Seeding default users (Admin, Doctor, Facility, Parent)...
call node prisma/seed.js
cd ..

echo.
echo [3/4] Installing Frontend Dependencies...
cd frontend
call npm install
cd ..

echo.
echo [4/4] Starting the Application...
echo Starting Backend Server in a new window...
start cmd /k "cd backend && npm run dev"

echo Starting Frontend Server in a new window...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo   Setup Complete! 
echo   The backend and frontend are starting in separate windows.
echo   Once they load, you can access the app at:
echo   http://localhost:5173
echo.
echo   Default Credentials:
echo   Admin:    admin@pediatric-hub.com    / admin123
echo   Doctor:   doctor@pediatric-hub.com   / doctor123
echo   Facility: facility@pediatric-hub.com / facility123
echo   Parent:   parent@pediatric-hub.com   / parent123
echo ========================================================
pause
