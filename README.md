# Scholar's Desk

**Save your research. Return with context. Trace statements to their sources.**

Scholar's Desk is a Chrome/Edge side-panel extension for capturing research, resuming unfinished tasks, asking questions about saved sources and comparing evidence. Originally called **ReEntry**, it was built for Upside Down's **PS-01: Beyond the App**. Internal filenames and storage keys may retain the original name.

## Features

| Section | Purpose |
| --- | --- |
| Home | Capture sessions, restore saved pages and supported scroll positions, and continue from your last source or next question. |
| Sources | Search saved pages and selected passages, inspect snapshots and reopen originals. |
| Ask | Ask about saved research with session/date filters and citations to retrieved excerpts. |
| Claims & evidence | Compare a statement across two saved sources and optionally link it to writing. |
| Reports | Generate a summary and download an HTML brief. Print it to save a PDF. |
| History | Review saved activity and approved writing revisions. |
| Source updates | Watch public articles, inspect earlier/current text and review linked statements. |

Extraction uses Mozilla Readability with fallback rules. Google snippets and generated answers have a separate capture path. Capturing or comparing a source does not independently verify a fact.

## Install on Windows

You need Git, Node.js with npm, Python and Chrome 116+ or compatible Edge. Builds have been checked with Node 24 and Python 3.13. This local prototype is not a Chrome Web Store release.

```powershell
git clone https://github.com/arashx1/Study-desk.git
cd Study-desk
powershell -ExecutionPolicy Bypass -File scripts/build_extension.ps1
```

The build installs locked dependencies in a temporary directory, checks TypeScript, runs extension tests and writes `app/extension/dist`. This avoids locked OneDrive dependency folders. Network access is needed unless all packages are cached.

1. Open `chrome://extensions` or `edge://extensions`.
2. Enable **Developer mode** and choose **Load unpacked**.
3. Select **`app/extension/dist`**, containing `manifest.json`.
4. Pin **Scholar's Desk**, open its side panel and create a workspace.
5. Start a session and visit supported webpages. Pause or exclude pages you do not want saved. Alternatively, select text and right-click → **Save selection to Scholar's Desk**.

After rebuilding, reload the extension and reopen the panel. Keep the unpacked directory in place.

## Optional AI setup

Saved research works locally. Generated answers, summaries and AI comparisons require the local backend and your provider configuration.

```powershell
python -m venv app/backend/.venv
.\app\backend\.venv\Scripts\python.exe -m pip install -r app/backend/requirements.txt
Copy-Item app/backend/.env.example app/backend/.env
```

Copy the example only if you have not already created your configuration. Edit `app/backend/.env` locally:

```dotenv
MODEL_API_KEY=your_provider_key
MODEL_BASE_URL=https://api.groq.com/openai/v1
MODEL_NAME=openai/gpt-oss-120b
```

Choose a model available to your account. Task-specific answer, summary and comparison settings are optional; see `.env.example`. External search and published fact-check lookup use separate optional keys.

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start_backend.ps1
```

Keep the terminal running. Check **http://127.0.0.1:8765/health** and restart after configuration changes. The connection indicator checks reachability and configuration, not provider quota or key validity.

## Research workflow

1. Create a workspace, start capture and visit source articles.
2. Inspect saved text in **Sources**.
3. Ask a question in **Ask**, or compare two sources in **Claims & evidence**.
4. Save a next step and finish. The report view attempts summary generation and download. Use **Create and download report** to retry a failure.
5. Return to **Home** to resume saved pages or continue with a question.
6. Open **Source updates → Add a source to watch**. The first successful public-page check establishes a baseline.

## How it works

**Retrieval:** workspace/session/date filters apply first. Local keyword matching is combined with optional AI-based semantic source selection over up to 24 previews. The answer uses up to six excerpts and validates source IDs. Failure falls back to keyword retrieval. This is not a vector embedding index and may miss relevant material.

**Monitoring:** static public article text is checked when you open Source updates after a stale check and through Chrome alarms. Before/after text is preserved. Your laptop must be awake, online and running Chrome. No always-on server or changedetection.io integration is configured; intermediate changes can be missed.

## Data and limitations

- Research lives in local browser storage; the backend uses local SQLite. AI requests send questions and selected source text to your provider, including up to 24 previews for semantic selection.
- Source watches fetch public HTML without login credentials. Google search pages and generated answers are not eligible watches.
- The inspector displays domains rather than full addresses. Original URLs remain stored locally for reopening; exported source links strip query strings/fragments, which can affect some links.
- Keep keys in backend configuration. `.env`, databases and dependencies are excluded from Git. Never put secrets in browser code.
- PDFs, browser-internal pages, inaccessible frames and some dynamic/restricted sites are unsupported. Extraction may be incomplete or noisy.
- Restoration reopens URLs and supported reading positions, not arbitrary application/editor state.
- AI suggestions need human review. A page change is not automatically a contradiction. Reports cover bounded excerpts and may not include every page in long sessions.
- No account sync or automatic off-device backup. Uninstalling may remove local research; reports are not full workspace backups.
- Preview storage differs from installed-extension storage. See [STATUS.md](docs/STATUS.md) for actual verification results and manual acceptance gaps.

## Development checks

```powershell
# Locked install, type-check, build and extension tests
powershell -ExecutionPolicy Bypass -File scripts/build_extension.ps1

# Backend tests; requires pytest and pytest-asyncio
python -m pytest app/backend/test_backend.py -q --basetemp=tmp/backend-tests -o asyncio_default_fixture_loop_scope=function

# Optional static preview after building
powershell -ExecutionPolicy Bypass -File scripts/start_preview.ps1
```

Preview: **http://127.0.0.1:5173**. Capture, restoration and watches require the installed extension.

## Current state
The implementation is a local prototype. Automated checks do not replace live Chrome testing; [verification status](docs/STATUS.md) records what has actually been checked.

## Locations
- `app/extension/`: extension implementation destination.
- `app/backend/`: backend implementation destination.
- `app/extension/src/fixtures.ts`: synthetic example workspace; its pages are served by the backend.
- `docs/`: requirements, architecture, contracts, tasks, demo and handoff.
- `scripts/`: build and local launchers.

Contributors: read [AGENTS.md](AGENTS.md), [architecture](docs/ARCHITECTURE.md) and [current status](docs/STATUS.md). Antigravity users can use [the handoff](docs/ANTIGRAVITY_START.md).

Built with React, TypeScript, Vite, FastAPI, SQLite and [Mozilla Readability](https://github.com/mozilla/readability). Dependency licenses remain with their respective projects.
