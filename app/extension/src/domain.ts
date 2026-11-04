import type { Passage, Workspace, Claim, Finding } from './types';
export function isWebUrl(url: string) { try { return ['http:','https:'].includes(new URL(url).protocol); } catch { return false; } }
export function sourceLabel(url: string) { try { return new URL(url).hostname; } catch { return 'Saved source'; } }
export function sourceLinkUrl(url: string) { try { const safe = new URL(url); safe.search = ''; safe.hash = ''; return safe.href; } catch { return ''; } }
export function numberSessions<T>(sessions: T[], getStartedAt: (session: T) => string) {
  return sessions.slice().sort((a, b) => getStartedAt(a).localeCompare(getStartedAt(b)))
    .map((session, index) => ({ ...session, label: `Session ${index + 1}` })).reverse();
}
export function captureKey(workspaceId: string, url: string, quote: string) { return JSON.stringify([workspaceId,url,quote.trim()]); }
export function isDirectEvidence(passage: Passage) {
  if (passage.origin !== 'live' || passage.captureKind === 'search' || passage.captureKind === 'ai-overview') return false;
  if (/^(google ai overview|google search)/i.test(passage.title)) return false;
  try { return !/(^|\.)google\.[a-z.]+$/i.test(new URL(passage.url).hostname); } catch { return false; }
}
export function isSavedWebSource(passage: Passage) {
  if (passage.origin !== 'live') return false;
  try { return ['http:', 'https:'].includes(new URL(passage.url).protocol); } catch { return false; }
}
export function isWebScrapedResult(passage: Passage) {
  if (!isSavedWebSource(passage)) return false;
  if (passage.captureKind === 'search' || passage.captureKind === 'ai-overview' || !!passage.displayedAnswer) return true;
  if (/^(google ai overview|google search)/i.test(passage.title)) return true;
  try { return /(^|\.)google\.[a-z.]+$/i.test(new URL(passage.url).hostname); } catch { return false; }
}
export function hasIndependentSource(original: Passage, candidate: Passage) {
  if (!isSavedWebSource(original) || !isDirectEvidence(candidate)) return false;
  const host = (url: string) => new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  return host(original.url) !== host(candidate.url);
}
export function validateFinding(claim: Claim, passages: Passage[], finding: Pick<Finding,'passageIds'>) {
  if (new Set(finding.passageIds).size < 2 || !finding.passageIds.includes(claim.passageId)) throw new Error('A comparison must cite the original and another evidence passage.');
  const allowed = new Set(passages.filter(p => p.workspaceId === claim.workspaceId).map(p => p.id));
  if (finding.passageIds.some(id => !allowed.has(id))) throw new Error('The result cites unavailable or unrelated evidence.');
}
export function markdown(w: Workspace, passages: Passage[], claims: Claim[], findings: Finding[]) {
  const lines = [`# ${w.name}`, w.question, `## Next step\n${w.nextStep || 'Not recorded'}`, `## Notes\n${w.notes}`, `## Open questions\n${w.questions}`];
  for (const c of claims.filter(c=>c.workspaceId===w.id)) { const p = passages.find(p=>p.id===c.passageId && p.workspaceId===w.id); lines.push(`## ${c.text}\n${c.paragraph}\n\nScope: ${c.scope || 'Not specified'}\nDraft revision: ${c.revision}\n${p ? `Evidence: [${p.title.replace(/[\[\]]/g,'')}](${sourceLinkUrl(p.url).replace(/[()]/g,encodeURIComponent)})\nSaved ${p.capturedAt}; version ${p.version}\n> ${p.quote.replace(/\n/g,'\n> ')}` : 'Evidence unavailable'}`); }
  lines.push('## Review findings');
  for (const f of findings.filter(f=>f.workspaceId===w.id)) lines.push(`- ${f.status} / ${f.decision} / ${f.mode}: ${f.rationale}\n  Evidence: ${f.passageIds.map(id=>{const p=passages.find(p=>p.id===id && p.workspaceId===w.id);return p?`${p.title}: ${sourceLinkUrl(p.url)} (version ${p.version})`:'unavailable';}).join('; ')}`);
  return lines.join('\n\n');
}
