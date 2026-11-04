import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isWebUrl, captureKey, validateFinding, markdown, sourceLabel, sourceLinkUrl, numberSessions, isDirectEvidence, isSavedWebSource, isWebScrapedResult, hasIndependentSource } from '../src/domain.ts';
import type { Claim, Passage, Workspace } from '../src/types.ts';
test('browser URLs reject executable and privileged schemes',()=>{assert.equal(isWebUrl('javascript:alert(1)'),false);assert.equal(isWebUrl('chrome://settings'),false);assert.equal(isWebUrl('https://example.com'),true);});
test('duplicate keys respect workspace boundaries',()=>{assert.equal(captureKey('a','https://a',' text '),captureKey('a','https://a','text'));assert.notEqual(captureKey('a','https://a','text'),captureKey('b','https://a','text'));});
test('citations cannot cross workspace boundaries',()=>{const c={workspaceId:'a'} as Claim;const p=[{id:'p',workspaceId:'b'}] as Passage[];assert.throws(()=>validateFinding(c,p,{passageIds:['p']}));assert.throws(()=>validateFinding(c,[],{passageIds:[]}));});
test('Markdown excludes claims from other workspaces',()=>{const w={id:'a',name:'Research',question:'Q',nextStep:'Read methods',notes:'',questions:''} as Workspace;const text=markdown(w,[],[{id:'c',workspaceId:'b',text:'secret'} as Claim],[]);assert.ok(!text.includes('secret'));assert.ok(text.includes('Read methods'));});
test('source labels and exported links do not expose query strings or fragments',()=>{const url='https://www.google.com/search?q=private+research&tracking=secret#result';assert.equal(sourceLabel(url),'www.google.com');assert.equal(sourceLinkUrl(url),'https://www.google.com/search');assert.equal(sourceLabel('not-a-url'),'Saved source');});
test('comparison pairs WebScraper results with a direct page from another site',()=>{
 const direct={id:'a',workspaceId:'w',title:'Quantum mechanics',url:'https://www.energy.gov/quantum',quote:'Quantum systems...',prefix:'',suffix:'',capturedAt:'',version:'v1',origin:'live'} as Passage;
 const overview={...direct,id:'g',title:'Google AI Overview: quantum',url:'https://www.google.com/search?q=quantum',captureKind:'ai-overview' as const};
 const search={...direct,id:'s',title:'Google Search: quantum',url:'https://www.google.com/search?q=quantum',captureKind:'search' as const};
 const sameSite={...direct,id:'b',url:'https://www.energy.gov/science/quantum'};
 const otherSite={...direct,id:'c',url:'https://www.nist.gov/quantum'};
 assert.equal(isDirectEvidence(overview),false);
 assert.equal(isDirectEvidence(search),false);
 assert.equal(isSavedWebSource(overview),true);
 assert.equal(isWebScrapedResult(overview),true);
 assert.equal(hasIndependentSource(overview,otherSite),true);
 assert.equal(hasIndependentSource(search,otherSite),true);
 assert.equal(hasIndependentSource({...direct,origin:'fixture'},otherSite),false);
 assert.equal(hasIndependentSource(direct,sameSite),false);
 assert.equal(hasIndependentSource(direct,otherSite),true);
});
test('sessions are numbered oldest first while newest is listed first',()=>{const sessions=[{id:'later',startedAt:'2026-11-04T02:00:00Z'},{id:'early',startedAt:'2026-11-04T01:00:00Z'}];assert.deepEqual(numberSessions(sessions,s=>s.startedAt).map(s=>[s.id,s.label]),[['later','Session 2'],['early','Session 1']]);});

import {retrieve} from '../src/retrieve.ts';
import {hasEnoughTopicWords,sharesTopicWords} from '../src/textQuality.ts';
test('retrieval selects relevant chunks and avoids duplicate search snapshots',()=>{
 const base={id:'a',workspaceId:'w',title:'Biology',url:'https://google.com/search?q=bones&tracking=1',quote:'Unrelated introduction.\n\nHaversian canals carry blood vessels through compact bone.',capturedAt:'2026-11-04T00:00:00Z',version:'1',origin:'live'} as Passage;
 const result=retrieve('Haversian canals',[base,{...base,id:'b',url:'https://google.com/search?q=bones&tracking=2'}]);
 assert.equal(result.length,1);assert.match(result[0].quote,/Haversian/);
 assert.equal(retrieve('astronomy',[base]).length,0);
 assert.equal(retrieve('4wtkmrmkw',[base]).length,0);
 assert.equal(retrieve('quantum astronomy',[base]).length,0);
 assert.equal(retrieve('Haversian canals',[base]).length,1);
 assert.equal(retrieve('HTML',[{...base,title:'HTML guide',quote:'HTML describes page structure.'}]).length,1);
 assert.equal(retrieve('Summarize the key evidence collected',[base]).length,1);
 assert.equal(retrieve('What qualifications appear in my saved evidence?',[base]).length,1);
});
test('unclear statements and statements unrelated to their source are rejected',()=>{
 assert.equal(hasEnoughTopicWords(''),false);
 assert.equal(hasEnoughTopicWords('what is the'),false);
 assert.equal(hasEnoughTopicWords('What is HTML?'),true);
 assert.equal(hasEnoughTopicWords('Method A encodes images faster'),true);
 assert.equal(sharesTopicWords('4wtkmrmkw','Quantum physics describes energy and matter.'),false);
 assert.equal(sharesTopicWords('HTML','HTML describes page structure.'),true);
 assert.equal(sharesTopicWords('Did the Battle of Bastille really take place on 14 July 1789?','July 14 1789: Storming of the Bastille.'),true);
});

import {compareText,relatedClaims,excerptStatus} from '../src/changeReview.ts';
test('change review identifies edited wording and only linked notes from the source',()=>{
 const before='The canals contain blood vessels in compact bone.',after='The canals contain blood vessels and nerves in compact bone.';
 const diff=compareText(before,after);assert.equal(diff.changed,true);assert.match(diff.after,/nerves/);assert.equal(compareText(before,before).changed,false);
 const p={id:'source',workspaceId:'a',url:'https://example.com/article',quote:before} as Passage;
 const c={id:'note',workspaceId:'a',passageId:'source'} as Claim;
 assert.equal(relatedClaims(p.url,[c],[p]).length,1);assert.equal(relatedClaims('https://other.example',[c],[p]).length,0);assert.equal(relatedClaims(p.url,[{...c,workspaceId:'b'}],[p]).length,0);
 assert.equal(excerptStatus(before,before,after),'missing');assert.equal(excerptStatus('short',before,after),'unknown');
});
