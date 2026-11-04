# Paste this into Antigravity

Work in this project folder and implement ReEntry for PS-01. Read AGENTS.md, docs/PRD.md, docs/ARCHITECTURE.md, docs/DATA_CONTRACTS.md, docs/TASKS.md and docs/STATUS.md first. Use relevant workspace skills from .agent/skills.

The product direction is decided: a Chrome/Edge extension that captures research, restores a task checkpoint and traces new or changed evidence to affected claims and draft paragraphs. Do not restart ideation or make a standalone dashboard instead of the extension.

Begin T01 and T02 now. Inspect the environment, scaffold app/extension and app/backend using the documented defaults, create the side panel and local selected-passage capture, then verify persistence after extension reload. Install necessary project-local dependencies and run checks. Keep implementations simple and explain significant changes so I can understand them.

Continue through tasks in small verified milestones. Do not stop after producing a plan. Keep docs/STATUS.md accurate and give exact PowerShell run/build/load commands. Ask only for information genuinely required to proceed; continue independent local work if a provider credential is missing. Do not deploy or push. Never fake successful model checks. Preserve all existing PDF resources.

First completion checkpoint: show how to load the unpacked extension, save a passage into a workspace, reload it and find the same saved passage. Then proceed to task restoration and the evidence links.

## Opening the project
Open the entire Upside Down folder in Antigravity, not just app/. AGENTS.md and GEMINI.md provide entry instructions. The actual workspace skill files use `.agent/skills/<name>/SKILL.md`; root skills.md is only an index.

Official references checked 3 November 2026:
- https://antigravity.google/docs/skills
- https://antigravity.google/docs/rules
The documented default workspace skills location is .agents/skills, with .agent/skills supported for compatibility. This project uses .agent/skills because the existing .agents directory is read-only in this session. If your installed version does not discover the ReEntry skills, explicitly tell it to read the relevant SKILL.md path; do not assume a global installation.

The existing .agents directory could not be edited in this session. Use the explicitly named ReEntry skills in .agent/skills (a documented compatibility location), not the generic legacy skills. If discovery differs in the installed client, read these paths directly.
