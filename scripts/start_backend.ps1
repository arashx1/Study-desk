$ErrorActionPreference = 'Stop'
$reentryRoot = Split-Path -Parent $PSScriptRoot

$healthResponse = & curl.exe --silent --show-error --max-time 2 http://127.0.0.1:8765/health 2>$null
if ($LASTEXITCODE -eq 0) {
    $health = $healthResponse | ConvertFrom-Json -ErrorAction Stop
    if ($health.status -eq 'ok') {
        Write-Host "Scholar's Desk backend is already running and healthy at http://127.0.0.1:8765."
        return
    }
}

$listener = Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    $processName = if ($process) { $process.Name } else { 'unknown process' }
    throw "Port 8765 is already in use by $processName (PID $($listener.OwningProcess)), but its health check did not identify a healthy Scholar's Desk backend."
}

python -m uvicorn main:app --app-dir (Join-Path $reentryRoot 'app\backend') --host 127.0.0.1 --port 8765
