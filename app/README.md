# Scholar's Desk application

## Run from the workspace root in PowerShell

The prebuilt extension is in `app/extension/dist`. To rebuild:

```powershell
.\scripts\build_extension.ps1
```

The script installs locked Node dependencies in a fresh temporary directory, type-checks, builds, runs domain tests and copies the bundle back. This avoids this workspace's node_modules write restriction. Temporary build files remain available for debugging.

Backend dependencies were already available on this computer. To start it here:

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
6. Add task tabs individually with Save current tab; approve the page-specific permission when appropriate. Restore tabs reuses matching URLs and leaves unrelated tabs open.

PDF viewers, browser-internal pages, arbitrary rich editors and exact restoration after page redesign are unsupported. Saved passages remain available offline.

## Optional AI
Manual review needs no key. The AI comparison uses an OpenAI-compatible HTTPS chat-completions endpoint. Set MODEL_API_KEY, MODEL_NAME and optionally MODEL_BASE_URL in the backend terminal environment before starting it. See backend/.env.example; it is not automatically loaded. Never put keys into extension files or VITE_* variables. No real provider call has been verified.

The example workspace contains invented benchmark passages. Backend fixture URLs: `/fixtures/desktop`, `/fixtures/mobile`, `/fixtures/scope`. Test model fixtures are not live output.

## Checks
Backend (requires pytest): `python -m pytest app/backend/test_backend.py -q --basetemp=tmp/backend-tests -o asyncio_default_fixture_loop_scope=function`.
The build script includes TypeScript checks and four domain tests.
`scripts/browser_smoke.cjs` attempts an unpacked Edge test with Playwright. Set PLAYWRIGHT_MODULE if needed. Edge launch failed in this sandbox; native extension checks remain pending. Preview UI was tested separately in the in-app browser.

## Automatic research sessions
Reload Scholar's Desk after rebuilding. Open an ordinary webpage and choose Start session on the Home page. Approve optional HTTP/HTTPS site access only if you want automatic capture across research sites. This permission is broad, while capture is restricted by the visible session-tab list. Tabs opened from included tabs are included via their opener relationship; use Include current tab for other tabs. Exclude private pages before navigating them. Pause/Resume controls new captures and Finish capture stops the session. Navigate to Research to add a learning reflection and download the context report. HTML reports can be printed to PDF. Captured page text is bounded, may include layout text, and is not proof of understanding or correctness. Download reports before starting another session; previous report state is archived locally but no archive browser is implemented yet.
