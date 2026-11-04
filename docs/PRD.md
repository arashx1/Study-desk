# ReEntry product requirements

## Promise
Restore where research stopped and identify which linked conclusions and draft paragraphs need review as evidence changes.

## P0: working prototype
1. Create/select a workspace; save selected passages with URL, title, surrounding context, captured time and immutable source version.
2. Save chosen task tabs, supported scroll positions, notes, unresolved questions and a user-confirmed next step. Restore without closing unrelated tabs.
3. Link a passage to a claim and a paragraph in a supported draft editor. Open every evidence edge to inspect the actual passage.
4. Add a qualifying source or compare a saved/current source version. Flag affected claims and paragraphs with evidence and scope differences.
5. Let the user accept, reject or edit a suggestion; preserve old/new draft revisions and a timeline.
6. Export reviewed notes as Markdown with source links, dates, qualifications and unresolved issues.
7. Show clear empty, loading, failed, offline and unsupported-page states. Preserve local capture/resume without model credentials.

## P1: only after P0 works
- Generate a short cited resume brief using relevant saved passages.
- Suggest one collection gap, explicitly bounded by sources inspected.
- Display a small clickable evidence graph and source metadata cards with unknowns.

## Later research intelligence
- Gap detector: missing evidence in this collection, not proof of an unexplored field.
- Reliability intelligence: origin, method, limitations, dates and accessible correction notices; no unexplained trust percentage.
- Live contradiction detection: on capture/resume/refresh events; compare setting, population, dataset, version and measurement.
- Cross-source graph: passages, claims, draft paragraphs, questions and typed evidence relations.
- Context-aware browser: opted-in task context, never silent whole-history surveillance.
- Evolution tracker: source versions and user conclusion revisions; flag dependent writing.
- Prior-work scout: related work, evidenced overlap, possible differences and next searches. No match is not proof of novelty.

## Exclusions
No auth/billing/landing-page sprint, full LMS, universal editor restoration, arbitrary private-page scraping, automated report rewrites or full peer-to-peer sync. Attendance/course/quiz integrations are later and require authorised data; tab activity is not learning evidence.

## Acceptance story
Capture three passages, link a claim to a draft paragraph, checkpoint and close task tabs, restore context, introduce clearly labelled changed evidence, inspect both versions, review the impacted paragraph, approve a revision, export notes. Restart the extension and confirm saved state remains.

## Differentiation and validation
NotebookLM already covers synthesis, source discovery and mind maps. Proposed difference is integrated browser task restoration plus passage-to-claim-to-draft change impact. Do not claim world-first or universal superiority. Validate time to resume and whether alerts correctly identify affected writing.
