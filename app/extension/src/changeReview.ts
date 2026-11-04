import type {Claim,Passage} from './types';
const normalize=(s:string)=>s.replace(/\s+/g,' ').trim();
export function compareText(before:string,after:string){
 const a=normalize(before),b=normalize(after);if(a===b)return {before:'',after:'',changed:false};
 let start=0;while(start<a.length&&start<b.length&&a[start]===b[start])start++;
 let end=0;while(end<a.length-start&&end<b.length-start&&a[a.length-1-end]===b[b.length-1-end])end++;
 // Include surrounding text so a small word change has context.
 const left=Math.max(0,start-100),rightA=Math.min(a.length,a.length-end+100),rightB=Math.min(b.length,b.length-end+100);
 return {before:a.slice(left,rightA)||'(nothing)',after:b.slice(left,rightB)||'(nothing)',changed:true};
}
export function relatedClaims(url:string,claims:Claim[],passages:Passage[]){
 return claims.flatMap(c=>{const p=passages.find(p=>p.id===c.passageId&&p.workspaceId===c.workspaceId);return p&&p.url===url?[{claim:c,passage:p}]:[];});
}
export function excerptStatus(quote:string,before:string,after:string){
 const q=normalize(quote);if(q.length<20||q.length>3000)return 'unknown';
 const original=normalize(before).includes(q),current=normalize(after).includes(q);
 return original&&!current?'missing':original&&current?'unchanged':'unknown';
}
