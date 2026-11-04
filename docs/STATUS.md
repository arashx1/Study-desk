# Current implementation status

## Capture status and answer excerpts — source changes pending build

- Added per-session tracked-tab capture statuses for reading, saved and unavailable pages. Browser/PDF/restricted-page failures are not presented as successful captures.
- New RAG answers retain the exact retrieved excerpts associated with citation IDs; older answers without recorded excerpts still open their saved source snapshots. Simplified a note-entry label.
- These changes have **not** reached `app/extension/dist`. Automatic approval review interrupted the build because it observed an unrelated Visual Studio telemetry request with an unspecified payload. `scripts/test_capture_status.cjs` requires the new built background and currently fails against the old bundle; do not treat it as a source regression. Six source-domain and ten backend tests pass, as does the existing built watched-page mock. Native Chrome testing remains outstanding.

## Report and evidence interface

- Simplified the report into a summary action followed by download, showed source links for generated summaries, grouped additional tools under a disclosure, and displayed supporting excerpts beside linked notes. Export includes notes with their associated saved evidence, including older snapshots belonging to the same session.
- The built bundle contains the report/evidence changes, but the most recent accessibility focus change remains source-only. Final build output was interrupted by automatic approval review of unrelated Visual Studio telemetry. Ten backend tests and the mocked watched-source check passed; installed Chrome download and finish-to-report flow remain unverified.

## Groq, visited pages and extraction

- Captures supported pages in the active research session from their rendered DOM, including Google search and detected overviews; restricted pages, PDFs, failed loads and changing Google layouts can prevent extraction. Unavailable-overview messages are filtered for new captures. Older snapshots are not rewritten.
- Home lists the latest snapshot of each captured page. Finishing waits for queued capture work before stopping the session. The floating research assistant validates citations and can show retrieved passages when generation fails. Retrieval is lexical/chunk-based, not embeddings.
- A live synthetic question and summary both succeeded through the configured Groq provider with matching source IDs; no actual user research was used in those tests. Ten backend tests and mocked session/recovery/watch checks passed. Latest built bundle contains the Home and extraction changes, but final build process output was interrupted by automatic review of unrelated Visual Studio telemetry; full native Chrome capture/summary/report acceptance remains unverified.

## Resume and watched-source workflow

- Home shows the research question, counts, user-written stop point, next step and saved-page restoration. Saved selections are assigned to the active matching session.
- Sources can be connected to user-written notes. Opt-in public-page watching creates a baseline, then displays earlier/current wording and notes linked by URL; exact passage matching can remain inconclusive.
- Timeline includes captured searches/sources, newly linked notes, watched-source changes and review decisions. Session reports include detected changes during that session. A labelled synthetic change-demo fixture and instructions are in `RESUME_AND_CHANGE_DEMO.md`.
- Verified: an earlier Vite/TypeScript build includes the resume card, linked-note controls and watched-source UI; six frontend and ten backend tests, mocked tab enrollment/session recovery/watch baseline and update checks, plus browser-preview navigation and note linking passed. A later build containing timeline/report changes was interrupted by automatic review of an unrelated external Visual Studio telemetry request. Those timeline/report changes are source-only until a successful rebuild. Native Chrome extension end-to-end and report download remain unverified. A live Gemini probe returned HTTP 503, so AI explanations remain unverified.

Updated: 3 November 2026.

Implemented: Manifest V3 extension source and unpacked build, React side panel, IndexedDB workspaces/passages, context-menu capture, permissioned tab checkpoint/restore, manual source-to-claim-to-draft links, manual evidence findings, transactional approved revisions with original history, Markdown export, FastAPI/SQLite analysis service and optional model adapter.

Verified: TypeScript/production build and four frontend domain tests passed before disconnect. Four backend tests passed again after reconnect: idempotency/conflicts, workspace boundaries, unavailable AI, citation validation, job recovery and input bounds. Browser preview verified example sources, linked draft, manual finding, approved revision, original/revised timeline, persistence after reload, missing-key error and 360px layout without horizontal overflow.

