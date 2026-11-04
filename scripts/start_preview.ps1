$ErrorActionPreference = 'Stop'
$reentryRoot = Split-Path -Parent $PSScriptRoot
python -m http.server 5173 --bind 127.0.0.1 --directory (Join-Path $reentryRoot 'app\extension\dist')
