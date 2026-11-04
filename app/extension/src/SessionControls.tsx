import React, { useEffect, useState } from 'react';
import { inExtension } from './browser';
import { all } from './db';
import { Radio, Pause, Play, CheckCircle2, ChevronDown, ChevronUp, Plus, ExternalLink } from 'lucide-react';

export default function SessionControls({
  workspaceId,
  onSwitch,
  onFinish
}: {
  workspaceId: string;
  onSwitch: (id: string) => void;
  onFinish: () => void;
}) {
  const [session, setSession] = useState<any>();
  const [tabs, setTabs] = useState<chrome.tabs.Tab[]>([]);
  const [notice, setNotice] = useState('');
  const [showTabs, setShowTabs] = useState(false);
  const [statuses, setStatuses] = useState<Record<string,{sessionId:string;status:string;message:string;url?:string}>>({});

  async function load() {
    if (!inExtension) return;
    const d = await chrome.storage.local.get(['autoSession', 'sessionError', 'captureStatuses']);
    setSession(d.autoSession);
    setStatuses(d.captureStatuses||{});
    if (d.sessionError) setNotice(d.sessionError);
    setTabs(await chrome.tabs.query({}));
  }

  useEffect(() => {
    if (!inExtension) return;
    void chrome.runtime
      .sendMessage({ type: 'session-command', action: 'sync', workspaceId })
      .then(r => {
        if (r?.error) setNotice(r.error);
        return load();
      })
      .catch(e => setNotice(String(e)));
    const listener = () => {
      void load();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [workspaceId]);

  async function command(action: string, tabId?: number) {
    try {
      if (!inExtension) throw new Error('Automatic sessions require the installed browser extension.');
      if (action === 'start' || action === 'start-here') {
        const allowed = await chrome.permissions.request({ origins: ['http://*/*', 'https://*/*'] });
        if (!allowed) throw new Error('Automatic capture permission was declined. Manual capture remains available.');
      }
      if (action === 'start-here') {
        const { autoSession: old } = await chrome.storage.local.get('autoSession');
        if (old) {
          const result = await chrome.runtime.sendMessage({
            type: 'session-command',
            action: 'finish',
            workspaceId: old.workspaceId
          });
          if (result?.error) throw new Error(result.error);
          const oldKey = 'reentry-session-' + old.workspaceId;
          const saved = JSON.parse(localStorage.getItem(oldKey) || 'null');
          if (saved) localStorage.setItem(oldKey, JSON.stringify({ ...saved, endedAt: new Date().toISOString() }));
        }
        action = 'start';
      }
      const response = await chrome.runtime.sendMessage({ type: 'session-command', action, workspaceId, tabId });
      if (response?.error) throw new Error(response.error);
      const key = 'reentry-session-' + workspaceId;
      if (action === 'start') {
        const prior = localStorage.getItem(key);
        if (prior) localStorage.setItem(key + ':archive:' + Date.now(), prior);
        localStorage.setItem(
          key,
          JSON.stringify({
            id: (await chrome.storage.local.get('autoSession')).autoSession?.id,
            startedAt: new Date().toISOString(),
            baseline: (await all('passages')).filter(p => p.workspaceId === workspaceId).map(p => p.id)
          })
        );
      }
      if (action === 'finish') {
        const saved = JSON.parse(localStorage.getItem(key) || 'null');
        if (saved) {localStorage.setItem(key, JSON.stringify({ ...saved, endedAt: new Date().toISOString() }));if(saved.id)localStorage.setItem('reentry-auto-report',saved.id);}
      }
      window.dispatchEvent(new Event('reentry-session-change'));
      setNotice(action === 'finish' ? 'Session finished! Your research report is ready.' : 'Session updated.');
      await load();
      if (action === 'finish') onFinish();
    } catch (e) {
      setNotice(
        String(e).includes('Receiving end does not exist')
          ? "Extension worker unavailable. Reload Scholar's Desk in chrome://extensions."
          : String(e)
      );
    }
  }

  const own = session?.workspaceId === workspaceId;
  const isRecording = own && !session?.paused;
  const isPaused = own && session?.paused;
  const tabCount = own && session?.tabIds ? session.tabIds.length : 0;

  return (
    <section className="duo-card duo-session-card">
      <div className="duo-session-header">
        <div className="duo-session-status">
          <span className={`duo-dot ${isRecording ? 'recording' : isPaused ? 'paused' : ''}`} />
          <strong>
            {own
              ? isPaused
                ? 'Session Paused'
                : 'Saving Your Browsing'
              : 'Web Scraping & Session'}
          </strong>
          {own && (
            <span className="duo-tab-badge">
              {tabCount} {tabCount === 1 ? 'tab' : 'tabs'}
            </span>
          )}
        </div>
        <div className="duo-session-buttons">
          {!session ? (
            <button className="duo-btn duo-btn-primary" onClick={() => void command('start')}>
              <Play size={14} /> START RECORDING
            </button>
          ) : own ? (
            <>
              <button className="duo-btn duo-btn-secondary" onClick={() => void command('pause')}>
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button className="duo-btn duo-btn-primary" onClick={() => void command('finish')}>
                <CheckCircle2 size={14} /> FINISH & REPORT
              </button>
            </>
          ) : (
            <>
              <button className="duo-btn duo-btn-primary" onClick={() => void command('start-here')}>
                Start Here
              </button>
              <button className="duo-btn duo-btn-secondary" onClick={() => onSwitch(session.workspaceId)}>
                View Active Session
              </button>
            </>
          )}
        </div>
      </div>

      {own && (
        <div className="duo-tabs-section">
          <button
            type="button"
            className="duo-tabs-toggle"
            onClick={() => setShowTabs(!showTabs)}
          >
            <span>Tracked browser tabs ({tabCount})</span>
            {showTabs ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showTabs && (
            <div className="duo-tabs-list">
              {!session.tabIds.includes(
                tabs.find(t => t.active && t.windowId === session.windowId)?.id
              ) && (
                <button
                  className="duo-btn duo-btn-small"
                  style={{ marginBottom: '8px' }}
                  onClick={() => void command('include')}
                >
                  + Add Current Tab to Session
                </button>
              )}
              {session.tabIds.map((id: number) => {
                const tab = tabs.find(t => t.id === id);
                return (
                  <div className="duo-tab-item" key={id}>
                    <div><span title={tab?.title || ''}>{tab?.title || 'Closed tab'}</span>{statuses[String(id)]?.sessionId===session.id&&<div className="fine" role="status">{statuses[String(id)].url&&tab?.url!==statuses[String(id)].url?'Waiting for current page':statuses[String(id)].message}</div>}</div>
                    <button
                      className="duo-btn-exclude"
                      title="Exclude tab from scraping"
                      onClick={() => void command('exclude', id)}
                    >
                      Exclude
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {notice && <div className="duo-panel-notice" style={{ marginTop: '10px' }}>{notice}</div>}
    </section>
  );
}
