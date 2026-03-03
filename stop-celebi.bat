@echo off
title CELEBI System - Stop Script
color 0C

echo.
echo ============================================
echo   STOPPING CELEBI WAREHOUSE SYSTEM        
echo ============================================
echo.

echo [1/3] Stopping Backend (port 6868)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6868') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo   ✓ Stopped backend process %%a
    ) else (
        echo   ✗ Failed to stop process %%a
    )
)

echo.
echo [2/3] Stopping Frontend (port 5173)...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /PID %%a /F >nul 2>&1
    if !errorlevel! equ 0 (
        echo   ✓ Stopped frontend process %%a
    ) else (
        echo   ✗ Failed to stop process %%a
    )
)

echo.
echo [3/3] Stopping all remaining Node.js processes...
taskkill /IM node.exe /F >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ All Node.js processes stopped
) else (
    echo   ✓ No additional Node.js processes found
)

echo.
echo ============================================
echo   CELEBI SYSTEM STOPPED SUCCESSFULLY      
echo ============================================
echo.
echo All services have been stopped.
echo You can now run start-celebi.bat to restart the system.
echo.
pause