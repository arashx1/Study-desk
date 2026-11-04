const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');const path=require('node:path');
(async()=>{
 let updated;const event={addListener(){}};
 const state={autoSession:{id:'session-a',workspaceId:'w',windowId:7,tabIds:[5],excluded:[],paused:false},captureStatuses:{}};
 const local={async get(){return structuredClone(state)},async set(v){Object.assign(state,structuredClone(v))}};
 const tab={id:5,windowId:7,url:'chrome://settings',incognito:false};
 global.chrome={storage:{local},tabs:{onCreated:event,onUpdated:{addListener(fn){updated=fn}},onRemoved:event,onActivated:event,async get(){return tab}},runtime:{onMessage:event,onInstalled:event,onStartup:event},contextMenus:{onClicked:event}};
 await import(pathToFileURL(path.resolve('app/extension/dist/background.js')).href);
 updated(5,{url:tab.url},tab);
 await new Promise(resolve=>setTimeout(resolve,100));
 assert.equal(state.captureStatuses['5'].status,'unavailable');assert.match(state.captureStatuses['5'].message,/unsupported/i);assert.equal(state.captureStatuses['5'].sessionId,'session-a');
 console.log('PASS: unsupported browser page reports unavailable instead of saved');
})().catch(e=>{console.error(e);process.exitCode=1});
