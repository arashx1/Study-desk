import type { Tables, Claim, Finding, ReviewEvent } from './types';
let connection: Promise<IDBDatabase> | undefined;
export function database() {
  return connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('reentry', 1);
    request.onupgradeneeded = () => { for (const name of ['workspaces','passages','claims','findings','events','checkpoints']) request.result.createObjectStore(name, { keyPath: 'id' }); };
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
export async function all<K extends keyof Tables>(store: K): Promise<Tables[K][]> {
  const db = await database(); return new Promise((resolve, reject) => { const q = db.transaction(store).objectStore(store).getAll(); q.onsuccess = () => resolve(q.result); q.onerror = () => reject(q.error); });
}
export async function put<K extends keyof Tables>(store: K, value: Tables[K]) {
  const db = await database(); return new Promise<void>((resolve, reject) => { const tx = db.transaction(store, 'readwrite'); tx.objectStore(store).put(value); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); });
}
// The finding decision, draft revision and audit record commit together, including after a worker restart.
export async function review(findingId: string, decision: 'accepted'|'rejected', text: string) {
  const db = await database(); return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(['claims','findings','events','passages'], 'readwrite');
    let failure: Error | undefined;
    const abort = (message: string) => { failure = new Error(message); tx.abort(); };
    const req = tx.objectStore('findings').get(findingId);
    req.onsuccess = () => {
      const finding = req.result as Finding | undefined;
      if (!finding) return abort('Finding no longer exists.');
      if (finding.decision !== 'pending') return;
      const c = tx.objectStore('claims').get(finding.claimId);
      c.onsuccess = () => {
        const claim = c.result as Claim | undefined;
        if (!claim || claim.workspaceId !== finding.workspaceId || claim.revision !== finding.expectedRevision) return abort('The draft changed. Run a new check before applying this suggestion.');
        if (decision === 'accepted' && !text.trim()) return abort('Write the revised paragraph before accepting.');
        const event: ReviewEvent = { id: crypto.randomUUID(), workspaceId: claim.workspaceId, findingId, before: claim.paragraph, after: decision === 'accepted' ? text.trim() : claim.paragraph, decision, createdAt: new Date().toISOString() };
        tx.objectStore('events').put(event);
        if (decision === 'accepted') tx.objectStore('claims').put({ ...claim, paragraph: text.trim(), revision: claim.revision + 1 });
        tx.objectStore('findings').put({ ...finding, decision });
      };
    };
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(failure ?? tx.error); tx.onabort = () => reject(failure ?? tx.error);
  });
}

export async function clearResearchData(){
 const db=await database();const names=Array.from(db.objectStoreNames);
 await new Promise<void>((resolve,reject)=>{const tx=db.transaction(names,'readwrite');for(const name of names)tx.objectStore(name).clear();tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});
}
