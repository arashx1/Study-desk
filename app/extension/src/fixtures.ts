import type { Workspace, Passage, Claim } from './types';
export function fixtureData() {
  const id=crypto.randomUUID(), now=new Date().toISOString();
  const workspace:Workspace={id,name:'Mobile image research · example',question:'Which compression method is suitable for older mobile devices?',nextStep:'Compare device conditions before revising the conclusion.',notes:'Illustrative research, not real benchmark results.',questions:'What are the memory and battery costs?',createdAt:now};
  const passages:Passage[]=[
    {id:crypto.randomUUID(),workspaceId:id,title:'Desktop benchmark · synthetic fixture',url:'http://127.0.0.1:8765/fixtures/desktop',quote:'In this synthetic desktop test, Method A encodes images faster than Method B. Mobile hardware was not evaluated.',prefix:'',suffix:'',capturedAt:now,version:'fixture-desktop-v1',origin:'fixture'},
    {id:crypto.randomUUID(),workspaceId:id,title:'Older-phone test · synthetic fixture',url:'http://127.0.0.1:8765/fixtures/mobile',quote:'In this synthetic older-phone test, Method A uses more memory and encodes more slowly than Method B. These conditions differ from desktop benchmarks.',prefix:'',suffix:'',capturedAt:now,version:'fixture-mobile-v1',origin:'fixture'},
    {id:crypto.randomUUID(),workspaceId:id,title:'Scope notes · synthetic fixture',url:'http://127.0.0.1:8765/fixtures/scope',quote:'Battery usage has not been measured in this illustrative collection. No conclusion about battery efficiency follows from encoding speed alone.',prefix:'',suffix:'',capturedAt:now,version:'fixture-scope-v1',origin:'fixture'}
  ];
  const claim:Claim={id:crypto.randomUUID(),workspaceId:id,text:'Method A is faster on mobile devices.',scope:'Mobile hardware; encoding speed',passageId:passages[0].id,paragraph:'Method A is the best choice for mobile image compression because it is faster than Method B.',revision:1};
  return {workspace,passages,claim};
}
