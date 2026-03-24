@echo off
echo ==========================================
echo Starting Celebi Inventory ^& POS System...
echo ==========================================

echo [1/3] Starting Docker services (PostgreSQL, Redis, MinIO)...
cd /d "%~dp0docker"
docker-compose up -d

echo.
echo [2/3] Starting Backend Server...
cd /d "%~dp0"
start "Celebi Backend API" cmd /c "cd apps\backend && pnpm run dev"

echo [3/3] Starting Frontend Web App...
start "Celebi Frontend Web" cmd /c "cd apps\web && pnpm run dev --host 0.0.0.0"

echo.
echo Servers are booting up!
echo - Services: Database ^& Redis (Running in background via Docker)
echo - Backend: http://localhost:6868/api/v1 (Window will pop up)
echo - Frontend: http://localhost:5173 (Window will pop up)
echo.
echo Press any key to exit this launcher (the servers will keep running).
pause > nul
