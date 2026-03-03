@echo off
setlocal EnableDelayedExpansion
title CELEBI Warehouse Management System - Startup Script
color 0A

echo.
echo ============================================
echo   CELEBI WAREHOUSE MANAGEMENT SYSTEM      
echo ============================================
echo.

REM Check if we're in the correct directory
if not exist "apps\backend" (
    echo Error: Please run this script from the project root directory
    echo Current directory: %cd%
    echo Expected: d:\quan_ly_kho_celebi
    pause
    exit /b 1
)

echo [1/4] Checking for existing processes...
echo.

REM Stop existing Node processes on our ports
echo Stopping existing backend (port 6868)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6868') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 echo   - Stopped process %%a
)

echo Stopping existing frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 echo   - Stopped process %%a
)

REM Stop any remaining Node processes (safety measure)
echo Stopping any remaining Node processes...
taskkill /IM node.exe /F >nul 2>&1

echo.
echo [2/4] Waiting for ports to be freed...
timeout /t 3 /nobreak >nul

echo.
echo [3/4] Starting CELEBI Backend...
cd apps\backend
echo   URL: http://localhost:6868
echo   API Docs: http://localhost:6868/api
start "CELEBI Backend" cmd /c "pnpm run dev & pause"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

echo.
echo [4/4] Starting CELEBI Frontend...
cd ..\web
echo   URL: http://localhost:5173
start "CELEBI Frontend" cmd /c "pnpm run dev & pause"

echo.
echo ============================================
echo   CELEBI SYSTEM STARTUP COMPLETED!        
echo ============================================
echo.
echo Backend API:  http://localhost:6868
echo Frontend UI:  http://localhost:5173
echo API Docs:     http://localhost:6868/api
echo.
echo Login Credentials:
echo   Admin: admin@celebi.com / Admin@123
echo   QC:    qc@celebi.com / QC@123
echo   Tech:  tech@celebi.com / Tech@123
echo.
echo Both services are starting in separate windows...
echo Press any key to continue or Ctrl+C to exit
pause >nul

REM Return to project root
cd ..\..