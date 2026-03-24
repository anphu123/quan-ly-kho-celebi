@echo off
setlocal EnableDelayedExpansion
title CELEBI - System Status
color 0B

echo.
echo ============================================
echo   CELEBI WAREHOUSE SYSTEM STATUS
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
echo [1/3] Backend (port 6868)...
netstat -ano | findstr ":6868 " | findstr "LISTENING" >nul 2>&1
if !errorlevel! equ 0 (
    echo   OK - Backend is RUNNING
    echo   Local : http://localhost:6868
    echo   LAN   : http://%LAN_IP%:6868
    echo   Docs  : http://localhost:6868/api
) else (
    echo   OFFLINE - Backend is NOT running
)

echo.
echo [2/3] Frontend (ports 5173-5180)...
set FE_PORT=
set FE_RUNNING=0
for %%p in (5173 5174 5175 5176 5177 5178 5179 5180) do (
    netstat -ano | findstr ":%%p " | findstr "LISTENING" >nul 2>&1
    if !errorlevel! equ 0 (
        if !FE_RUNNING! equ 0 (
            set FE_PORT=%%p
            set FE_RUNNING=1
        )
    )
)
if !FE_RUNNING! equ 1 (
    echo   OK - Frontend is RUNNING on port %FE_PORT%
    echo   Local : http://localhost:%FE_PORT%
    echo   LAN   : http://%LAN_IP%:%FE_PORT%
) else (
    echo   OFFLINE - Frontend is NOT running
)

echo.
echo [3/3] Node.js processes...
tasklist /FI "IMAGENAME eq node.exe" 2>nul | findstr node.exe
if !errorlevel! neq 0 echo   No Node.js processes found

echo.
echo ============================================
echo   Your LAN IP: %LAN_IP%
echo ============================================
echo.
pause