Not verified: native unpacked-extension right-click capture, optional permission prompts, tab/position restoration and service-worker restart. Automated Edge launch failed in the Windows sandbox. Browser export download verification was interrupted by disconnection; export generation has domain coverage but the actual downloaded file remains unconfirmed. No real model provider/key has been configured or tested.

Next: load app/extension/dist in Chrome/Edge using app/README.md and verify capture/restoration. Then configure an optional provider and validate a real evidence comparison. Broad automatic gap detection, prior-work search, full-page monitoring and visual graph canvas remain roadmap features.

Run commands: scripts/build_extension.ps1; scripts/start_backend.ps1; scripts/start_preview.ps1. See app/README.md for exact PowerShell commands and limitations. Local preview storage is separate from extension storage. No deployment was performed.

Reconnect verification: fresh TypeScript/production build succeeded; all four frontend domain checks and all four backend checks passed. Compiled output copied to app/extension/dist. Development servers restarted after disconnect.


## Research feature expansion
Added Research tab: automatic keyword coverage gaps bounded to saved sources; source evidence cards with unknown author/review/correction status; clickable source-claim-draft map; opt-in automatic AI comparisons while the workspace is open; Crossref scholarly metadata search; permissioned five-minute public HTML text monitoring with bounded old/new snapshots and stop controls.
Limits: coverage keywords are search leads, not established literature gaps. Source metadata is not independently verified. Prior-work search does not cover every product/repository or establish originality. Monitoring excludes authenticated fetches/redirects and pages over 200 KB; it runs only with browser active and permissions granted. Dynamic/noisy pages may produce irrelevant change alerts. Live AI needs a provider key. These new browser interactions still need native extension verification.


## Session reporting and published verification
Added start/finish session controls, self-reported learning reflection, new-source selection and a downloadable standalone HTML context report with source-claim-draft diagram, exact passages, timestamps and next steps. The user can print the report to PDF. This is not a server-generated PDF and does not measure mastery. New sessions replace the active session record; download finished reports before starting another.
Added /api/fact-check for Google published ClaimReview search, requiring GOOGLE_FACTCHECK_API_KEY. It returns publisher ratings/links/dates, not independent web-wide fact verification. Live API verification remains untested without credentials. Google result-page reconstruction is not implemented; only explicitly saved passages and monitoring snapshots preserve observed text. Reports do not claim to know what Google said on unsaved pages.


## Automatic session flow
Added top-level Start/Pause/Resume/Include/Exclude/Finish capture controls. Permissioned session capture includes the starting tab and descendant tabs with opener IDs, stores bounded readable HTML text snapshots, periodically recaptures at one-minute requested intervals and updates tab-position checkpoints. Google snapshots are labelled displayed content, not source truth. Starting/finishing connects to local context report dates; earlier report records are archived locally. Does not infer mastery or automatically produce a model-written synthesis. Dynamic render coverage is best-effort; PDFs, hidden/private controls and browser-internal pages are excluded. Full native capture and report-download integration still need Chrome verification.


## Capture startup and interface fix
Guarded optional alarms API at worker startup so a stale permission manifest does not prevent message-listener registration. Session messaging now gives actionable reload instructions. Navigation changes trigger capture attempts; DOM snapshots include headings and displayed source links. Compact session toolbar, reduced vertical whitespace, sticky navigation and readable evidence rows implemented. Version bumped to 0.2.0. Native Chrome worker/permission and dynamic-render capture still require end-to-end testing; the screenshot identifies a missing message receiver but does not establish its unique cause.

Session enrollment updated: every newly created tab in the session window joins, including +/Ctrl+T tabs without an opener. Existing tabs and other windows are not enrolled automatically. Blank new-tab pages wait until an HTTP(S) navigation before capture. Native Chrome verification pending.


