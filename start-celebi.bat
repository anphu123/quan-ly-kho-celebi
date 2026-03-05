@echo off
setlocal EnableDelayedExpansion
title CELEBI - Start System (LAN)
color 0A

echo.
echo ============================================
echo   CELEBI WAREHOUSE MANAGEMENT SYSTEM
echo   Starting with LAN Access...
echo ============================================
echo.

cd /d "%~dp0"

if not exist "apps\backend" (
    echo ERROR: Run from project root d:\quan_ly_kho_celebi
    pause
    exit /b 1
)

echo [1/4] Killing ALL existing Node.js processes...
taskkill /IM node.exe /F >nul 2>&1
echo   OK - Done

echo.
echo [2/4] Freeing ports 6868 and 5173-5180...
for %%p in (6868 5173 5174 5175 5176 5177 5178 5179 5180) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p 2^>nul') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)
timeout /t 2 /nobreak >nul
echo   OK - Ports freed

echo.
echo [3/4] Starting Backend (port 6868)...
start "CELEBI Backend" cmd /k "cd /d %~dp0apps\backend && pnpm dev"
echo   Waiting 10s for backend to initialize...
timeout /t 10 /nobreak >nul

echo.
echo [4/4] Starting Frontend with LAN support...
start "CELEBI Frontend" cmd /k "cd /d %~dp0apps\web && pnpm dev --host"
echo   Waiting 5s for frontend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   SYSTEM READY!
echo ============================================

REM Get LAN IP
set LAN_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    for /f "tokens=1" %%b in ("%%a") do set LAN_IP=%%b
    goto :got_ip
)
:got_ip
set LAN_IP=%LAN_IP: =%

echo.
echo   BACKEND  ^> Local : http://localhost:6868
echo   BACKEND  ^> LAN   : http://%LAN_IP%:6868
echo   BACKEND  ^> Docs  : http://localhost:6868/api
echo.
echo   FRONTEND ^> Local : http://localhost:5176
echo   FRONTEND ^> LAN   : http://%LAN_IP%:5176
echo.
echo   LOGIN: admin@celebi.com / Admin@123
echo.
echo ============================================
echo.
echo Press any key to open browser...
pause >nul
start http://%LAN_IP%:5176
