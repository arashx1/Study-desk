import {extractPage} from './extractPage';
import {all,put} from './db';
import {isWebUrl} from './domain';
type Session={id:string;workspaceId:string;windowId:number;tabIds:number[];excluded:number[];paused:boolean;startedAt:string};
let queue=Promise.resolve();
async function captureStatus(id:number,sessionId:string,status:'loading'|'saved'|'unavailable',message:string,url?:string){
 const d=await chrome.storage.local.get(['autoSession','captureStatuses']);
 if(d.autoSession?.id!==sessionId||!d.autoSession.tabIds.includes(id))return;
 const entries=d.captureStatuses||{};entries[String(id)]={sessionId,status,message,url,at:Date.now()};
 await chrome.storage.local.set({captureStatuses:entries});
}
function capture(id:number){queue=queue.then(()=>snapshot(id)).catch(async e=>{const d=await chrome.storage.local.get('autoSession');if(d.autoSession?.tabIds.includes(id))await captureStatus(id,d.autoSession.id,'unavailable','Could not read this page. It may be restricted or need permission.');await chrome.storage.local.set({sessionError:String(e)});});}
// Serialize membership changes so simultaneous tab events cannot overwrite one another.
let membership=Promise.resolve();
function mutate(work:()=>Promise<void>){const next=membership.then(work);membership=next.catch(()=>{});return next;}
async function reconcile(s:Session,windowId=s.windowId){
 const tabs=await chrome.tabs.query({windowId});
 const live=new Set(tabs.map(t=>t.id));
 s.excluded=(s.excluded||[]).filter(id=>live.has(id));
 s.windowId=windowId;
 s.tabIds=tabs.filter(t=>t.id&&s.tabIds.includes(t.id)&&!t.incognito&&!s.excluded.includes(t.id)).map(t=>t.id!);
 await chrome.storage.local.set({autoSession:s,sessionError:''});
 await chrome.alarms?.create('reentry-session',{periodInMinutes:1});
 if(!s.paused)for(const id of s.tabIds)capture(id);
}
chrome.tabs.onCreated.addListener(tab=>{void mutate(async()=>{
 const {autoSession:s}=await chrome.storage.local.get('autoSession') as {autoSession?:Session};
 if(!s||s.paused||!tab.id||tab.incognito||tab.windowId!==s.windowId)return;
 if((s.excluded||[]).includes(tab.id))return;
 if(!s.tabIds.includes(tab.id))s.tabIds.push(tab.id);
 await chrome.storage.local.set({autoSession:s});
 if(tab.url&&isWebUrl(tab.url))capture(tab.id);
}).catch(async e=>{await chrome.storage.local.set({sessionError:String(e)});});});
chrome.tabs.onUpdated.addListener((id,change,tab)=>{if(change.status==='complete'||change.url)void mutate(async()=>{
 const {autoSession:s}=await chrome.storage.local.get('autoSession') as {autoSession?:Session};
 if(!s||s.paused)return;
 if(tab?.windowId===s.windowId&&!tab.incognito&&tab.url&&isWebUrl(tab.url)&&!(s.excluded||[]).includes(id)&&!s.tabIds.includes(id)){s.tabIds.push(id);await chrome.storage.local.set({autoSession:s});}
 capture(id);if(change.status==='complete')for(const delay of [1800,5000])setTimeout(()=>capture(id),delay);
}).catch(async e=>{await chrome.storage.local.set({sessionError:String(e)});});});
// Capture both the page being left and the page being visited. Delayed retries cover async search results.
const activeByWindow=new Map<number,number>();
chrome.tabs.onActivated?.addListener(info=>{void mutate(async()=>{
 const {autoSession:s}=await chrome.storage.local.get('autoSession') as {autoSession?:Session};
 if(!s||s.paused||info.windowId!==s.windowId)return;
 const previous=activeByWindow.get(info.windowId);if(previous)capture(previous);
 activeByWindow.set(info.windowId,info.tabId);
 const tab=await chrome.tabs.get(info.tabId).catch(()=>undefined);
 if(!tab||tab.incognito||(s.excluded||[]).includes(info.tabId)||!tab.url||!isWebUrl(tab.url))return;
 if(!s.tabIds.includes(info.tabId)){s.tabIds.push(info.tabId);await chrome.storage.local.set({autoSession:s});}
 capture(info.tabId);
});});
chrome.tabs.onRemoved?.addListener(id=>{void mutate(async()=>{
 const {autoSession:s}=await chrome.storage.local.get('autoSession') as {autoSession?:Session};
 if(s){s.tabIds=s.tabIds.filter(x=>x!==id);s.excluded=(s.excluded||[]).filter(x=>x!==id);await chrome.storage.local.set({autoSession:s});}
});});
chrome.alarms?.onAlarm.addListener(a=>{if(a.name==='reentry-session')void mutate(async()=>{
 const {autoSession:s}=await chrome.storage.local.get('autoSession') as {autoSession?:Session};
 if(s&&!s.paused)await reconcile(s);
}).catch(async e=>{await chrome.storage.local.set({sessionError:String(e)});});});
chrome.runtime.onMessage.addListener((m,_sender,respond)=>{if(m?.type==='session-page-change'&&_sender.tab?.id){capture(_sender.tab.id);respond({ok:true});return;}if(m?.type==='session-ping'){respond({ok:true});return;}if(m?.type!=='session-command')return;void mutate(async()=>{
 const {autoSession:current}=await chrome.storage.local.get('autoSession');
 if(m.action==='start'){
  if(current)throw new Error('Finish the active session before starting another.');
  const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(!tab?.id)throw new Error('Open a browser window first.');
  if(!(await all('workspaces')).some(w=>w.id===m.workspaceId))throw new Error('Workspace unavailable.');
  const s:Session={id:crypto.randomUUID(),workspaceId:m.workspaceId,windowId:tab.windowId,tabIds:[tab.id],excluded:[],paused:false,startedAt:new Date().toISOString()};
  await reconcile(s);
 }else if(current&&current.workspaceId===m.workspaceId){
  if(m.action==='finish'){const [active]=await chrome.tabs.query({active:true,windowId:current.windowId});if(active?.id&&current.tabIds.includes(active.id)&&!current.paused)capture(active.id);await queue;await chrome.storage.local.remove('autoSession');await chrome.alarms?.clear('reentry-session');}
  if(m.action==='sync'){
   // Browser restarts invalidate saved tab/window IDs. Rebind only when its old window is gone.
   const windowsTabs=await chrome.tabs.query({});
   const ownerExists=windowsTabs.some(t=>t.windowId===current.windowId);
   const [active]=await chrome.tabs.query({active:true,currentWindow:true});
   if(!ownerExists&&active){current.excluded=[];current.tabIds=[active.id];await reconcile(current,active.windowId);}
   else await reconcile(current);
  }
  if(m.action==='pause'){current.paused=!current.paused;await chrome.storage.local.set({autoSession:current});if(!current.paused)await reconcile(current);}
  if(m.action==='include'){const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(tab?.id){current.excluded=(current.excluded||[]).filter((id:number)=>id!==tab.id);if(!current.tabIds.includes(tab.id))current.tabIds.push(tab.id);await chrome.storage.local.set({autoSession:current});capture(tab.id);}}
  if(m.action==='exclude'){current.tabIds=current.tabIds.filter((id:number)=>id!==m.tabId);current.excluded=[...new Set([...(current.excluded||[]),m.tabId])];await chrome.storage.local.set({autoSession:current});}
 }
 respond({ok:true});
 }).catch(e=>respond({error:String(e)}));return true;});