## Saved research Q&A (RAG)
Added Ask navigation view with persistent workspace-specific answer history, date cutoff, local keyword retrieval of up to six bounded relevant excerpt windows, and backend Gemini generation with allowed-passage citation validation. Saved IndexedDB material remains available across days/restarts provided browser extension data is retained. No extra embedding/search API is required. This is keyword RAG, not semantic embeddings. It answers from captured evidence, not unsaved browsing or proven learning. Live provider availability and native extension interaction still need verification. Restart backend to load /api/ask and reload extension after build.


## UI simplification
Replaced large session panel with compact session strip, Start/Pause/Finish actions and expandable included-tab management. Added Open active workspace action when capture belongs elsewhere. Collapsed checkpoint/next-step form by default so sources/questions appear earlier. Refined typography, evidence rows, spacing, narrow layouts and Ask form. No stored research data changed. Rendered Chrome verification remains pending.

UI 0.3: distinct navy header, blue controls, filled selected navigation, focused Ask layout and visible WORKSPACE 0.3 build marker. User screenshot confirmed prior compact-layout changes had loaded but were insufficient visually; new direction replaces that appearance. Native visual check pending.

## Haven-inspired interface redesign — November 2026
- Replaced navy/blue overrides with warm cream, brown actions, larger controls and simpler typography.
- Home holds capture and checkpoint controls. Sources and Ask are direct navigation; More tools retains claims, review, timeline and research reports.
- Fixed duplicate sibling React keys for session, Ask and Research components; this addresses reconciliation defects behind repeated/mismatched panels.
- Verified production build and four frontend tests with scripts/build_extension.ps1.
- Browser preview: Home, Ask and Sources show matching content; one session component; no document overflow at 360px. Haven reference inspected visually. Native extension reload and capture remain separate acceptance checks.

## Automatic membership and stale-session recovery
- Start includes all ordinary non-incognito webpages in the current window. New and navigated tabs enroll automatically; exclusions persist.
- Panel opening reconciles membership and recovers stale window IDs after browser restart. Closed tabs are removed, membership mutations serialized, periodic alarm recreated.
- Verified build, four frontend tests, test_session_recovery.cjs and test_tab_enrollment.cjs all pass. Mocked Chrome tests cover stale IDs, existing tabs, exclusions, window boundaries, internal/incognito filtering, closed tabs and paused enrollment. Native Chrome capture after reload still needs user verification.

## Workflow hierarchy correction
- Moved sticky primary navigation above session controls and all content. Capture controls remain available across views.
- Bounded the optional tab list to 180px; removed redundant Include action when current tab is already included.
- Home gives direct Ask/View saved sources actions. Saved checkpoint wording distinguishes earlier visited pages from currently captured tabs.
- Finish now navigates directly to reports.
- Verified browser preview Home and Ask navigation visually; production build and four tests pass. Native Finish/report transition needs installed-extension verification.

## Gemini provider correction
- Live Google model listing accepted configured key; native generation for gemini-2.5-flash returned 404 and directed new users to gemini-3.8-flash.
- Updated backend local model to provider-recommended replacement and routed Google requests through native generateContent with JSON response MIME type. Other OpenAI-compatible providers retain their adapter.
- Replacement live request returned HTTP 503 high demand; successful live synthesis is NOT verified. Added clear busy/retry message. Backend must restart to load code and configuration.

