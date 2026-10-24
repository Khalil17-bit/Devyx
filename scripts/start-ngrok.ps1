<#
.SYNOPSIS
  Launches the ngrok tunnel for Devyx n8n bot (port 5678) and prints the exact webhook URL to share with Khalil.
#>

$ErrorActionPreference = "Continue"

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "         DEVYX - BOT NGROK TUNNEL LAUNCHER" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# Locate ngrok
$ngrokPath = (Get-Command ngrok -ErrorAction SilentlyContinue)?.Source
if (-not $ngrokPath) {
    $wingetNgrok = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Ngrok.Ngrok_Microsoft.Winget.Source_8wekyb3d8bbwe\ngrok.exe"
    if (Test-Path $wingetNgrok) {
        $ngrokPath = $wingetNgrok
    } else {
        Write-Host "[ERROR] ngrok is not found. Please install ngrok or add it to PATH." -ForegroundColor Red
        exit 1
    }
}

# Check if authtoken is configured
$configCheck = & $ngrokPath config check 2>&1
if ($LASTEXITCODE -ne 0 -or $configCheck -match "The system cannot find the path specified") {
    Write-Host "[!] ngrok authtoken is required by ngrok." -ForegroundColor Yellow
    Write-Host "Get your free authtoken at: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor Gray
    $token = Read-Host "Paste your ngrok authtoken here (or press Enter to skip if already set)"
    if ($token -and $token.Trim() -ne "") {
        & $ngrokPath config add-authtoken $token.Trim()
        Write-Host "[OK] Authtoken saved successfully!`n" -ForegroundColor Green
    }
}

# Check if n8n is running
$n8nRunning = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 5678 }
if (-not $n8nRunning) {
    Write-Host "[WARN] n8n does not appear to be running on port 5678." -ForegroundColor Yellow
    Write-Host "Make sure Docker / n8n is running so the bot can answer Khalil's requests.`n" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Local n8n is active and listening on port 5678." -ForegroundColor Green
}

# Start ngrok in background job or direct
Write-Host "`nStarting ngrok tunnel for port 5678..." -ForegroundColor Cyan
Write-Host "Starting tunnel on http://localhost:5678... Press Ctrl+C to stop.`n" -ForegroundColor Gray

& $ngrokPath http 5678
