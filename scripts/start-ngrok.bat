@echo off
title Devyx - Bot Ngrok Tunnel (Port 5678)
echo ============================================================
echo   DEVYX BOT NGROK TUNNEL LAUNCHER
echo ============================================================
echo.

:: Detect ngrok binary
set "NGROK_EXE=ngrok"
where ngrok >nul 2>nul
if %errorlevel% neq 0 (
    set "NGROK_EXE=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
)

:: Check if n8n port 5678 is active
netstat -ano | findstr ":5678 " >nul
if %errorlevel% neq 0 (
    echo [WARNING] Port 5678 does not appear to be listening yet.
    echo Make sure your Docker container or n8n instance is running.
    echo.
)

echo Starting ngrok tunnel for local n8n on port 5678...
echo Tunnel URL will be shown below:
echo ------------------------------------------------------------
"%NGROK_EXE%" http 5678

pause
