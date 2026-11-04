import type {Passage} from './types';
import {BACKEND} from './backend.ts';
import {topicWords} from './textQuality.ts';
const tokens=(s:string)=>[...topicWords(s)];
export async function retrieveHybrid(question:string, passages:Passage[], workspaceId:string) {
 const scoped=passages.filter(p=>p.workspaceId===workspaceId);
 const lexical=retrieve(question,scoped);
 const pool=[...lexical,...scoped.slice().sort((a,b)=>b.capturedAt.localeCompare(a.capturedAt))];
 const unique=[...new Map(pool.map(p=>[p.id,p])).values()].slice(0,24);
 if(!unique.length)return [];
 try {
  const r=await fetch(BACKEND+'/api/retrieve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId,question,passages:unique.map(p=>({...p,quote:p.quote.slice(0,800)}))}),signal:AbortSignal.timeout(40000)});
  if(!r.ok)return lexical;
  const data=await r.json();
  if(!Array.isArray(data.ids)||data.ids.some((id:unknown)=>typeof id!=='string'||!unique.some(p=>p.id===id)))return lexical;
  return data.ids.slice(0,6).map((id:string)=>{const p=unique.find(p=>p.id===id)!;return lexical.find(c=>c.id===id)||{...p,quote:p.quote.slice(0,1800)};}) as Passage[];
 }catch{return lexical;}
}
export function retrieve(question:string,passages:Passage[],limit=6){
 const terms=tokens(question),broad=terms.length===0 && /summari[sz]|last time|previous session|research|learn|find|found|sources|qualifications/i.test(question);
 if(terms.length===0&&!broad)return [];
 const chunks=passages.flatMap(p=>{
  const blocks=p.quote.split(/\n\s*\n/).filter(Boolean);let parts:string[]=[];let current='';
  for(const block of blocks){if(current.length+block.length>1400&&current){parts.push(current);current='';}current+=(current?'\n\n':'')+block;}if(current)parts.push(current);
  parts=parts.flatMap(t=>t.length>1800?Array.from({length:Math.ceil(t.length/1300)},(_,i)=>t.slice(i*1300,i*1300+1500)):[t]);
  return parts.map(text=>({p,text,words:tokens(text+' '+p.title)}));
 });
 const scored=chunks.map(c=>({...c,score:terms.reduce((sum,t)=>sum+(c.words.includes(t)?Math.log(1+chunks.length/(1+chunks.filter(x=>x.words.includes(t)).length)):0),0),matches:terms.filter(t=>c.words.includes(t)).length})).filter(c=>broad||c.matches>=1).sort((a,b)=>b.score-a.score||b.p.capturedAt.localeCompare(a.p.capturedAt));
 const urls=new Set<string>(),texts=new Set<string>();const result:Passage[]=[];
 for(const c of scored){const u=new URL(c.p.url);const url=u.hostname.includes('google.')?u.origin+u.pathname+'?q='+u.searchParams.get('q'):c.p.url;const fingerprint=c.text.toLowerCase().replace(/\s/g,'');if(urls.has(url)||texts.has(fingerprint))continue;urls.add(url);texts.add(fingerprint);result.push({...c.p,quote:c.text});if(result.length>=limit)break;}
 return result;
}
