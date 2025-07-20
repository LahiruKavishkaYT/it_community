@echo off
echo.
echo 🔧 IT Community - Port Conflict Resolution
echo ==========================================
echo.

echo 🔍 Killing processes on port 3001 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo 🔍 Killing processes on port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo 🔍 Killing processes on port 3000 (Admin Dashboard)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do (
    echo Killing process %%a
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo ✅ Port cleanup completed!
echo.
echo 🚀 Ready to start services:
echo    Backend:         cd backend ^&^& npm run start:dev
echo    Frontend:        cd frontend ^&^& npm run dev  
echo    Admin Dashboard: cd admin-dashboard ^&^& npm run dev
echo.
echo 💡 Run each service in a separate terminal window!
echo.
pause 