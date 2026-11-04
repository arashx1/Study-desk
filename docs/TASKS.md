# Build tasks

Status: first implementation built. Check STATUS.md for verified behavior and pending native extension checks. Unchecked items may have implemented code awaiting acceptance verification.

- [x] T01 Inspect installed runtime versions; scaffold app/extension and app/backend, lock dependencies, create placeholder-only environment template and exact run commands.
- [ ] T02 Load unpacked extension; open side panel; save one workspace and selected passage to IndexedDB. Reload extension and prove persistence.
- [ ] T03 Capture chosen tabs and supported positions plus confirmed next step. Restore tabs without closing unrelated work; handle unsupported pages.
- [x] T04 Add supported plain-text draft with stable paragraph IDs, manual claim creation and passage-to-claim-to-paragraph links.
- [ ] T05 Add backend /health, SQLite storage and idempotent ingestion. Demonstrate capture still works when backend is unavailable.
- [ ] T06 Implement one structured evidence comparison with validated citations and scope differences; clearly distinguish live model from fixture mode.
- [ ] T07 Surface affected paragraphs and old/new source versions; accept/reject/edit findings with durable review history and stale-revision protection.
- [ ] T08 Export reviewed Markdown with evidence links and unresolved questions.
- [ ] T09 If time remains, add cited resume summary, small graph and one collection-gap suggestion.
- [ ] T10 Verify demo, error states and restart behavior; document limitations and AI usage; record backup demo.

Reference budget: 0-3h capture foundation; 3-6h restoration; 6-9h evidence links; 9-12h comparison/impact; 12-15h review/export/checks. Recalculate using actual time remaining before freeze.

Cut P1 and cosmetic animation first. Do not replace missing core logic with unlabeled fabricated results. Submission needs an unpacked-extension build and local backend instructions; a hosted homepage alone is not completion.

## Bug Log
- 2026-11-04: Windows port-in-use error: the backend was already healthy on port 8765 and the second start attempt failed to bind; startup now detects a healthy instance, and the Evidence view explains that synthetic demo passages cannot be compared as real sources.
- 2026-11-04: Claim-link relevance appeared to reject a matching Bastille question because the saved quote was hidden below the form; source options now show excerpt snippets and the selected passage preview.
- 2026-11-04: Comparison seemed unresponsive because the selected excerpt did not match the typed comparison topic and the second source was not saved; show both blockers and provide a user-triggered web-search lead.
