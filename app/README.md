# Scholar's Desk application

For current installation instructions, features, privacy and limitations, start with the [project README](../README.md). Scholar's Desk was originally named ReEntry; internal paths and storage keys retain that name.

## Run from the workspace root in PowerShell

The prebuilt extension is in `app/extension/dist`. To rebuild:

```powershell
.\scripts\build_extension.ps1
```

The script installs locked Node dependencies in a fresh temporary directory, type-checks, builds, runs domain tests and copies the bundle back. This avoids this workspace's node_modules write restriction. Temporary build files remain available for debugging.

After installing the backend dependencies below, start it from the repository root:

```powershell
.\scripts\start_backend.ps1
```

For another environment:

```powershell
python -m venv app/backend/.venv
.\app\backend\.venv\Scripts\python.exe -m pip install -r app/backend/requirements.txt
.\app\backend\.venv\Scripts\python.exe -m uvicorn main:app --app-dir app/backend --host 127.0.0.1 --port 8765
```

Health: http://127.0.0.1:8765/health. Optional preview: run `.\scripts\start_preview.ps1`, then open http://127.0.0.1:5173. The preview supports local editing and review, but not extension-only capture or tab restoration. Its storage is separate from the installed extension.

## Load the extension
1. Open `chrome://extensions` or `edge://extensions`.
2. Enable Developer mode and choose Load unpacked.
3. Choose the complete `app/extension/dist` directory.
4. Pin Scholar's Desk and click its toolbar action to open the side panel.
5. Create a workspace. Select webpage body text, right-click and choose Save selection to Scholar's Desk.
6. Start a capture session to collect supported pages automatically. Pause or exclude pages you do not want saved. Restoring saved pages reuses matching URLs and leaves unrelated tabs open.

PDF viewers, browser-internal pages, arbitrary rich editors and exact restoration after page redesign are unsupported. Saved passages remain available offline.

## Optional AI
Manual review needs no key. Configure MODEL_API_KEY, MODEL_NAME and MODEL_BASE_URL in backend/.env or the terminal environment before starting the service. The backend loads its local .env; explicit environment variables take precedence. See backend/.env.example for placeholder configuration. Never put keys into extension files or VITE_* variables. Provider availability and quota must be checked with your account.

The example workspace contains invented benchmark passages. Backend fixture URLs: `/fixtures/desktop`, `/fixtures/mobile`, `/fixtures/scope`. Test model fixtures are not live output.

## Checks
Backend (requires pytest): `python -m pytest app/backend/test_backend.py -q --basetemp=tmp/backend-tests -o asyncio_default_fixture_loop_scope=function`.
The build script includes TypeScript checks and four domain tests.
`scripts/browser_smoke.cjs` attempts an unpacked Edge test with Playwright. Set PLAYWRIGHT_MODULE if needed. Edge launch failed in this sandbox; native extension checks remain pending. Preview UI was tested separately in the in-app browser.

## Automatic research sessions
Reload Scholar's Desk after rebuilding. Open an ordinary webpage and choose Start session on the Home page. Approve optional HTTP/HTTPS site access only if you want automatic capture across research sites. This permission is broad, while capture is restricted by the visible session-tab list. Tabs opened from included tabs are included via their opener relationship; use Include current tab for other tabs. Exclude private pages before navigating them. Pause/Resume controls new captures and Finish capture stops the session. Navigate to Research to add a learning reflection and download the context report. HTML reports can be printed to PDF. Captured page text is bounded, may include layout text, and is not proof of understanding or correctness. Download reports before starting another session; previous report state is archived locally but no archive browser is implemented yet.

### Reproducible extension build on Windows
From the repository root, run `powershell -ExecutionPolicy Bypass -File scripts/build_extension.ps1`. It installs locked dependencies in a fresh temporary directory, checks TypeScript, runs the extension tests and copies the production bundle to `app/extension/dist`. This avoids locked OneDrive dependency directories. `-Offline` only works when all required packages are cached.

After finishing a session, the report view attempts to generate and download its brief. If the backend is offline, start `scripts/start_backend.ps1` and use **Create and download report** to retry. The backend connection indicator checks reachability and key configuration, not provider quota or key validity.

Research questions use local keyword matching plus optional model-based semantic source selection. Up to 24 candidate previews are sent to the configured answer provider; up to six selected excerpts are then used for the cited answer. Session/date/workspace filters apply before selection. This does not use a vector embedding index.
