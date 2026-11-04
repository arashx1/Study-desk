import React, {useEffect, useState} from 'react';
export const BACKEND='http://127.0.0.1:8765';
export function connectionError(error: unknown) {
  return error instanceof TypeError ? 'Cannot reach the local backend. Run scripts/start_backend.ps1, then retry. Your saved research is safe.' : error instanceof Error ? error.message : String(error);
}
export function BackendStatus() {
  const [status,setStatus]=useState('Checking backend…');
  async function check(){try{const r=await fetch(BACKEND+'/health',{signal:AbortSignal.timeout(3000)});if(!r.ok)throw new Error();const d=await r.json();setStatus(d.aiConfigured?'Backend connected · AI configured':'Backend connected · AI key needed');}catch{setStatus('Backend offline · start scripts/start_backend.ps1');}}
  useEffect(()=>{void check();const timer=setInterval(()=>void check(),30000);return()=>clearInterval(timer);},[]);
  return React.createElement('button',{className:'text-button',onClick:()=>void check(),title:'Check backend connection'},status);
}
