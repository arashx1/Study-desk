import './autoSession';
import {monitorText} from './monitorText';
import { all, put } from './db';
import { captureKey, isWebUrl } from './domain';
chrome.alarms?.onAlarm.addListener(alarm=>{if(alarm.name==='reentry-monitor')void checkMonitors();});
chrome.runtime.onStartup.addListener(()=>{void chrome.alarms?.create('reentry-monitor',{periodInMinutes:5});});
chrome.runtime.onMessage.addListener((message,_sender,respond)=>{if(message?.type!=='check-watched-sources')return;void checkMonitors().then(()=>respond({ok:true})).catch(e=>respond({error:String(e)}));return true;});
let monitorRun:Promise<void>|undefined;
function checkMonitors(){if(!monitorRun)monitorRun=runMonitors().finally(()=>{monitorRun=undefined;});return monitorRun;}
async function runMonitors(){
 const data=await chrome.storage.local.get(['pageMonitors','pageChanges']);
 const monitors=data.pageMonitors||[],changes=data.pageChanges||[];
 for(const m of monitors){try{
   const url=new URL(m.url);
   if(!['http:','https:'].includes(url.protocol)||!await chrome.permissions.contains({origins:[url.origin+'/*']}))throw new Error('Page permission unavailable.');
   const response=await fetch(url.href,{credentials:'omit',redirect:'error',cache:'no-store',signal:AbortSignal.timeout(10000)});
   if(!response.ok)throw new Error('Page returned HTTP '+response.status);
   if(!(response.headers.get('content-type')||'').includes('text/html'))throw new Error('Only HTML public pages are supported.');
   const reader=response.body?.getReader();if(!reader)throw new Error('No page body.');let size=0,html='';const decoder=new TextDecoder();
   try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>200000)throw new Error('Page exceeds the 200 KB monitoring limit.');html+=decoder.decode(part.value,{stream:true});}}finally{await reader.cancel();}
   const text=monitorText(html);
   if(m.extractionVersion===2&&m.text&&m.text!==text)changes.push({id:crypto.randomUUID(),monitorId:m.id,workspaceId:m.workspaceId,url:m.url,before:m.text,after:text,at:new Date().toISOString()});
   m.text=text;m.extractionVersion=2;m.checkedAt=new Date().toISOString();m.error='';
 }catch(e){m.error=String(e);}}
 // Re-read registrations so a stop-monitor action cannot be undone by an in-flight check.
 const latest=await chrome.storage.local.get('pageMonitors');
 const ids=new Set((latest.pageMonitors||[]).map((m:any)=>m.id));
 await chrome.storage.local.set({pageMonitors:(latest.pageMonitors||[]).map((m:any)=>monitors.find((checked:any)=>checked.id===m.id)||m),pageChanges:changes.filter((c:any)=>!c.monitorId||ids.has(c.monitorId)).slice(-100)});
}
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => chrome.contextMenus.create({ id: 'reentry-capture', title: "Save selection to Scholar's Desk", contexts: ['selection'], documentUrlPatterns: ['http://*/*','https://*/*'] }));
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'reentry-capture' || !tab?.id) return;
  // Start opening directly on the user gesture, before waiting on capture/storage.
  void chrome.sidePanel.open({ windowId: tab.windowId }).catch(() => {});
  void capture(tab, info.selectionText ?? '').catch(async error => { await chrome.storage.local.set({ captureError: String(error) }); });
});
async function capture(tab: chrome.tabs.Tab, fallback: string) {
  const settings = await chrome.storage.local.get(['activeWorkspace','autoSession']);
  if (!settings.activeWorkspace) throw new Error('Create and select a workspace, then save the selection again.');
  if (!tab.url || !isWebUrl(tab.url)) throw new Error('Only ordinary HTTP(S) pages are supported.');
  let quote = fallback, prefix = '', suffix = '', blocked = false;
  try {
    const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id! }, func: () => {
      const selection = window.getSelection(); const node = selection?.anchorNode?.parentElement;
      if (node?.closest('input,textarea,[contenteditable="true"]')) return {quote:'',prefix:'',suffix:'',blocked:true};
      const quote = selection?.toString() ?? ''; const context = node?.textContent ?? ''; const index = context.indexOf(quote);
      return { quote, prefix: context.slice(Math.max(0,index-150),index), suffix: context.slice(index+quote.length,index+quote.length+150),blocked:false };
    }});
    blocked=!!result.result?.blocked;
    if (result.result?.quote) ({quote,prefix,suffix}=result.result);
  } catch { /* Selection supplied by contextMenus remains available on non-injectable pages. */ }
  if (blocked) throw new Error('Private editor fields are not captured. Select text in the page body instead.');
  quote = quote.trim().slice(0,20000); if (!quote) throw new Error('Select a passage first.');
  const workspaceId = String(settings.activeWorkspace);
  const existing = await all('passages');
  if (existing.some(p=>captureKey(p.workspaceId,p.url,p.quote)===captureKey(workspaceId,tab.url!,quote))) return;
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(quote)))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const id=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(captureKey(workspaceId,tab.url,quote))))].map(x=>x.toString(16).padStart(2,'0')).join('');
  await put('passages',{ id, workspaceId, sessionId:settings.autoSession?.workspaceId===workspaceId?settings.autoSession.id:undefined, url: tab.url, title: tab.title || tab.url, quote, prefix, suffix, version: hash, capturedAt: new Date().toISOString(), origin:'live' });
  await chrome.storage.local.set({ captureError: '', capturedAt: Date.now() });
}
