import { test } from 'node:test';
import { strict as assert } from 'node:assert';
import { evidenceExcerpt, evidenceCards } from '../src/evidence.ts';
import { retrieve } from '../src/retrieve.ts';

test('selects an exact relevant sentence, or admits there is no match', () => {
  const text = 'The website has many pages. A processor executes instructions stored in memory. Other content follows.';
  assert.equal(evidenceExcerpt('How a processor executes instructions', text), 'A processor executes instructions stored in memory.');
  assert.equal(evidenceExcerpt('Unrelated chemistry', text), '');
});

test('a broad-sounding question with a topic excludes unrelated pages', () => {
  const base = {workspaceId:'one',prefix:'',suffix:'',capturedAt:'2026-01-01',version:'v1',origin:'live' as const};
  const pages = [{...base,id:'a',url:'https://example.org/a',title:'Bone',quote:'The Haversian canal contains blood vessels.'},{...base,id:'b',url:'https://example.org/b',title:'Computer',quote:'A computer runs instructions.'}];
  assert.deepEqual(retrieve('What did the sources say about Haversian canal?',pages).map(p=>p.id),['a']);
});

test('never links a passage belonging to another workspace', () => {
  const claim = {id:'c',workspaceId:'one',text:'processor executes instructions',scope:'',passageId:'p',paragraph:'',revision:1};
  const passage = {id:'p',workspaceId:'two',url:'https://example.org',title:'Example',quote:'A processor executes instructions stored in memory.',prefix:'',suffix:'',capturedAt:'',version:'v1',origin:'live' as const};
  assert.equal(evidenceCards([claim],[passage]).length, 0);
});
