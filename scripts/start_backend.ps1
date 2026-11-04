$ErrorActionPreference = 'Stop'
$reentryRoot = Split-Path -Parent $PSScriptRoot

try {
    $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8765/health' -TimeoutSec 2 -ErrorAction Stop
    if ($health.status -eq 'ok') {
        Write-Host "Backend is already running at http://127.0.0.1:8765."
        return
    }
} catch { # An offline backend is expected before starting it.
}

$listener = Get-NetTCPConnection -LocalPort 8765 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    $processName = if ($process) { $process.Name } else { 'unknown process' }
    throw "Port 8765 is already in use by $processName (PID $($listener.OwningProcess)), but its health check did not identify a healthy Scholar's Desk backend."
}

$backendPython = Join-Path $reentryRoot 'app\backend\.venv\Scripts\python.exe'
if (!(Test-Path $backendPython)) { $backendPython = 'python' }
& $backendPython -m uvicorn main:app --app-dir (Join-Path $reentryRoot 'app\backend') --host 127.0.0.1 --port 8765
