"""Check setup consistency; this is not an application test suite."""
from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]
required=['AGENTS.md','GEMINI.md','README.md','skills.md','docs/PRD.md','docs/ARCHITECTURE.md','docs/DATA_CONTRACTS.md','docs/TASKS.md','docs/STATUS.md','docs/ANTIGRAVITY_START.md','docs/DEMO.md']
errors=[]
for rel in required:
 if not (root/rel).is_file(): errors.append('Missing '+rel)
skills=list((root/'.agent/skills').glob('*/SKILL.md'))
for path in skills:
 text=path.read_text(encoding='utf-8')
 match=re.match(r'^---\nname: ([a-z0-9-]+)\ndescription: (.+)\n---\n',text)
 if not match or match[1]!=path.parent.name: errors.append('Invalid skill metadata '+str(path))
for rel in ['.vscode/tasks.json','.vscode/mcp.json']:
 try: json.loads((root/rel).read_text(encoding='utf-8'))
 except Exception as exc: errors.append(f'{rel}: {exc}')
for rel in required:
 if (root/rel).exists() and re.search(r'problem statement (TBD|not yet announced)',(root/rel).read_text(encoding='utf-8'),re.I): errors.append('Stale scope '+rel)
if errors:
 print('\n'.join(errors));raise SystemExit(1)
print(f'Setup ready: {len(required)} required documents, {len(skills)} skill manifests, valid editor task/MCP JSON.')
print('Read docs/STATUS.md for current implementation and verification status.')