## Session boundaries, search recapture and readable reports — Nov 4
- Supersedes previous all-existing-tabs enrollment: capture starts with current tab; new tabs, visited tabs and same-window navigations join. Unvisited preexisting tabs are not bulk-imported.
- Added tab activation capture, navigation-complete delayed recaptures, and debounced DOM-change observer on enrolled pages for async search answers. Snapshot save rejects URL changes during extraction. Native Google/SPA behavior still requires installed-extension acceptance testing.
- New passages carry sessionId; same content can belong to distinct sessions. Reports filter by session ID; legacy reports use bounded timestamp/baseline fallback. Earlier session history selectable.
- Reports use topic titles, short excerpts, compact labelled source links, reflection and optional AI synthesis. Removed raw long URL/version/text dumps and duplicate report-only session starter.
- Ask adds session selection, generic recall retrieval, and displays actual retrieved excerpts when provider synthesis fails. No synthetic answer fallback.
- Live tests of gemini-3.8-flash and gemini-3.1-flash-lite both returned 503; no successful live synthesis claimed.
- Final safe build installed dependencies with lifecycle scripts/audit disabled, then ran local tsc/Vite and four frontend tests successfully. Eight backend tests plus two mocked Chrome session scripts passed. An unrelated telemetry request from an earlier build was rejected by automatic review; not retried.

## Fresh-start reset
- User requested all research data cleared. Backend captures/jobs cleared transactionally; provider configuration retained.
- Added footer Reset all data with explicit permanent-deletion confirmation. Stops capture/alarms, clears extension storage, all six IndexedDB stores and ReEntry local session/answer caches, then reloads. Downloaded files are outside reset scope. Browser reset requires the user to click the control after extension reload.

## Selected-workspace capture switch
- Source adds Start session here: finishes previous capture, marks previous session ended, starts fresh capture in selected workspace. Existing sources stay in original workspace.
- Build verification blocked by automatic approval review of unrelated Visual Studio telemetry. Do not claim native acceptance or successful updated bundle verification until checked.

## Structured research pipeline and task-specific APIs
- Added self-contained injected extraction: paragraph-preserving article text; Google query, detected overview and result title/URL/snippet fields. Removes common UI/error text and duplicates instead of flattening all textContent. Google DOM variation remains a native acceptance risk; old snapshots stay immutable.
- RAG now chunks paragraphs, ranks distinctive query terms, deduplicates canonical source/search URLs and selects bounded source excerpts. Still lexical retrieval, not embeddings.
- ANSWER/SUMMARY/CHECK task-provider routing supports independently configured credentials/endpoints/models. Custom endpoint requires its own key. Summaries explicitly select summary task.
- Added Brave web-evidence adapter and UI with explicit query action, missing-key handling and snippet-only/no-verdict labels. No key supplied; not live verified. Crossref unchanged.
- Actual live evidence-answer test returned HTTP 503; generated answers still not verified. See API_SETUP.md.

Verification boundary: first structured-capture/chunk-retrieval build completed with five frontend tests; final build after WebEvidence UI addition was interrupted by automatic review of unrelated Visual Studio telemetry. Built panel does not yet contain Search web evidence; that UI is source-only pending rebuild. Ten backend tests and two mocked session scripts pass. No telemetry retry attempted.

## Duolingo-inspired UI Simplification and Floating Session Widget — Nov 4
- Redesigned the extension interface with a clean, friendly, uncrowded Duolingo aesthetic:
  - Signature Duolingo color palette: cheerful feather green (`#58cc02`), dark green 3D border (`#46a302`), playful blue (`#1cb0f6`), warm gold (`#ffc800`), coral red (`#ff4b4b`), and clean white cards (`#ffffff`) with 2px borders (`#e5e5e5`) and 4px 3D bottom borders.
  - Distinctive Duolingo 3D button interactions: tactile 4px bottom border press effects and rounded corners (`border-radius: 16px`).
  - Clean Duolingo stat chips at the top of the workspace: Sources, Notes, and Saved Tabs.
  - Uncrowded Home view: replaced cluttered walls of helper text and multiple stacked form fields with a clean Hero Resume card, single-line next-step input, and collapsible research notes.
- Moved the session recording strip from the top of the workspace into a compact Floating Action Widget at the bottom-right:
  - When browsing/recording: a sleek floating circular button at the bottom-right with an active pulse indicator and tab count badge (`🟢 1`).
  - Tapping the bottom-right icon opens a neat floating popover card with Pause, Resume, Finish, and collapsible tab exclusion controls.
  - The top of the page remains completely clean and spacious without pushing content down.
