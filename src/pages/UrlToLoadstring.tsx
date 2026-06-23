import { useState, useMemo, useCallback, useEffect } from 'react';
import CodeBlock from '../components/CodeBlock';

type WrapperStyle = 'HttpGet' | 'HttpGetAsync' | 'plain';

const WRAPPERS: Record<WrapperStyle, (url: string) => string> = {
  HttpGet: (url) => `loadstring(game:HttpGet('${url}'))()`,
  HttpGetAsync: (url) => `loadstring(game:HttpGetAsync("${url}"))()`,
  plain: (url) => `loadstring('${url}')()`,
};

const WRAPPER_LABELS: Record<WrapperStyle, string> = {
  HttpGet: 'game:HttpGet',
  HttpGetAsync: 'game:HttpGetAsync',
  plain: 'Plain loadstring',
};

const WRAPPER_DESCRIPTIONS: Record<WrapperStyle, string> = {
  HttpGet: 'Most common. Works in all modern executors. Recommended default.',
  HttpGetAsync: 'Async variant. Yields until the HTTP request completes.',
  plain: 'Bare loadstring without an HTTP call. Only works for local file:// paths.',
};

function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const blobMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/(.+)$/);
  if (blobMatch) {
    const [, owner, repo, path] = blobMatch;
    return `https://raw.githubusercontent.com/${owner}/${repo}/${path}`;
  }
  return trimmed;
}

function isLikelyLuaUrl(url: string): boolean {
  return /\.(lua|luau)(\?|$)/i.test(url);
}

function isValidUrl(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

export default function UrlToLoadstring() {
  const [input, setInput] = useState('');
  const [wrapper, setWrapper] = useState<WrapperStyle>('HttpGet');
  const [copied, setCopied] = useState(false);
  const [verifyState, setVerifyState] = useState<
    { status: 'idle' } | { status: 'checking' } | { status: 'ok'; size: number } | { status: 'error'; message: string }
  >({ status: 'idle' });

  const normalized = useMemo(() => normalizeUrl(input), [input]);
  const output = useMemo(() => normalized ? WRAPPERS[wrapper](normalized) : '', [normalized, wrapper]);

  const showWarning = useMemo(() => {
    if (!normalized) return null;
    if (!isValidUrl(normalized)) return "That doesn't look like a valid URL.";
    if (!isLikelyLuaUrl(normalized)) return "URL doesn't end in .lua or .luau — make sure it points to a Lua source file.";
    return null;
  }, [normalized]);

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(output);
      } else {
        const ta = document.createElement('textarea');
        ta.value = output;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch { /* swallow */ }
  }, [output]);

  const handleVerify = useCallback(async () => {
    if (!normalized || !isValidUrl(normalized)) return;
    setVerifyState({ status: 'checking' });
    try {
      const res = await fetch(normalized);
      if (!res.ok) { setVerifyState({ status: 'error', message: `HTTP ${res.status}` }); return; }
      const text = await res.text();
      const luaTokens = ['function', 'local', '--', 'loadstring', 'return', 'end'];
      if (text.length < 100) setVerifyState({ status: 'error', message: `Only ${text.length} bytes — likely an error page.` });
      else if (!luaTokens.some((t) => text.includes(t))) setVerifyState({ status: 'error', message: "Response doesn't look like Lua source." });
      else setVerifyState({ status: 'ok', size: text.length });
    } catch (e) {
      setVerifyState({ status: 'error', message: e instanceof Error ? e.message : 'Network error (may be CORS).' });
    }
  }, [normalized]);

  useEffect(() => { setVerifyState({ status: 'idle' }); }, [normalized]);

  const examples = [
    { label: 'Raw GitHub', url: 'https://raw.githubusercontent.com/OrionLibrary/Orion/main/source.lua' },
    { label: 'GitHub blob', url: 'https://github.com/EdgeIY/infiniteyield/blob/master/source' },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10 p-4">
        <h2 className="text-lg font-bold text-slate-50">URL to Loadstring</h2>
        <p className="mt-1 text-sm text-slate-300">Paste a raw Lua file URL and get a ready-to-paste loadstring wrapper. Handles GitHub blob → raw conversion automatically.</p>
      </section>

      <section className="card p-4">
        <label htmlFor="url-input" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">Source URL</label>
        <input id="url-input" type="url" inputMode="url" value={input} onChange={(e) => setInput(e.target.value)} placeholder="https://raw.githubusercontent.com/owner/repo/main/script.lua" className="input font-mono text-xs" autoComplete="off" spellCheck={false} />
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Try:</span>
          {examples.map((ex) => (
            <button key={ex.label} type="button" onClick={() => setInput(ex.url)} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:border-neon-cyan/40 hover:text-neon-cyan">{ex.label}</button>
          ))}
        </div>
        {input && normalized !== input.trim() && (
          <div className="mt-3 rounded-lg border border-neon-purple/20 bg-neon-purple/5 p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-neon-purple">Normalized</p>
            <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{normalized}</p>
            <p className="mt-1 text-[10px] text-slate-500">GitHub blob URL converted to raw.githubusercontent.com</p>
          </div>
        )}
        {showWarning && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            {showWarning}
          </p>
        )}
      </section>

      <section className="card p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Wrapper style</h3>
        <div className="space-y-2">
          {(Object.keys(WRAPPERS) as WrapperStyle[]).map((key) => (
            <button key={key} type="button" onClick={() => setWrapper(key)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${wrapper === key ? 'border-neon-cyan/50 bg-neon-cyan/10' : 'border-white/5 bg-void-800/50 hover:border-white/15'}`} aria-pressed={wrapper === key}>
              <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${wrapper === key ? 'border-neon-cyan bg-neon-cyan' : 'border-slate-500'}`} aria-hidden>
                {wrapper === key && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a0a0f" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-mono text-sm font-semibold ${wrapper === key ? 'text-neon-cyan' : 'text-slate-200'}`}>{WRAPPER_LABELS[key]}</p>
                <p className="mt-0.5 text-xs text-slate-500">{WRAPPER_DESCRIPTIONS[key]}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {output && (
        <section className="card p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Generated loadstring</h3>
            <button type="button" onClick={handleVerify} disabled={verifyState.status === 'checking' || !isValidUrl(normalized)} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold text-slate-400 transition-colors hover:border-neon-purple/40 hover:text-neon-purple disabled:opacity-40">
              {verifyState.status === 'checking' ? (<><div className="h-2.5 w-2.5 animate-spin rounded-full border border-neon-purple/30 border-t-neon-purple" />Checking…</>) : (<><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>Verify URL</>)}
            </button>
          </div>
          <CodeBlock code={output} language="luau" caption="Ready to paste" />
          {verifyState.status === 'ok' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-neon-green">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>
              Verified — returns {verifyState.size.toLocaleString()} bytes of Lua source.
            </p>
          )}
          {verifyState.status === 'error' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-neon-pink">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              {verifyState.message}
            </p>
          )}
          <button type="button" onClick={handleCopy} className={`btn-neon mt-3 w-full ${copied ? 'btn-success' : ''}`}>
            {copied ? (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12" /></svg>Copied!</>) : (<><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>Copy Loadstring</>)}
          </button>
        </section>
      )}

      {!output && (
        <div className="card p-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
          </div>
          <p className="text-sm text-slate-400">Paste a Lua file URL above to generate a loadstring.</p>
        </div>
      )}
    </div>
  );
}
