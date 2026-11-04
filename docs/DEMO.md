# Seven-minute demonstration

0:00-0:45 Show the current problem: a research claim in a draft without remembered context.
0:45-2:00 Save three passages, create a claim and link it to a paragraph. Open the evidence trail.
2:00-3:00 Save next step, close selected task tabs and restore them with supported positions.
3:00-4:30 Add qualifying evidence or refresh a clearly labelled controlled demo source. Compare conditions and both passages. Highlight the affected paragraph.
4:30-5:30 Accept/edit a suggestion and show the preserved original and review timeline.
5:30-6:15 Export cited notes; show persistence and local reading when backend is unavailable.
6:15-7:00 Explain PS-01 fit, limits and the proposed difference from NotebookLM.

## Required checks
- Workspace A must not retrieve workspace B passages.
- Worker restart must not erase a checkpoint.
- Citation links must resolve to actual saved passages and versions.
- Different test settings must not automatically become a contradiction.
- Missing API key/backend/network must show an honest unavailable state.
- Repeated ingest/review must not duplicate a capture or revision.
- Unsupported editor/page must be labelled; user-controlled restore must preserve unrelated tabs.

Record actual pass/fail results in STATUS.md. Include browser version and load/build instructions. Native extension functions need a real unpacked-extension check. Fixtures illustrate behavior; they are not live discoveries or measured user benefits.
