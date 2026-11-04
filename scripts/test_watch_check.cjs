const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
(async()=>{
 const events=[];const event={addListener(){}};
 const state={pageMonitors:[{id:'m',workspaceId:'w',url:'https://example.test/article',title:'Demo'}],pageChanges:[]};
 const local={async get(keys){if(typeof keys==='string')return {[keys]:structuredClone(state[keys])};const result={};for(const k of keys)result[k]=structuredClone(state[k]);return result},async set(value){Object.assign(state,structuredClone(value))}};
 global.chrome={storage:{local},permissions:{async contains(){return true}},tabs:{onCreated:event,onUpdated:event,onRemoved:event,onActivated:event},runtime:{onMessage:{addListener(f){events.push(f)}},onStartup:event,onInstalled:event},contextMenus:{onClicked:event},alarms:{onAlarm:event}};
 let html='<html><body><p>The canals contain blood vessels in compact bone.</p></body></html>';
 global.fetch=async(url,opts)=>{assert.equal(opts.credentials,'omit');return new Response(html,{status:200,headers:{'content-type':'text/html'}})};
 await import(pathToFileURL(path.resolve('app/extension/dist/background.js')).href);
 const check=()=>new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('No response from watcher')),2000);for(const f of events){const result=f({type:'check-watched-sources'},null,r=>{clearTimeout(timer);resolve(r)});if(result===true)return;}});
 assert.deepEqual(await check(),{ok:true});assert.equal(state.pageChanges.length,0,'first check establishes baseline');
 html='<html><body><p>The canals contain blood vessels and nerves in compact bone.</p></body></html>';
 assert.deepEqual(await check(),{ok:true});assert.equal(state.pageChanges.length,1);assert.equal(state.pageChanges[0].workspaceId,'w');assert.match(state.pageChanges[0].before,/blood vessels in/);assert.match(state.pageChanges[0].after,/and nerves/);
 assert.deepEqual(await check(),{ok:true});assert.equal(state.pageChanges.length,1,'unchanged checks do not duplicate');
 console.log('PASS: public page baseline, update detection and duplicate prevention');
})().catch(e=>{console.error(e);process.exitCode=1});
