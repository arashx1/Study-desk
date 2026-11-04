$ErrorActionPreference = 'Stop'
$reentryRoot = Split-Path -Parent $PSScriptRoot
$reentrySource = Join-Path $reentryRoot 'app\extension'
# Build outside OneDrive when its node_modules directories are write-restricted.
$reentryBuild = Join-Path $env:TEMP ('reentry-build-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $reentryBuild | Out-Null
foreach ($reentryName in @('package.json','package-lock.json','tsconfig.json','vite.config.ts','index.html','src','public','tests')) {
  Copy-Item -LiteralPath (Join-Path $reentrySource $reentryName) -Destination $reentryBuild -Recurse
}
Push-Location $reentryBuild
try {
  npm ci --prefer-offline --ignore-scripts --no-audit --no-fund --fetch-retries=1 --fetch-timeout=60000
  if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
  node node_modules/typescript/bin/tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw 'Type checking failed.' }
  node node_modules/vite/bin/vite.js build
  if ($LASTEXITCODE -ne 0) { throw 'Type checking or extension build failed.' }
  node --experimental-strip-types --test tests/domain.test.ts
  if ($LASTEXITCODE -ne 0) { throw 'Extension domain checks failed.' }
} finally { Pop-Location }
Copy-Item -LiteralPath (Join-Path $reentryBuild 'dist') -Destination $reentrySource -Recurse -Force
Write-Output ('Verified extension build: ' + (Join-Path $reentrySource 'dist'))
