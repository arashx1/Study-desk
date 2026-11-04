import type {Claim, Passage} from './types';

/** Select an exact excerpt from the linked snapshot; relevance is not proof of support. */
export function evidenceExcerpt(claim: string, source: string): string {
  const words = new Set((claim.toLowerCase().match(/[a-z0-9]{4,}/g) || []).filter(w => !['that','with','from','this','have','which','their','there','about'].includes(w)));
  const sentences = source.replace(/\s+/g, ' ').trim().match(/[^.!?]+(?:[.!?]+|$)/g) || [];
  const scored = sentences.map((text, index) => ({text: text.trim(), index, score: [...words].filter(w => text.toLowerCase().includes(w)).length})).filter(x => x.text.length >= 30 && x.score > 0).sort((a,b) => b.score-a.score || a.index-b.index);
  return scored[0]?.text.slice(0, 600) || '';
}

export function evidenceCards(claims: Claim[], passages: Passage[]) {
  return claims.flatMap(claim => {
    const source = passages.find(p => p.id === claim.passageId && p.workspaceId === claim.workspaceId);
    return source ? [{claim, source, excerpt: evidenceExcerpt(claim.text, source.quote)}] : [];
  });
}
