@echo off
setlocal EnableDelayedExpansion
title CELEBI System - Stop Script
color 0C

echo.
echo ============================================
echo   STOPPING CELEBI WAREHOUSE SYSTEM
echo ============================================
echo.

echo [1/2] Killing ALL Node.js processes...
taskkill /IM node.exe /F >nul 2>&1
if !errorlevel! equ 0 (
    echo   OK - All Node.js processes killed
) else (
    echo   OK - No Node.js processes found
)

echo.
echo [2/2] Freeing ports 6868, 5173-5180...
for %%p in (6868 5173 5174 5175 5176 5177 5178 5179 5180) do (
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :%%p 2^>nul') do (
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo.
echo ============================================
echo   CELEBI SYSTEM STOPPED
echo ============================================
echo.
pause
