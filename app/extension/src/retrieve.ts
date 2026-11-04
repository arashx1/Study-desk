import type {Passage} from './types';
import {topicWords} from './textQuality.ts';
const tokens=(s:string)=>[...topicWords(s)];
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
