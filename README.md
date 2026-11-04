# ReEntry

Resume your research and see which conclusions need review when evidence changes.

ReEntry is a proposed Chrome/Edge research extension for **PS-01: Beyond the App**. Its core connects saved source passages to claims and draft paragraphs, preserving task context across interruptions.

## Start in Antigravity
Open this entire folder, then paste the prompt in `docs/ANTIGRAVITY_START.md`. Read `AGENTS.md` first. Project skills are in `.agent/skills/`; `skills.md` is their index.

## Current state
The first implementation is built: local workspaces, passages, supported draft links, manual evidence review, approved revisions, timeline and Markdown export. The FastAPI/SQLite backend supports optional AI comparisons. Live AI needs your provider key. Actual unpacked-extension capture/restore checks remain pending; preview checks do not prove browser API behavior. See docs/STATUS.md and app/README.md.

## Locations
- `app/extension/`: extension implementation destination.
- `app/backend/`: backend implementation destination.
- `app/extension/src/fixtures.ts`: synthetic example workspace; its pages are served by the backend.
- `docs/`: requirements, architecture, contracts, tasks, demo and handoff.
- `output/pdf/ReEntry_Final_Concept_and_Hackathon_Plan.pdf`: final explanatory PDF.

Capture, resume and evidence-impact review are mandatory. Gap detection, source intelligence, prior-work search and broad monitoring are staged additions. See `docs/PRD.md`.
