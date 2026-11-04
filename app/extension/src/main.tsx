import {BackendStatus} from './backend';
import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUpRight, BookmarkPlus, BookOpen, Check, ChevronRight, Download, FileText, GitBranch, Globe, History, House, Layers, Plus, RotateCcw, Search, Sparkles, X } from 'lucide-react';
import { all, put, review, clearResearchData } from './db';
import { captureKey, hasIndependentSource, isDirectEvidence, isSavedWebSource, isWebScrapedResult, isWebUrl, markdown, sourceLabel, validateFinding } from './domain';
import { hasEnoughTopicWords, sharesTopicWords } from './textQuality';
import { fixtureData } from './fixtures';
import { inExtension, openSource, restoreTabs, saveCurrentPosition } from './browser';
import type { Workspace, Passage, Claim, Finding, ReviewEvent, Checkpoint } from './types';
import './style.css';
import AskResearch from './AskResearch';
import SessionControls from './SessionControls';
import Research from './Research';
import SourceChanges from './SourceChanges';
import RagFloatingWidget from './RagFloatingWidget';
const stamp=()=>new Date().toISOString();
const shortDate=(value:string)=>new Date(value).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
function App() {
  const [workspaces,setWorkspaces]=useState<Workspace[]>([]),[active,setActive]=useState('');
  const [passages,setPassages]=useState<Passage[]>([]),[claims,setClaims]=useState<Claim[]>([]),[findings,setFindings]=useState<Finding[]>([]),[events,setEvents]=useState<ReviewEvent[]>([]),[checkpoint,setCheckpoint]=useState<Checkpoint>();
  const [tab,setTab]=useState('Home'),[message,setMessage]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
  const [handoffQuestion,setHandoffQuestion]=useState('');
  const [creating,setCreating]=useState(false),[name,setName]=useState(''),[question,setQuestion]=useState(''),[search,setSearch]=useState('');
  const [manual,setManual]=useState(false),[quote,setQuote]=useState(''),[url,setUrl]=useState(''),[title,setTitle]=useState('');
  const [claimForm,setClaimForm]=useState(false),[claimText,setClaimText]=useState(''),[paragraph,setParagraph]=useState(''),[scope,setScope]=useState(''),[sourceId,setSourceId]=useState('');
  const [compareText,setCompareText]=useState(''),[compareSourceId,setCompareSourceId]=useState(''),[newEvidence,setNewEvidence]=useState(''),[rationale,setRationale]=useState(''),[kind,setKind]=useState<Finding['status']>('needs_qualification');
  const [quickNote,setQuickNote]=useState(''),[watchedChanges,setWatchedChanges]=useState<any[]>([]);
  const [revisions,setRevisions]=useState<Record<string,string>>({}),[inspected,setInspected]=useState<Passage>();
  const w=workspaces.find(w=>w.id===active), ps=passages.filter(p=>p.workspaceId===active), visited=[...new Map(ps.slice().sort((a,b)=>a.capturedAt.localeCompare(b.capturedAt)).map(p=>{const u=new URL(p.url);return [u.hostname.includes('google.')?u.origin+u.pathname+'?q='+u.searchParams.get('q'):p.url,p];})).values()].reverse(), cs=claims.filter(c=>c.workspaceId===active), fs=findings.filter(f=>f.workspaceId===active), es=events.filter(e=>e.workspaceId===active);
  const originalEvidence=ps.find(p=>p.id===compareSourceId), comparisonEvidence=ps.find(p=>p.id===newEvidence), independentEvidence=ps.filter(p=>originalEvidence&&hasIndependentSource(originalEvidence,p)), compareMatchesOriginal=!!originalEvidence&&sharesTopicWords(compareText,originalEvidence.title+' '+originalEvidence.quote);
  async function load() {
    if(inExtension){const data=await chrome.storage.local.get('pageChanges');setWatchedChanges(data.pageChanges||[]);}
    const [ws,ps,cs,fs,es,cps]=await Promise.all([all('workspaces'),all('passages'),all('claims'),all('findings'),all('events'),all('checkpoints')]);
    setWorkspaces(ws);setPassages(ps);setClaims(cs);setFindings(fs);setEvents(es);
    setCheckpoint(cps.filter(c=>c.workspaceId===active).sort((a,b)=>b.savedAt.localeCompare(a.savedAt))[0]);
  }
  async function run(action:()=>Promise<void>) {setBusy(true);setError('');setMessage('');try{await action();await load();}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setBusy(false);}}
  useEffect(()=>{void (async()=>{try{const ws=await all('workspaces');let id=localStorage.getItem('reentry-workspace')||ws[0]?.id||'';if(inExtension){const s=await chrome.storage.local.get('activeWorkspace');id=s.activeWorkspace||id;}if(!ws.some(w=>w.id===id))id=ws[0]?.id||'';setActive(id);await load();}catch(e){setError(String(e));}finally{setReady(true);}})();},[]);
  useEffect(()=>{if(!ready)return; localStorage.setItem('reentry-workspace',active);if(inExtension)void chrome.storage.local.set({activeWorkspace:active});void load().catch(e=>setError(String(e)));},[active,ready]);
  useEffect(()=>{if(!inExtension)return;const listener=(changes:Record<string,chrome.storage.StorageChange>)=>{if(changes.capturedAt||changes.pageChanges)void load().catch(e=>setError(String(e)));if(changes.captureError?.newValue)setError(changes.captureError.newValue);};chrome.storage.onChanged.addListener(listener);return()=>chrome.storage.onChanged.removeListener(listener);},[active]);
  useEffect(()=>{if(inspected){document.getElementById('evidence-inspector')?.scrollIntoView({block:'nearest'});document.getElementById('evidence-inspector')?.focus();}},[inspected]);
  async function updateWorkspace(patch:Partial<Workspace>) {if(w){const next={...w,...patch};await put('workspaces',next);setWorkspaces(items=>items.map(x=>x.id===w.id?next:x));}}
  async function createWorkspace(){if(!name.trim())throw new Error('Give this workspace a name.');const next:Workspace={id:crypto.randomUUID(),name:name.trim(),question,nextStep:'',notes:'',questions:'',createdAt:stamp()};await put('workspaces',next);setActive(next.id);setCreating(false);setName('');setQuestion('');}
  async function demo(){const data=fixtureData();await put('workspaces',data.workspace);for(const p of data.passages)await put('passages',p);await put('claims',data.claim);setActive(data.workspace.id);setMessage('Example workspace created. All benchmark passages are synthetic and labelled.');}
  async function addPassage(){if(!w)throw new Error('Choose a workspace first.');if(!quote.trim()||!title.trim()||!isWebUrl(url))throw new Error('Enter a page name, a valid web address and the text you want to save.');if(ps.some(p=>captureKey(p.workspaceId,p.url,p.quote)===captureKey(w.id,url,quote)))throw new Error('This excerpt is already saved in this workspace.');const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(quote.trim())))].map(x=>x.toString(16).padStart(2,'0')).join('');await put('passages',{id:crypto.randomUUID(),workspaceId:w.id,url,title,quote:quote.trim(),prefix:'',suffix:'',version:hash,capturedAt:stamp(),origin:'live'});setManual(false);setTitle('');setUrl('');setQuote('');setMessage('Excerpt saved with its source.');}
  async function linkNote(){if(!w||!inspected||!quickNote.trim())throw new Error('Write a note to connect to this source.');const note=quickNote.trim();await put('claims',{id:crypto.randomUUID(),workspaceId:w.id,text:note,paragraph:note,scope:'',passageId:inspected.id,revision:1,createdAt:stamp()});setQuickNote('');setMessage('Note linked to the saved source. Watch this source to see future changes.');}
  async function addClaim(){const source=ps.find(p=>p.id===sourceId);if(!w||!source||!isSavedWebSource(source))throw new Error('Choose a saved webpage or WebScraper result.');if(!hasEnoughTopicWords(claimText)||!hasEnoughTopicWords(paragraph))throw new Error('Add a short statement and draft sentence with at least one topic word each.');if(!sharesTopicWords(claimText,source.quote+' '+source.title))throw new Error('The saved excerpt does not mention this topic. Choose or save a passage that directly discusses it; conditions or summary notes do not count as evidence.');await put('claims',{id:crypto.randomUUID(),workspaceId:w.id,text:claimText.trim(),paragraph:paragraph.trim(),scope:scope.trim(),passageId:sourceId,revision:1});setClaimForm(false);setClaimText('');setParagraph('');setMessage('Statement linked to its saved source. A generated answer is not independent evidence.');}
  async function addFinding(ai=false){const p=ps.find(p=>p.id===newEvidence),original=ps.find(source=>source.id===compareSourceId),text=compareText.trim();if(!w||!original||!p)throw new Error('Choose the saved result and an independent source.');if(!isSavedWebSource(original)||!hasIndependentSource(original,p))throw new Error('Choose a saved result and a page from a different website.');if(!hasEnoughTopicWords(text)||!sharesTopicWords(text,original.title+' '+original.quote))throw new Error('Enter a short question or statement that matches the saved result.');let c=cs.find(claim=>claim.passageId===original.id&&claim.text.trim().toLowerCase()===text.toLowerCase());const newClaim=!c;if(!c)c={id:crypto.randomUUID(),workspaceId:w.id,text,scope:'',passageId:original.id,paragraph:text,revision:1,createdAt:stamp()};let f:Finding={id:crypto.randomUUID(),workspaceId:w.id,claimId:c.id,passageIds:[original.id,p.id],expectedRevision:c.revision,rationale,status:kind,decision:'pending',mode:ai?'ai':'manual',suggestedText:'',createdAt:stamp()};
    if(ai){const response=await fetch('http://127.0.0.1:8765/api/checks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({workspaceId:w.id,claim:c,passages:[original,p]}),signal:AbortSignal.timeout(45000)});const data=await response.json();if(!response.ok)throw new Error(data.error?.message||'The AI check failed.');f={...f,...data.finding,id:f.id,claimId:c.id,workspaceId:w.id,expectedRevision:c.revision,decision:'pending',mode:'ai',createdAt:f.createdAt};}
    else if(!rationale.trim())throw new Error('Explain why the evidence needs review. This is a manual finding, not an AI verdict.');
    if(newClaim)await put('claims',c);validateFinding(c,ps,f);await put('findings',f);setCompareText('');setNewEvidence('');setRationale('');setTab('Evidence');setMessage(ai?'Comparison saved for your review.':'Your comparison was saved. No AI analysis was claimed.');}
  async function saveTab(){if(!w)return;const saved=await saveCurrentPosition();const previous=checkpoint?.tabs||[];await put('checkpoints',{id:active,workspaceId:active,tabs:[...previous.filter(t=>t.url!==saved.url),saved],savedAt:stamp(),nextStep:w.nextStep});setMessage('Current tab and reading position added to the checkpoint.');}
  async function resetData(){
    if(!window.confirm("Permanently clear ALL Scholar's Desk workspaces, sources, sessions, answers, notes and monitoring on this browser? This cannot be undone. Downloaded reports are not deleted."))return;
    if(inExtension){await chrome.storage.local.remove('autoSession');await chrome.alarms.clearAll();await chrome.storage.local.clear();}
    await clearResearchData();
    for(const key of Object.keys(localStorage))if(key.startsWith('reentry-'))localStorage.removeItem(key);
    window.location.reload();
  }
  async function exportNotes(){if(!w)return;const blob=new Blob([markdown(w,ps,cs,fs)],{type:'text/markdown;charset=utf-8'}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=w.name.replace(/[^a-z0-9-]/gi,'_')+'.md';link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);setMessage('Notes exported with evidence versions and review status.');}
  return <div className="shell">
    <header className="topbar"><a className="brand" href="#" aria-label="Scholar's Desk home"><span className="brandmark"><img src="/icons/scholars-desk-lamp.svg" alt="" /></span><span>Scholar's Desk<small>A little context, whenever you return.</small></span></a><button className="icon" title="Export workspace notes" aria-label="Export workspace notes" disabled={!w||busy} onClick={()=>void run(exportNotes)}><Download size={18}/></button></header>
    <main className="app-layout">
      <nav className="side-nav" aria-label="Workspace views">{[
        {label:'Home',Icon:House},
        {label:'Sources',Icon:BookOpen},
        {label:'Ask',Icon:Sparkles},
        {label:'Evidence',Icon:GitBranch},
        {label:'Research',Icon:Globe},
        {label:'Timeline',Icon:History},
      ].map(({label,Icon})=><button type="button" key={label} title={label} aria-label={label} aria-current={tab===label?'page':undefined} className={`side-nav-button ${tab===label?'selected':''}`} onClick={()=>setTab(label)}><Icon size={18}/><span className="nav-label">{label==='Evidence'?'Claims & evidence':label==='Research'?'Reports':label==='Timeline'?'History':label}</span>{label==='Evidence'&&fs.some(f=>f.decision==='pending')&&<span className="count">{fs.filter(f=>f.decision==='pending').length}</span>}</button>)}</nav>
      <div className="main-content">
      <div className="workspace-bar"><label className="sr" htmlFor="workspace">Workspace</label><Layers size={17}/><select id="workspace" value={active} onChange={e=>{setActive(e.target.value);setCompareSourceId('');setCompareText('');setNewEvidence('');setInspected(undefined);}}><option value="" disabled>Choose a workspace</option>{workspaces.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select><button className="icon" aria-label="Create workspace" onClick={()=>setCreating(!creating)}><Plus size={18}/></button></div>
      {creating&&<form className="form inset" onSubmit={e=>{e.preventDefault();void run(createWorkspace);}}><h2>Start a research workspace</h2><label>Name<input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Final-year project" maxLength={120}/></label><label>Research question<textarea value={question} onChange={e=>setQuestion(e.target.value)} placeholder="What are you trying to understand?"/></label><div className="actions"><button className="primary" disabled={busy}>Create workspace</button><button type="button" onClick={()=>setCreating(false)}>Cancel</button></div></form>}
      {error&&<div className="notice error" role="alert">{error}<button className="icon" aria-label="Dismiss error" onClick={()=>setError('')}><X size={15}/></button></div>}
      {message&&<div className="notice success" role="status">{message}</div>}
      {!ready?<div className="empty">Opening your saved research…</div>:!w?<section className="welcome"><div className="welcome-symbol"><GitBranch size={38}/></div><h1>Pick up the thread.</h1><p>Save the evidence, remember your next step, and return to the thinking behind your tabs.</p><button className="primary" onClick={()=>setCreating(true)}><Plus size={17}/>Create your first workspace</button><button className="text-button" disabled={busy} onClick={()=>void run(demo)}>Explore a labelled example <ChevronRight size={16}/></button><p className="fine">Your workspace stays on this device. AI is optional.</p></section>:<>
        <section className="home-view" hidden={tab!=='Home'}>
          <SessionControls key={'session-'+w.id} workspaceId={w.id} onSwitch={setActive} onFinish={()=>{setTab('Research');window.setTimeout(()=>document.getElementById('session-report')?.focus(),100);}}/>
          {visited.length>0&&<section className="duo-card"><h2>Pick up where you stopped</h2><p>Last saved: <strong>{visited[0].title}</strong></p><p>{w.nextStep||w.questions.split('\n').find(q=>q.trim())||'Review your saved sources and choose your next question.'}</p><div className="actions"><button onClick={()=>setInspected(visited[0])}>Review last source</button><button onClick={()=>{setHandoffQuestion(w.questions.split('\n').find(q=>q.trim())||'Summarize my research about '+(w.question||w.name));setTab('Ask');}}>Continue with a question</button></div></section>}
          <div className="duo-stat-bar">
            <div className="duo-chip green"><span>📚</span> <strong>{ps.length}</strong> Sources</div>
            <div className="duo-chip yellow"><span>📝</span> <strong>{cs.length}</strong> Notes</div>
            {checkpoint&&<div className="duo-chip blue"><span>💾</span> <strong>{checkpoint.tabs.length}</strong> Tabs</div>}
          </div>

          <div className="home-hero-card">
            <div className="home-hero-header">
              <h1>Welcome back to {w.name}!</h1>
              {w.question?<div className="home-hero-goal"><strong>Goal:</strong> {w.question}</div>:null}
            </div>
            <div className="home-hero-actions">
              <button className="primary duo-hero-btn" disabled={busy||!checkpoint?.tabs.length} onClick={()=>void run(async()=>setMessage(await restoreTabs(checkpoint!.tabs)))}>
                <RotateCcw size={17}/> RESUME SAVED PAGES ({checkpoint?.tabs.length||0})
              </button>
              <button className="duo-btn duo-btn-secondary" onClick={()=>setTab('Sources')}>
                <Search size={15}/> VIEW EVIDENCE
              </button>
            </div>
          </div>

          <div className="duo-card duo-step-card">
            <label htmlFor="next-step-input">Where did you leave off?</label>
            <input id="next-step-input" key={'resume-next-'+w.id} defaultValue={w.nextStep} placeholder="e.g. Compare quantum error algorithms" onBlur={e=>void run(()=>updateWorkspace({nextStep:e.target.value}))}/>
            <details style={{marginTop:'12px'}}>
              <summary>Add research notes</summary>
              <textarea key={'resume-note-'+w.id} style={{marginTop:'8px'}} defaultValue={w.notes} placeholder="Capture any thoughts or findings..." onBlur={e=>void run(()=>updateWorkspace({notes:e.target.value}))}/>
            </details>
          </div>

          <section className="duo-card duo-visited-websites-section">
            <div className="section-heading">
              <h2>Saved pages ({visited.length})</h2>
              {visited.length > 5 && (
                <button className="text-button" onClick={() => setTab('Sources')}>
                  View all ({visited.length}) <ChevronRight size={14} />
                </button>
              )}
            </div>
            <p className="helper">Pages successfully captured during this workspace’s sessions appear here. Some sites, PDFs and restricted pages cannot be captured.</p>

            {ps.length === 0 ? (
              <div className="empty" style={{ padding: '20px 8px' }}>
                <Globe size={26} style={{ color: 'var(--duo-blue)' }} />
                <h3>No saved pages yet</h3>
                <p>Start a session using the floating capture button, then browse a supported webpage.</p>
              </div>
            ) : (
              <div className="duo-visited-list">
                {visited.slice(0, 8).map(p => {
                  let hostname = 'webpage';
                  try { hostname = new URL(p.url).hostname; } catch {}
                  const isAi = p.title.includes('AI Overview') || p.captureKind === 'ai-overview' || !!p.displayedAnswer;
                  const isSearch = p.captureKind === 'search';

                  return (
                    <article className="duo-visited-item" key={p.id}>
                      <div className="duo-visited-header">
                        <div className="duo-visited-domain">
                          <span className="duo-globe-icon">{isAi ? '✨' : isSearch ? '🔍' : '🌐'}</span>
                          <strong>{hostname}</strong>
                        </div>
                        <div className="duo-visited-badges">
                          <span className={`duo-kind-badge ${isAi ? 'badge-ai' : isSearch ? 'badge-search' : 'badge-page'}`}>
                            {isAi ? 'AI OVERVIEW' : isSearch ? 'SEARCH' : 'WEB PAGE'}
                          </span>
                          <span className="fine">{shortDate(p.capturedAt)}</span>
                        </div>
                      </div>

                      <h3 className="duo-visited-title">
                        <button onClick={() => setInspected(p)}>{p.title}</button>
                      </h3>

                      <p className="duo-visited-snippet">
                        {p.quote.slice(0, 180)}...
                      </p>

                      <div className="duo-visited-actions">
                        <button className="duo-btn duo-btn-small" onClick={() => setInspected(p)}>
                          <BookOpen size={12} /> Inspect Scraped Text
                        </button>
                        <button className="text-button" onClick={() => openSource(p)}>
                          Open Page <ArrowUpRight size={13} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <SourceChanges key={'changes-'+w.id} workspace={w} passages={ps} claims={cs} inspect={setInspected}/>
          <details className="resume" style={{marginTop:'14px'}}><summary>More checkpoint options</summary><button style={{marginTop:'8px'}} disabled={busy} onClick={()=>void run(saveTab)}><BookmarkPlus size={15}/>Save current reading position</button></details>
        </section>

        {tab==='Ask'&&<AskResearch key={'ask-'+w.id} workspace={w} passages={ps} inspect={setInspected} initialQuestion={handoffQuestion}/>}<Research key={'research-'+w.id} workspace={w} passages={ps} claims={cs} inspect={setInspected} refresh={load} visible={tab==='Research'}/>{tab==='Sources'&&<section className="view"><div className="section-heading"><h2>Saved sources <span className="muted">{ps.length}</span></h2><button className="text-button" aria-expanded={manual} aria-controls="manual-source-form" onClick={()=>setManual(!manual)}><Plus size={15}/>{manual?'Close form':'Save text from a page'}</button></div><p className="helper">Pages and excerpts you’ve saved appear here. Quick way: select text on a webpage, right-click, then choose “Save selection to Scholar's Desk”.</p>
          {manual&&<form id="manual-source-form" className="form inset manual-source-form" onSubmit={e=>{e.preventDefault();void run(addPassage);}}><h3>Save text from a page</h3><p className="helper">Already copied a useful sentence or paragraph? Add it here with the page name and address so you can find the original again.</p><label>Page name<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="For example: How photosynthesis works" required maxLength={300}/></label><label>Page address (URL)<input type="url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/article" required/><span className="field-help">Saved with this excerpt on your device so you can reopen the page. Avoid private or login-only links.</span></label><label>Text to remember<textarea value={quote} onChange={e=>setQuote(e.target.value)} placeholder="Paste the sentence or paragraph you want to keep." required maxLength={20000}/><span className="field-help">A short excerpt is easier to review and connect to your notes later.</span></label><div className="actions"><button className="primary" disabled={busy}>Save excerpt</button><button type="button" disabled={busy} onClick={()=>{setManual(false);setTitle('');setUrl('');setQuote('');}}>Cancel</button></div></form>}
          {!!ps.length&&<label className="search"><Search size={16}/><input aria-label="Search saved evidence" placeholder="Find in your evidence" value={search} onChange={e=>setSearch(e.target.value)}/></label>}
          <div className="source-list">{ps.filter(p=>(p.title+' '+p.quote).toLowerCase().includes(search.toLowerCase())).map(p=><article className="source" key={p.id}><div className="source-meta"><span>{sourceLabel(p.url)} · {p.captureKind==='ai-overview'?'AI-generated answer':p.captureKind==='search'?'Search snippets':'Saved webpage'}</span><span>{p.origin==='fixture'?'SYNTHETIC EXAMPLE':shortDate(p.capturedAt)}</span></div><h3><button className="source-title" onClick={()=>setInspected(p)}>{p.title}</button></h3><p className="source-preview">{p.quote.replace(/\s+/g,' ').slice(0,220)}{p.quote.length>220?'…':''}</p><details><summary>Read saved text</summary><blockquote>{p.quote}</blockquote></details><button className="text-button" onClick={()=>setInspected(p)}>Inspect saved evidence <ArrowUpRight size={14}/></button></article>)}</div>
          {!ps.length&&<div className="empty"><FileText size={26}/><h3>Your evidence starts here</h3><p>Save a passage worth coming back to. Its source and version stay attached.</p></div>}
          <details className="notes"><summary>Workspace notes & open questions</summary><label>Notes<textarea key={'n'+w.id} defaultValue={w.notes} onBlur={e=>void run(()=>updateWorkspace({notes:e.target.value}))}/></label><label>Unresolved questions<textarea key={'q'+w.id} defaultValue={w.questions} onBlur={e=>void run(()=>updateWorkspace({questions:e.target.value}))}/></label></details>
        </section>}
        {tab==='Evidence'&&<section className="view evidence-view"><details><summary>Saved statements and writing links (optional)</summary><div className="section-heading"><h2>Claims and evidence</h2><button className="text-button" onClick={()=>setClaimForm(!claimForm)}><Plus size={15}/>{claimForm?'Close form':'Link a statement'}</button></div><p className="helper">Connect a statement to the saved source it comes from and the paragraph that uses it. Later, compare it with new evidence to see what may need another look.</p>
          {claimForm&&<form className="form inset" onSubmit={e=>{e.preventDefault();void run(addClaim);}}>
            <h3>Link a statement to its source</h3>
            <p className="helper">This saves what a page or WebScraper result said. It does not confirm the statement is true.</p>
            <label htmlFor="verify-statement">What do you want to verify?</label>
            <input id="verify-statement" aria-describedby="verify-statement-help" value={claimText} onChange={e=>setClaimText(e.target.value)} placeholder="For example: What is HTML?" required/>
            <span id="verify-statement-help" className="field-help">A short question is fine. Choose a passage about the same topic.</span>
            <label htmlFor="verify-scope">Conditions or scope</label>
            <input id="verify-scope" aria-describedby="verify-scope-help" value={scope} onChange={e=>setScope(e.target.value)} placeholder="For example: on older phones, using less memory"/>
            <span id="verify-scope-help" className="field-help">Add the situation or limits that matter. Different conditions can change what a source means.</span>
            <label htmlFor="verify-passage">Where did you find this?</label>
            <select id="verify-passage" aria-describedby="verify-passage-help" required value={sourceId} onChange={e=>setSourceId(e.target.value)}>
              <option value="">Choose a saved page or WebScraper result</option>
              {ps.filter(isSavedWebSource).map(p=><option key={p.id} value={p.id}>{isWebScrapedResult(p)?'WebScraper result: ':''}{p.title} — {p.quote.replace(/\s+/g,' ').slice(0,100)}{p.quote.length>100?'…':''}</option>)}
            </select>
            <span id="verify-passage-help" className="field-help">Choose the passage that directly discusses your question. A WebScraper result records what was shown; compare it with another source before relying on it.</span>
            {sourceId&&(()=>{const source=ps.find(p=>p.id===sourceId);return source&&<aside className="notice" aria-live="polite"><strong>Selected passage</strong><p>{sharesTopicWords(claimText,source.quote+' '+source.title)?'This passage shares a topic word with your statement. That is only a relevance check, not proof.':'This saved passage does not appear to mention your statement. Choose another passage or save the specific text; a report summary is not the saved source excerpt.'}</p><blockquote>{source.quote.slice(0,700)}{source.quote.length>700?'…':''}</blockquote></aside>;})()}
            <label htmlFor="verify-paragraph">Draft paragraph</label>
            <textarea id="verify-paragraph" aria-describedby="verify-paragraph-help" value={paragraph} onChange={e=>setParagraph(e.target.value)} placeholder="Paste the paragraph where you use this statement." required/>
            <span id="verify-paragraph-help" className="field-help">A sentence or paragraph that uses this idea is enough.</span>
            <button className="primary" disabled={busy}>Save evidence link</button>
          </form>}
          {cs.map(c=>{const source=ps.find(p=>p.id===c.passageId);return <article className="claim" key={c.id}><div className="source-meta"><span>LINKED CLAIM</span><span>Draft revision {c.revision}</span></div><h3>{c.text}</h3><p className="helper">{c.scope||'Conditions not specified'}</p><p className="fine">{source&&isWebScrapedResult(source)?'What WebScraper captured':'Saved source passage'}</p>{source&&isWebScrapedResult(source)&&<p className="notice">This is a captured result, not an independent check. Compare it with another source below.</p>}<blockquote>{source?.quote.slice(0,350)||'Source unavailable'}</blockquote><button className="evidence-link" onClick={()=>source&&setInspected(source)}><GitBranch size={15}/>{source?.title||'Evidence unavailable'}<ArrowUpRight size={14}/></button><div className="draft"><span>CONNECTED DRAFT PARAGRAPH</span><p>{c.paragraph}</p></div></article>;})}
          {!cs.length&&<div className="empty"><GitBranch size={27}/><h3>Give your writing a source trail</h3><p>Link a saved passage to a claim and a paragraph in this supported draft editor.</p></div>}
        </details></section>}
        {tab==='Evidence'&&<section className="view evidence-review-view">
          <h2>Check a statement against another source</h2>
          <p className="helper">Choose what you found, write the statement you want to check, then select a second source. You do not need to create a note first.</p>
          <div className="form inset">
            <label htmlFor="compare-source">First, choose a saved result
              <select id="compare-source" value={compareSourceId} onChange={e=>{setCompareSourceId(e.target.value);setNewEvidence('');}}>
                <option value="">Choose a saved page or WebScraper result</option>
                {ps.filter(isSavedWebSource).map(p=><option key={p.id} value={p.id}>{isWebScrapedResult(p)?'WebScraper result: ':''}{p.title}</option>)}
              </select>
            </label>
            {originalEvidence&&isSavedWebSource(originalEvidence)&&<><label htmlFor="compare-text">What do you want to compare? Type it here
              <input id="compare-text" value={compareText} onChange={e=>setCompareText(e.target.value)} placeholder="For example: What is HTML?" />
            </label><span className="field-help">Ask a short question or write a statement. It needs to match the saved result.</span><div className="comparison-grid">
              <article className="comparison-source">
                <strong>{isWebScrapedResult(originalEvidence)?'What WebScraper captured':'Original saved page'}</strong>
                <h3>{originalEvidence.title}</h3>
                <p className="fine">{sourceLabel(originalEvidence.url)}</p>
                <blockquote>{originalEvidence.quote.slice(0,800)}</blockquote>
              </article>
              <article className="comparison-source comparison-source-independent">
                <strong>What another source says</strong>
                {!independentEvidence.length
                  ? <><p>Step 2: open a result from another website and save the passage you want to compare.</p>{compareText.trim()&&<a className="text-button source-search-link" href={`https://www.google.com/search?q=${encodeURIComponent(compareText.trim()+' primary source history')}`} target="_blank" rel="noreferrer">Search Google for another source <ArrowUpRight size={14}/></a>}<p className="fine">This opens Google and sends it the text above. Search results are leads, not proof. Open a page and save its relevant passage before comparing.</p></>
                  : <label>Choose another source
                    <select value={newEvidence} onChange={e=>setNewEvidence(e.target.value)}>
                      <option value="">Choose a source</option>
                      {independentEvidence.map(p=><option key={p.id} value={p.id}>{p.title} · {sourceLabel(p.url)}</option>)}
                    </select>
                  </label>}
                {comparisonEvidence&&<><h3>{comparisonEvidence.title}</h3><p className="fine">{sourceLabel(comparisonEvidence.url)}</p><blockquote>{comparisonEvidence.quote.slice(0,800)}</blockquote></>}
              </article>
            </div></>}
            {ps.length>0&&!ps.some(isSavedWebSource)&&<p className="notice" role="status">These are labelled demo examples, not real webpages, so they cannot be checked by the backend. Save passages from real webpages first.</p>}
            {!originalEvidence&&<p className="field-help">Choose a saved page or WebScraper result to get started. Then type what you want to compare.</p>}
            {originalEvidence&&isWebScrapedResult(originalEvidence)&&<p className="notice" role="status">WebScraper shows what appeared on the page. It does not confirm that information is correct.</p>}
            {originalEvidence&&compareText.trim()&&!compareMatchesOriginal&&<p className="notice" role="status">The question does not match the saved first passage. Select or save a passage that directly discusses this question; the AI summary beside your browser is not automatically used.</p>}
            {originalEvidence&&compareMatchesOriginal&&!comparisonEvidence&&<p className="notice" role="status">First passage selected. Still needed: save a relevant passage from a different website and choose it in “What another source says.”</p>}
            <details><summary>Write my own comparison</summary>
              <label>What difference did you notice?<textarea value={rationale} onChange={e=>setRationale(e.target.value)} placeholder="For example: The sources describe different conditions."/></label>
              <label>Type of difference<select value={kind} onChange={e=>setKind(e.target.value as Finding['status'])}>{['needs_qualification','different_conditions','possible_conflict','insufficient_evidence'].map(s=><option key={s}>{s.replace(/_/g,' ')}</option>)}</select></label>
              <button disabled={busy||!originalEvidence||!compareMatchesOriginal||!independentEvidence.some(p=>p.id===newEvidence)||!rationale.trim()} onClick={()=>void run(()=>addFinding(false))}>Save my comparison</button>
            </details>
            <button className="primary" disabled={busy||!originalEvidence||!compareMatchesOriginal||!independentEvidence.some(p=>p.id===newEvidence)} onClick={()=>void run(()=>addFinding(true))}><Search size={15}/>{busy?'Comparing…':'Compare with AI'}</button>
            <p className="fine">The AI compares only the two saved passages shown above. It does not search for sources or decide which source is right.</p>
          </div>
          {fs.slice().reverse().map(f=><article className="finding" key={f.id}><div className="source-meta"><span>{f.mode==='ai'?'AI SUGGESTION':'MANUAL REVIEW'}</span><span className={'status '+f.decision}>{f.decision}</span></div><h3>{f.status.replace(/_/g,' ')}</h3><p>{f.rationale}</p><div className="evidence-pair">{f.passageIds.map(id=>{const p=ps.find(p=>p.id===id);return p&&<button key={id} onClick={()=>setInspected(p)}><FileText size={14}/>{p.title}<ArrowUpRight size={14}/></button>;})}</div><p className="fine">Affected paragraph: {cs.find(c=>c.id===f.claimId)?.paragraph||'Unavailable'}</p>{f.decision==='pending'&&<><label>Review and write your revised paragraph<textarea value={revisions[f.id]??f.suggestedText} placeholder="Your writing changes only when you approve." onChange={e=>setRevisions({...revisions,[f.id]:e.target.value})}/></label><div className="actions"><button className="primary" disabled={busy} onClick={()=>void run(async()=>{await review(f.id,'accepted',revisions[f.id]??f.suggestedText);setMessage('Revision approved. The original is preserved in Timeline.');})}><Check size={15}/>Approve revision</button><button disabled={busy} onClick={()=>void run(()=>review(f.id,'rejected',''))}>Dismiss finding</button></div></>}</article>)}
        </section>}
        {tab==='Timeline'&&<section className="view"><h2>The evolution of your work</h2><p className="helper">A chronological trail of saved searches, sources and reviewed decisions. It records saved activity, not what you understood.</p>{[...ps.map(p=>({id:p.id,time:p.capturedAt,title:p.searchQuery?'Search captured':'Source saved',body:p.searchQuery?'Searched: '+p.searchQuery:p.title})),...cs.filter(c=>c.createdAt).map(c=>({id:c.id,time:c.createdAt!,title:'Note linked to evidence',body:c.text})),...watchedChanges.filter(c=>c.workspaceId===active).map(c=>({id:c.id,time:c.at,title:'Watched source changed',body:sourceLabel(c.url)})),...es.map(e=>({id:e.id,time:e.createdAt,title:e.decision==='accepted'?'Draft revision approved':'Finding dismissed',body:e.decision==='accepted'?`Before: ${e.before}\n\nAfter: ${e.after}`:'The draft was left unchanged.'}))].sort((a,b)=>b.time.localeCompare(a.time)).map(e=><article className="timeline" key={e.id}><History size={16}/><div><time>{shortDate(e.time)}</time><h3>{e.title}</h3><p>{e.body}</p></div></article>)}</section>}
      </>}
      {inspected&&<section id="evidence-inspector" tabIndex={-1} className="inspector" aria-label="Saved passage"><div className="section-heading"><h2>Saved evidence</h2><button className="icon" aria-label="Close evidence" onClick={()=>setInspected(undefined)}><X size={18}/></button></div><h3>{inspected.title}</h3>{inspected.origin==='fixture'&&<p className="notice">Synthetic example — not a real study.</p>}<blockquote>{inspected.prefix}<mark>{inspected.quote}</mark>{inspected.suffix}</blockquote><form className="form inset" onSubmit={e=>{e.preventDefault();void run(linkNote);}}><h3>Connect this evidence to your note</h3><p className="helper">Write your own conclusion. The saved passage stays attached so you can review it later.</p><label>Your note<textarea value={quickNote} onChange={e=>setQuickNote(e.target.value)} placeholder="What does this source tell you?" required maxLength={4000}/></label><button className="primary" disabled={busy||!quickNote.trim()}>Save linked note</button></form><dl><dt>Captured</dt><dd>{shortDate(inspected.capturedAt)}</dd><dt>Version</dt><dd className="version">{inspected.version}</dd><dt>Source domain</dt><dd>{sourceLabel(inspected.url)}</dd></dl><button className="primary" onClick={()=>openSource(inspected)}>Open original page <ArrowUpRight size={15}/></button><p className="fine">The saved passage is preserved even if the live page changes. The full address stays hidden here to avoid displaying search or tracking parameters.</p></section>}
      {w&&<RagFloatingWidget key={'rag-'+w.id} workspace={w} passages={ps} inspect={setInspected}/>}
      </div>
    </main><footer><BackendStatus/><span><span className="connection-dot"/>Local-first workspace</span><button className="text-button" disabled={busy} onClick={()=>void run(resetData)}>Reset all data</button></footer>
  </div>;
}
createRoot(document.getElementById('root')!).render(<App/>);
