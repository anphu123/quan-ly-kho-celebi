@echo off
title CELEBI System - Status Check
color 0B

echo.
echo ============================================
echo   CELEBI WAREHOUSE SYSTEM STATUS          
echo ============================================
echo.

echo [1/4] Checking Backend (port 6868)...
netstat -ano | findstr :6868 >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Backend is RUNNING on port 6868
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6868') do echo     Process ID: %%a
) else (
    echo   ✗ Backend is NOT running on port 6868
)

echo.
echo [2/4] Checking Frontend (port 5173)...
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ Frontend is RUNNING on port 5173
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do echo     Process ID: %%a
) else (
    echo   ✗ Frontend is NOT running on port 5173
)

echo.
echo [3/4] Testing Backend API...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:6868' -UseBasicParsing -TimeoutSec 3; Write-Host '   ✓ Backend API is responding' -ForegroundColor Green } catch { Write-Host '   ✗ Backend API is not responding' -ForegroundColor Red }"

echo.
echo [4/4] Testing Frontend...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 3; Write-Host '   ✓ Frontend is responding' -ForegroundColor Green } catch { Write-Host '   ✗ Frontend is not responding' -ForegroundColor Red }"

echo.
echo ============================================
echo   SYSTEM URLS                              
echo ============================================
echo   Backend API:  http://localhost:6868
echo   Frontend UI:  http://localhost:5173  
echo   API Docs:     http://localhost:6868/api
echo.
echo ============================================
echo   RUNNING NODE PROCESSES                   
echo ============================================
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe
if %errorlevel% neq 0 echo   No Node.js processes found

echo.
pause