- Verified with `scripts/build_extension.ps1` and unit tests in `app/extension/tests/domain.test.ts` (all 6 tests passing). Dist package updated in `app/extension/dist`.

## Groq API Provider Configuration — Nov 4
- Replaced the Gemini model provider with the user-provided Groq API configuration in `app/backend/.env`:
  - `MODEL_BASE_URL=https://api.groq.com/openai/v1`
  - `MODEL_NAME=openai/gpt-oss-120b`
  - `MODEL_API_KEY` configured with the supplied Groq credential.
- Tested and verified live Groq connectivity and OpenAI-compatible JSON mode synthesis (`/api/ask` and evidence citation matching) with sub-second response time.
- Updated `app/backend/main.py` error handlers to dynamically identify the active provider instead of hardcoded Gemini references.

2026-11-03: Improved page extraction in source: rank prose-rich article containers, remove additional page chrome, and keep Google Overview separate from search results. Extension domain tests: 6 passed (npm run test). Build blocked: TypeScript executable unavailable (npm run build); Readability integration and live Chrome extraction remain unverified.

2026-11-04: Integrated Mozilla Readability into session capture with existing fallback and Google-specific extraction. Vite production bundle built; 6 domain tests passed. Type checking blocked by missing lucide-react declarations from incomplete dependencies. npm installation encountered automatic review rejection involving an unrelated telemetry connection; package lock is not updated. Live Chrome capture is not yet verified.

2026-11-04: Simplified exported session report source cards, removed common Google UI labels from previews, and omitted empty optional sections. Vite build passed; live Chrome report download and print layout not verified.

2026-11-04: Reports show workspace-linked claims with relevance-selected exact excerpts, distinguish Google answers, and offer captured search results as unverified source leads. Eight extension tests passed; Vite build passed. Automatic contradiction comparison and live Chrome report verification remain outstanding.

