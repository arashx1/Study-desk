import React, { useState } from 'react';
import { Sparkles, X, Send, ArrowUpRight, BookOpen, Bot } from 'lucide-react';
import { retrieve } from './retrieve';
import { hasEnoughTopicWords } from './textQuality';
import type { Workspace, Passage } from './types';

type Turn = { question: string; answer: string; citations: string[]; excerpts?:Record<string,string>; at: string };

export default function RagFloatingWidget({
  workspace: w,
  passages,
  inspect
}: {
  workspace: Workspace;
  passages: Passage[];
  inspect: (p: Passage) => void;
}) {
  const key = 'reentry-answers-' + w.id;
  const [isOpen, setIsOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  });
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [retrieved, setRetrieved] = useState<Passage[]>([]);

  async function ask(qText?: string) {
    const q = (qText || question).trim();
    if (!q) return;
    if (!hasEnoughTopicWords(q)) {
      setError('Add a topic word to your question, then try again.');
      return;
    }
    setBusy(true);
    setError('');
    setRetrieved([]);
    try {
      const evidence = retrieve(q, passages);
      if (!evidence.length) {
        throw new Error('No matching scraped passages found yet. Browse more pages or try another query.');
      }
      setRetrieved(evidence);

      const response = await fetch('http://127.0.0.1:8765/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: w.id, question: q, passages: evidence }),
        signal: AbortSignal.timeout(45000)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error?.message || 'RAG answer unavailable');
      if (!Array.isArray(result.citations) || result.citations.some((id:string)=>!evidence.some(p=>p.id===id))) throw new Error('The answer referenced unavailable evidence.');

      const next = [
        ...turns,
        { question: q, answer: result.answer, citations: result.citations || [], excerpts:Object.fromEntries(evidence.map(p=>[p.id,p.quote])), at: new Date().toISOString()}
      ].slice(-25);

      setTurns(next);
      localStorage.setItem(key, JSON.stringify(next));
      setQuestion('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const promptSuggestions = [
    `What do the sources say about ${w.name}?`,
    `Summarize the key evidence collected`
  ];

  return (
    <div className="duo-floating-rag-container">
      {/* Floating Popover Card */}
      {isOpen && (
        <div className="duo-rag-panel" role="dialog" aria-label="RAG AI Research Assistant">
          <div className="duo-panel-header">
            <div className="duo-panel-title">
              <Sparkles size={18} style={{ color: 'var(--duo-blue)' }} />
              <div>
                <strong>Ask saved research</strong>
                <span className="duo-rag-subtitle">{passages.length} scraped sources</span>
              </div>
            </div>
            <button
              className="duo-close-btn"
              aria-label="Close assistant"
              onClick={() => setIsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="duo-rag-body">
            {/* Recent Q&A Turn History */}
            <div className="duo-rag-chat-history">
              {turns.length === 0 ? (
                <div className="duo-rag-welcome">
                  <Bot size={28} style={{ color: 'var(--duo-blue)', marginBottom: '8px' }} />
                  <p><strong>Ask your scraped research!</strong></p>
                  <p className="helper">Answers use retrieved saved page text. A saved overview is not independently verified.</p>
                </div>
              ) : (
                turns.slice(-6).map((t, i) => (
                  <div className="duo-rag-bubble-group" key={t.at + i}>
                    <div className="duo-rag-user-msg">{t.question}</div>
                    <div className="duo-rag-ai-msg">
                      <p>{t.answer}</p>
                      {t.citations.length > 0 && (
                        <div className="duo-rag-citations">
                          <span className="duo-citation-label">Evidence:</span>
                          {t.citations.map(cid => {
                            const p = passages.find(x => x.id === cid);
                            return p ? (
                              <button
                                key={cid}
                                className="duo-citation-chip"
                                onClick={() => inspect({...p,quote:t.excerpts?.[cid]||p.quote,prefix:t.excerpts?.[cid]?'Retrieved excerpt: ':p.prefix,suffix:t.excerpts?.[cid]?'':p.suffix})}
                                title={p.title}
                              >
                                <BookOpen size={11} /> {p.title.slice(0, 30)}...
                              </button>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Suggestions */}
            {turns.length === 0 && (
              <div className="duo-rag-prompts">
                {promptSuggestions.map(s => (
                  <button
                    key={s}
                    className="duo-rag-prompt-btn"
                    onClick={() => {
                      setQuestion(s);
                      void ask(s);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && <div className="duo-panel-notice duo-notice-error">{error}{retrieved.length>0&&<div><strong>Matching saved passages</strong>{retrieved.map(p=><button key={p.id} type="button" onClick={()=>inspect(p)}>{p.title}</button>)}</div>}</div>}

            {/* Input Form */}
            <form
              className="duo-rag-form"
              onSubmit={e => {
                e.preventDefault();
                void ask();
              }}
            >
              <input
                className="duo-rag-input"
                placeholder={passages.length ? "Ask a question about your sources..." : "Browse pages first to enable RAG..."}
                value={question}
                onChange={e => setQuestion(e.target.value)}
                disabled={busy}
              />
              <button
                type="submit"
                className="duo-btn duo-btn-blue duo-rag-send-btn"
                disabled={busy || !question.trim() || !passages.length}
                aria-label="Send question to RAG"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button at Bottom-Right */}
      <button
        className="duo-fab duo-fab-rag"
        aria-label="Open Research RAG AI Assistant"
        title="✨ Ask RAG AI (Grounded in your scraped pages)"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Sparkles size={22} className="duo-fab-sparkle" />
        {passages.length > 0 && (
          <span className="duo-fab-badge">{passages.length}</span>
        )}
      </button>
    </div>
  );
}
