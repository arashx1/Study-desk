# Architecture defaults

## Layout
`app/extension`: TypeScript, React, Vite, Manifest V3. Use a conventional unpacked build; document any manifest/content-script build handling. Keep a React side panel, context-menu capture, content script and service worker separate.
`app/backend`: Python FastAPI, SQLite, typed validation and a model adapter. Bind local development to 127.0.0.1. Provide /health and local setup/run instructions.
`app/fixtures`: local public demonstration pages and a plain-text draft editor with stable paragraph IDs. Label synthetic evidence clearly.

## Persistence and flow
Implemented ownership: extension IndexedDB owns workspaces, immutable passage snapshots, claims/draft paragraphs, findings, review events and checkpoints. Review decisions, draft revisions and timeline events commit together locally. SQLite stores idempotently ingested passages and analysis jobs when the user requests an AI check; it is an analysis cache, not a competing authority for drafts. No background ingestion queue or cross-device sync exists yet. See IMPLEMENTATION_NOTES.md for implementation boundaries.
Capture -> persist locally -> ingest idempotently -> retrieve within workspace -> propose evidence check -> validate citations -> user review -> append draft revision -> export.

## Browser details
Persist state outside service-worker globals. Restore page position after content readiness, with bounded retries and a visible unsupported/not-found outcome. Save quote plus prefix/suffix for passage anchors and scroll offset as fallback; do not promise exact restoration after page redesigns.
Start with activeTab, scripting, contextMenus, sidePanel and storage as needed. Request tabs/optional host permissions only when the implemented workflow requires them. Restrict backend host permission to local development origin; explain broader requests. Never capture password fields, private form input or unrelated tab content.

## AI and retrieval
Start with keyword/full-text retrieval for a small collection. Add embeddings only when needed. A model adapter accepts bounded passages and returns typed structured findings with exact passage IDs. Temperature or a confidence number does not establish correctness. Keep mock fixtures separate from live mode. With no credentials show AI unavailable, while capture/resume and manual evidence linking remain usable.
Backend manages long jobs and bounded timeouts/retries. Persist job states queued/running/completed/failed and handle interrupted jobs on restart. No multi-agent framework, hosted vector DB or orchestration dependency is required initially.

## Source refresh boundary
Prefer user-opened page recapture initially. Backend fetching, if added, must validate HTTP(S), reject private/loopback/link-local destinations and redirected targets, enforce byte/time limits and avoid arbitrary authenticated retrieval. Keep the model away from raw fetch authority.

## Dependency and configuration policy
Use a supported installed Node/Python version, verify package compatibility from official docs, pin dependencies and commit lockfiles when a repository exists. No package install or running server is implied by these documents. Keep model name and endpoint configurable. Never put model credentials in VITE_* variables or extension storage.