## Evidence navigation and source-address privacy — Nov 4
- Replaced the top tab row and “More tools” dropdown with a left-side workspace panel for Home, Sources, Ask, Evidence, Research and Timeline. At narrow widths the panel becomes an icon rail with accessible labels.
- Combined evidence-to-draft links and claim review into the single Evidence view; both linked claims and review controls are visible together.
- The saved-evidence inspector and source/change lists show only the source domain. Markdown and downloaded session-report source links omit query strings and fragments; original URLs remain stored for opening the source directly.
- Verified `npm --prefix app/extension test`: 10 tests passed. Verified `npm exec -- vite build` from `app/extension`: production bundle passed. Browser preview verified both Evidence sections at 375px with no horizontal overflow.
- `npm --prefix app/extension run build` remains blocked by the installed `lucide-react` package missing its declared `dist/lucide-react.d.ts` file (existing dependency/type-check issue; TypeScript reports TS7016). Native Chrome/Edge extension verification remains outstanding.
- Follow-up: moved the “Web Scraping & Session” controls inside the Home view. Rebuilt with Vite; preview confirmed controls visible on Home, hidden on Sources, and restored on returning Home. All 10 extension tests still pass.
- Follow-up: clarified the manual source form with plain-language labels, examples, a right-click capture shortcut, on-device URL storage notice, and Save/Cancel actions. Verified at 375px with no horizontal overflow; production Vite build and all 10 extension tests passed.
- Follow-up: Ask Research session choices now use chronological names (“Session 1”, “Session 2”, …), newest first, with date and source count as secondary details; query/topic text is no longer mixed into the labels. Added a unit test for stable chronological numbering. All 11 extension tests and the Vite production build passed; browser preview confirmed the labels and temporary test entries were removed afterward.
- Follow-up: clarified the purpose of the Evidence form (connect a statement, its source, and dependent draft writing without asserting truth), renamed its first field to “What do you want to verify?”, and added brief plain-language guidance for scope, source passage and paragraph. Field labels are explicit and their help is associated accessibly. Production build and all 11 extension tests passed; browser preview confirmed each helper is shown.
- Follow-up: renamed the browser extension and its user-facing controls to “Scholar's Desk”; changed the app mark to a table lamp and added matching 16/32/48/128 px PNG extension icons. Updated the right-click capture menu, app title and setup guide; retained internal storage identifiers to preserve existing user data. Production Vite build and all 11 extension tests passed. Native Chrome/Edge install check remains outstanding.
- Follow-up: replaced outdated report guidance pointing to “Claims under More tools” with a direction to Evidence, and updated the report's empty-state prompt plus the remaining stylesheet design note. Rebuilt with Vite and reran extension tests: build passed and all 11 tests passed. Remaining `ReEntry` identifiers are internal Readability bridge names; they were retained to avoid unnecessary compatibility changes. Native Chrome/Edge install check remains outstanding.
- Follow-up: added input checks so Evidence links require specific topic words and a source that overlaps the statement; AI comparisons reject unclear or unrelated existing claims. Ask Research now stops unclear questions and requires retrieved excerpts to share topic terms before calling the provider. Saved Google AI Overview passages are labeled as generated answers, not fact-checks. Verified browser preview rejects the example gibberish claim/draft and an unrelated claim; backend tests reject gibberish and unrelated questions/claims. `npm --prefix app/extension test`: 12 passed; backend `python -m pytest test_backend.py`: 11 passed; Vite production build passed. These keyword checks are relevance filters, not proof that evidence supports a claim. Native Chrome/Edge installation remains unverified.
- Follow-up: fixed circular claim checking. Google AI Overviews, search results and synthetic passages can no longer be linked as claim evidence or used for AI/manual comparisons. A comparison now requires two directly saved live pages from different hostnames; the backend independently validates provenance and host separation. Evidence review displays both actual passage excerpts and explains when an existing AI-generated claim must be recreated using a directly opened cited page. Browser preview confirmed an existing generated-source claim shows the explanation and disables comparison. Extension tests: 13 passed; backend tests: 12 passed; Vite build passed. A different hostname is only a guard against comparing the same site, not proof of editorial independence or accuracy.
- Verification follow-up: restarted the local backend and confirmed its live `/api/checks` endpoint rejects a Google AI Overview source with `generated_source_not_independent`; `/health` is responsive and reports AI configured. At 375px preview width, document width remained within viewport. `npm --prefix app/extension run build` still stops at the known missing `lucide-react` declaration (TS7016); standalone Vite production build succeeds. The loaded Chrome/Edge extension still needs reload and native end-to-end verification.
- Follow-up: simplified comparison to “Compare WebScraper with another source.” Users choose an existing statement and see its captured WebScraper/page passage beside a direct passage from another hostname. A WebScraper answer is treated as the captured result, not independent proof; the backend AI instructions now state this explicitly. Live source passages can be linked even when generated/search-derived, while fixtures are excluded. Verified the side-by-side flow in browser preview at 375px (no horizontal overflow, compare enables only after selecting a different-site source). Extension tests: 13 passed; backend tests: 12 passed; Vite production build passed. Full TypeScript build remains blocked by the known missing `lucide-react` declarations (TS7016); Chrome extension reload/native workflow still needs verification.
- Follow-up: replaced the requirement to select an existing claim with a simpler flow: select a saved first source, type “What do you want to compare?”, then select an independently saved page. A new claim/finding is persisted only after a successful comparison (or completed manual review), preserving the existing approval/revision workflow. Short relevant inputs such as “What is HTML?” now pass extension and backend relevance checks; retrieval accepts a one-word match, while unrelated text still has no matching evidence and is rejected. Updated all Ask interfaces to explain that a topic word is needed. Verified 13 extension tests, 12 backend tests and the Vite production build; browser preview at 375px showed the new compare heading/helper with no horizontal overflow. A valid short request reaches the expected AI-unavailable response when no provider is configured; no result is fabricated. `npm run build` remains blocked only by existing TS7016 missing `lucide-react` declarations. Native Chrome/Edge extension workflow is still unverified.
- Backend troubleshooting follow-up: confirmed port 8765 was already served by Uvicorn and `/health` returned HTTP 200; a real two-site `/api/checks` comparison also returned HTTP 200 with validated cited passages. Updated `scripts/start_backend.ps1` to report an already-healthy server rather than start a duplicate, and to identify an occupied-but-unhealthy port. Evidence now explicitly explains that labelled synthetic demo passages are not sent as real evidence. Verified the start script against the running server, 13 extension tests, Vite build, and the notice in browser preview. Use real saved passages from two different websites to compare; the demo workspace is intentionally ineligible.
- Follow-up to Bastille claim-link issue: clarified the claim form's relevance error and now previews the actual selected saved passage while explaining that scope notes or AI summaries are not supporting evidence. The relevance filter remains in place so unrelated passages aren't silently linked. Verified 13 extension tests and Vite production build; tested backend comparison separately with real-site passages and received HTTP 200. Native extension interaction remains unverified.
- Bastille follow-up: the example wording “Did the Battle of Bastille really take place on 14 July 1789?” correctly matches a saved excerpt containing “Storming of the Bastille” in a unit test. Updated the claim form so each source choice includes an excerpt preview and the selected passage appears immediately before the draft field, making it clear when a report summary is not the selected source's saved text. Verified all 13 extension tests and a fresh Vite build. Reload the unpacked extension in `chrome://extensions` to get the updated selector and preview; the actual passage saved in the user's browser still needs visual confirmation.
- Comparison workflow clarification: screenshots show the selected Britannica excerpt is about broad causes, the comparison text is “The dates of the battle,” and the second-source card has no saved passage. The comparison action therefore has no relevant source pair to send. Added explicit relevance/second-source prerequisite messages, clarified that the AI only compares selected saved passages and never finds resources, and added a user-clicked Google search link as a no-API-key source-discovery fallback. The link clearly says the query is sent to Google and that results are leads, not proof; a user must open a result and save its passage. Brave web-search API remains unavailable until its backend key is configured. Verified 13 extension tests, Vite production build, and backend `/health` HTTP 200. Native Chrome reload/workflow remains for user verification.

