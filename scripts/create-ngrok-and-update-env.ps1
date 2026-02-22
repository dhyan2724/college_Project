<#
PowerShell helper to run ngrok (assumes ngrok installed and authed) and update public/env.js and build/env.js
Usage:
  PowerShell -ExecutionPolicy Bypass -File .\scripts\create-ngrok-and-update-env.ps1
#>
param(
  [int]$Port = 5000,
  [string]$RepoRoot = "D:\\college_Project"
)

Write-Host "Starting ngrok for port $Port..." -ForegroundColor Cyan
# Start ngrok and capture the HTTPS URL (requires ngrok in PATH)
$ngrokProcess = Start-Process -FilePath ngrok -ArgumentList "http $Port" -NoNewWindow -PassThru
Write-Host "ngrok started (PID $($ngrokProcess.Id))." -ForegroundColor Green
Write-Host "Please copy the HTTPS forwarding URL shown by ngrok (e.g. https://abcd1234.ngrok.io) and paste it below." -ForegroundColor Yellow
$ngrokUrl = Read-Host "Enter ngrok HTTPS URL (leave out trailing /)"
if (-not $ngrokUrl) { Write-Host "No URL provided, aborting."; exit 1 }

$envContent = "// Runtime environment variables for the static frontend.`nwindow._env_ = window._env_ || {};`nwindow._env_.REACT_APP_API_URL = '$ngrokUrl/api';`n"

$publicEnv = Join-Path $RepoRoot "public\env.js"
$buildEnv = Join-Path $RepoRoot "build\env.js"

Write-Host "Updating $publicEnv" -ForegroundColor Cyan
Set-Content -Path $publicEnv -Value $envContent -Encoding UTF8

if (Test-Path $buildEnv) {
  Write-Host "Updating $buildEnv" -ForegroundColor Cyan
  Set-Content -Path $buildEnv -Value $envContent -Encoding UTF8
}

Write-Host "Files updated. Commit the change if you want to keep it in repo." -ForegroundColor Green
Write-Host "If your Netlify is connected to Git, commit & push to trigger a rebuild; otherwise re-deploy the build folder." -ForegroundColor Yellow
