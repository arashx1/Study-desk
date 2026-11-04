const assert = require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 let created;
 const event={addListener(){}};
 const state={autoSession:{id:'session',workspaceId:'workspace',windowId:7,tabIds:[1],paused:false}};
 global.chrome={tabs:{onCreated:{addListener(fn){created=fn}},onUpdated:event},runtime:{onMessage:event,onStartup:event,onInstalled:event},contextMenus:{onClicked:event},storage:{local:{async get(){return structuredClone(state)},async set(value){Object.assign(state,value)}}}};
 await import(pathToFileURL(path.resolve('app/extension/dist/background.js')).href);
 created({id:2,windowId:7});await new Promise(setImmediate);
 assert.ok(state.autoSession.tabIds.includes(2),'new tab without opener joins');
 created({id:3,windowId:8});await new Promise(setImmediate);
 assert.ok(!state.autoSession.tabIds.includes(3),'other windows excluded');
 state.autoSession.paused=true;created({id:4,windowId:7});await new Promise(setImmediate);
 assert.ok(!state.autoSession.tabIds.includes(4),'paused session excludes new tabs');
 console.log('PASS: fresh tab enrollment, window isolation and paused capture');
})().catch(e=>{console.error(e);process.exitCode=1});
