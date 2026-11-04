const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 let created,removed,updated,activated; const listeners=[]; const message=(...args)=>{for(const fn of listeners)if(fn(...args)===true)return true;};
 const event={addListener(){}};
 const state={autoSession:{id:'s',workspaceId:'w',windowId:99,tabIds:[999],excluded:[999],paused:true}};
 const tabs=[{id:1,windowId:7,url:'https://example.com'},{id:2,windowId:7,url:'https://example.org'},{id:3,windowId:7,url:'chrome://extensions/'},{id:4,windowId:8,url:'https://other.com'},{id:5,windowId:7,url:'https://private.com',incognito:true}];
 global.chrome={tabs:{async query(q){return q.active?[tabs[0]]:q.windowId?tabs.filter(t=>t.windowId===q.windowId):tabs},onCreated:{addListener(fn){created=fn}},onUpdated:{addListener(fn){updated=fn}},onActivated:{addListener(fn){activated=fn}},async get(id){return tabs.find(t=>t.id===id)},onRemoved:{addListener(fn){removed=fn}}},runtime:{onMessage:{addListener(fn){listeners.push(fn)}},onStartup:event,onInstalled:event},contextMenus:{onClicked:event},storage:{local:{async get(){return structuredClone(state)},async set(v){Object.assign(state,v)}}}};
 await import(pathToFileURL(path.resolve('app/extension/dist/background.js')).href);
 const command=action=>new Promise(resolve=>message({type:'session-command',workspaceId:'w',action},null,resolve));
 assert.deepEqual(await command('sync'),{ok:true});
 assert.equal(state.autoSession.windowId,7,'stale window rebound');
 assert.deepEqual(state.autoSession.tabIds,[1],'restart recovers active tab without importing preexisting tabs');
 await new Promise(resolve=>message({type:'session-command',workspaceId:'w',action:'exclude',tabId:2},null,resolve));
 await command('sync');assert.deepEqual(state.autoSession.tabIds,[1],'explicit exclusion survives reconciliation');
 state.autoSession.paused=false; activated({tabId:2,windowId:7});await new Promise(setImmediate);assert.deepEqual(state.autoSession.tabIds,[1],'excluded visit stays excluded'); state.autoSession.excluded=[]; activated({tabId:2,windowId:7});await new Promise(setImmediate);assert.ok(state.autoSession.tabIds.includes(2),'visited preexisting tab enrolls'); state.autoSession.tabIds=[1]; removed(1);await new Promise(setImmediate);assert.deepEqual(state.autoSession.tabIds,[],'closed tab removed');
 console.log('PASS: stale-session recovery, initial-tab isolation, visited-tab enrollment, exclusions and closed tabs');
})().catch(e=>{console.error(e);process.exitCode=1});