## 2026-11-04 — Research workflow hardening
- Clean temporary dependency installation, TypeScript checking and production build passed using scripts/build_extension.ps1. OneDrive's existing node_modules cannot be reliably replaced in place. Offline installation requires a populated npm cache.
- Added AI semantic source selection alongside local keyword retrieval, bounded to 24 candidates / 800 characters each. Only filtered workspace/session sources are eligible; IDs are validated and failures fall back locally. This is model-based selection, not an embedding index.
- Finish requests automatic summary and report download when the report view loads; Create and download report retries failed generation. Existing saved-report download remains available.
- Added backend connection status and actionable connection failures; labelled source types and scoped answer history to the selected session.
- Backend tests: 13 passed, including semantic source-ID and workspace validation. Browser end-to-end and live provider validation remain pending.
- Git publication blocked: this environment cannot create .git/index.lock. No commit or push performed.

## First-time user review — 2026-11-04
Fixed the backend startup probe failing when localhost is offline; launcher now prefers the project virtual environment. Evidence starts with source comparison, with optional writing links collapsed. Home offers a last-source and next-question handoff based on saved content, not an inferred claim about what the user learned.
Remaining onboarding limitations: installation is manual (build + Load unpacked); AI requires Python dependencies, provider configuration and a running backend; PDF/restricted pages may not capture; preview storage differs from extension storage. Semantic retrieval sends bounded previews to the configured provider. Browser-extension interaction still needs live verification.
