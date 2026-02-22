<#
PowerShell helper to install backend deps, stop any process on port 5000, and start the backend.
Run as: PowerShell -ExecutionPolicy Bypass -File .\scripts\run-backend.ps1
#>
param(
    [string]$BackendDir = "D:\\college_Project\\backend",
    [int]$Port = 5000
)

Write-Host "Running backend helper..." -ForegroundColor Cyan

# 1) Ensure MySQL service is running (best-effort)
Write-Host "Checking MySQL services..." -ForegroundColor Yellow
Get-Service -Name MySQL* -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Found service:" $_.Name, "Status:" $_.Status
    if ($_.Status -ne 'Running') {
        Write-Host "Starting service $_.Name..."
        Start-Service -Name $_.Name -ErrorAction SilentlyContinue
    }
}

# 2) Install npm deps if needed
if (!(Test-Path "$BackendDir\node_modules")) {
    Write-Host "Installing backend npm dependencies..." -ForegroundColor Yellow
    Push-Location $BackendDir
    npm install
    Pop-Location
} else {
    Write-Host "Backend dependencies already present." -ForegroundColor Green
}

# 3) Kill any process listening on the port (use Get-NetTCPConnection reliably)
Write-Host "Checking for process on port $Port..." -ForegroundColor Yellow
try {
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections -and $connections.Count -gt 0) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            try {
                Write-Host "Stopping process PID $pid" -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            } catch {
                # Avoid string interpolation issues by formatting the message explicitly
                Write-Host ("Failed stopping PID {0}: {1}" -f $pid, $_) -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No process found on port $Port." -ForegroundColor Green
    }
} catch {
    Write-Host "Could not enumerate connections (you might not have permissions). Falling back to netstat..." -ForegroundColor Yellow
    $net = netstat -ano | Select-String ":$Port" -Quiet
    if ($net) { Write-Host "Port $Port appears in netstat output, please inspect manually." -ForegroundColor Yellow }
}

# 4) Start backend in a new window (so the script returns)
Write-Host "Starting backend (node server.js) in $BackendDir ..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory $BackendDir -WindowStyle Normal
Write-Host "Backend started (check the new terminal window)." -ForegroundColor Green
Write-Host "If server fails with EADDRINUSE, re-run this script after stopping conflicting process or choose a different PORT." -ForegroundColor Yellow

Write-Host "Done." -ForegroundColor Cyan
