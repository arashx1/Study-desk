import type { Passage, SavedTab } from './types';
import { isWebUrl } from './domain';
export const inExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id;
export async function activePage() {
  if (!inExtension) throw new Error('Open the installed extension to capture a browser page.');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !tab.url || !isWebUrl(tab.url)) throw new Error('Choose an ordinary webpage. Browser settings, PDFs and extension pages are unsupported.');
  return tab;
}
export async function saveCurrentPosition(): Promise<SavedTab> {
  const tab = await activePage();
  const origin = new URL(tab.url!).origin + '/*';
  const allowed = await chrome.permissions.request({ origins: [origin] });
  if (!allowed) throw new Error('Page permission was declined. Nothing was captured.');
  const [result] = await chrome.scripting.executeScript({ target: { tabId: tab.id! }, func: () => ({y: window.scrollY}) });
  return {url:tab.url!,title:tab.title||tab.url!,y:result.result?.y ?? null};
}
export async function restoreTabs(tabs: SavedTab[]) {
  if (!inExtension) throw new Error('Workspace restoration is available in the installed extension.');
  let restored = 0, positions = 0;
  const existing = await chrome.tabs.query({currentWindow:true});
  for (const saved of tabs) {
    if (!isWebUrl(saved.url)) continue;
    const found = existing.find(t=>t.url===saved.url);
    const tab = found ?? await chrome.tabs.create({url:saved.url,active:false});
    restored++;
    if (!tab.id || saved.y === null) continue;
    let ready = false;
    for (let attempt=0; attempt<20; attempt++) {
      const current = await chrome.tabs.get(tab.id);
      if (current.status==='complete') {ready=true;break;}
      await new Promise(resolve=>setTimeout(resolve,250));
    }
    if (!ready) continue;
    try {
      const result = await chrome.scripting.executeScript({target:{tabId:tab.id},func:(y:number)=>{ window.scrollTo({top:y,behavior:'instant'}); return Math.abs(window.scrollY-y)<5; },args:[saved.y]});
      if (result[0].result) positions++;
    } catch { /* URL is restored; position support is reported separately. */ }
  }
  return `${restored} tab(s) restored; ${positions} reading position(s) restored. Other tabs were left open.`;
}
export function openSource(p: Passage) {
  if (!isWebUrl(p.url)) return;
  const url = new URL(p.url); url.hash = ':~:text=' + encodeURIComponent(p.quote.slice(0,180));
  if (inExtension) void chrome.tabs.create({url:url.href}); else window.open(url.href,'_blank','noopener,noreferrer');
}