async function snapshot(id:number){
 const {autoSession:s}=await chrome.storage.local.get('autoSession') as {autoSession?:Session};if(!s||s.paused||!s.tabIds.includes(id))return;
 const tab=await chrome.tabs.get(id).catch(()=>undefined);if(!tab?.url||!isWebUrl(tab.url)){await captureStatus(id,s.id,'unavailable','Browser pages and unsupported URLs cannot be saved.',tab?.url);return;}await captureStatus(id,s.id,'loading','Reading page…',tab.url);
 await chrome.scripting.executeScript({target:{tabId:id},func:()=>{
  if(document.contentType!=='text/html')return null;
  const state=window as typeof window & {__reentryObserver?:boolean};
  if(!state.__reentryObserver){
   state.__reentryObserver=true;let timer:ReturnType<typeof setTimeout>;let previous='';
   new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{
    const body=document.querySelector('#rso,main,article,[role=main]')||document.body;
    const signature=location.href+'|'+(body.textContent||'').slice(0,20000);
    if(signature!==previous){previous=signature;void chrome.runtime.sendMessage({type:'session-page-change'}).catch(()=>{});}
   },1500);}).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  return true;
 }});
 await chrome.scripting.executeScript({target:{tabId:id},files:['readability.js']});
 const [{result:r}]=await chrome.scripting.executeScript({target:{tabId:id},func:extractPage});if(!r?.text){await captureStatus(id,s.id,'unavailable','No readable HTML found. PDFs and some dynamic pages are unsupported.',tab.url);return;}
 const after=await chrome.tabs.get(id).catch(()=>undefined);if(after?.url!==tab.url)return;
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(r.text)))].map(x=>x.toString(16).padStart(2,'0')).join('');
 // Recheck after asynchronous extraction so Pause/Finish prevents an in-flight save.
 const {autoSession:latest}=await chrome.storage.local.get('autoSession');if(!latest||latest.id!==s.id||latest.paused||!latest.tabIds.includes(id))return;
 const computedTitle = r.google
  ? (r.answer ? 'Google AI Overview: ' + (r.query || r.title) : 'Google Search: ' + (r.query || r.title))
  : r.title;
 const computedKind = r.google ? (r.answer ? 'ai-overview' : 'search') : 'webpage';
 const passages=await all('passages');if(!passages.some(p=>p.workspaceId===s.workspaceId&&p.url===tab.url&&p.version===hash&&p.sessionId===s.id))await put('passages',{id:crypto.randomUUID(),workspaceId:s.workspaceId,sessionId:s.id,url:tab.url,title:computedTitle,quote:r.text,searchQuery:r.query,displayedAnswer:r.answer,searchResults:r.results,captureKind:computedKind,prefix:r.google?(r.answer?'Google AI Overview scraped content. ':'Google search content. '):'Scraped webpage HTML content. ',suffix:'',version:hash,capturedAt:new Date().toISOString(),origin:'live'});
 const cps=await all('checkpoints');const old=cps.find(c=>c.workspaceId===s.workspaceId);await put('checkpoints',{id:s.workspaceId,workspaceId:s.workspaceId,tabs:[...(old?.tabs||[]).filter(t=>t.url!==tab.url),{url:tab.url,title:r.title,y:r.y}],savedAt:new Date().toISOString(),nextStep:old?.nextStep||''});
 await captureStatus(id,s.id,'saved','Saved',tab.url);await chrome.storage.local.set({capturedAt:Date.now(),sessionError:''});
}
