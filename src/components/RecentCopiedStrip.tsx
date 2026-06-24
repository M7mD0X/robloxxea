import { useState, useCallback } from 'react';
import { useToolStorage } from '../hooks/useToolStorage';
import type { Tool } from './ToolCard';

/**
 * RecentCopiedStrip — a horizontal-scroll row of compact cards showing the
 * user's most recently copied tools. Tapping a card re-copies its loadstring
 * (with the same "Copied!" flash feedback as the full ToolCard).
 *
 * Only renders if the user has at least 1 recent tool. Includes a "Clear"
 * button so users can wipe their history.
 *
 * The strip is shared across both tabs — copying a tool on Tab 2 makes it
 * appear in the strip on Tab 1 too, because `useToolStorage` is app-wide.
 */
export default function RecentCopiedStrip() {
  const { recent, addRecent, clearRecent } = useToolStorage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleQuickCopy = useCallback(
    async (tool: Tool) => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(tool.loadstring);
        } else {
          const ta = document.createElement('textarea');
          ta.value = tool.loadstring;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
        }
        setCopiedId(tool.id);
        addRecent(tool); // bump to top of recent
        window.setTimeout(() => setCopiedId(null), 1200);
      } catch {
        // swallow — the full ToolCard has better error handling
      }
    },
    [addRecent]
  );

  if (recent.length === 0) return null;

  return (
    <section className="card p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Recently copied
        </h2>
        <button
          type="button"
          onClick={clearRecent}
          className="text-[10px] font-medium uppercase tracking-wider text-slate-500 transition-colors hover:text-neon-pink"
          aria-label="Clear recently copied history"
        >
          Clear
        </button>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {recent.map((entry) => {
          const tool = entry.tool;
          const tileColor = tool.iconColor ?? '#22d3ee';
          const isCopied = copiedId === tool.id;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => handleQuickCopy(tool)}
              className={`group flex w-20 shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-all active:scale-95 ${
                isCopied
                  ? 'border-neon-green/50 bg-neon-green/10'
                  : 'border-white/5 bg-void-800/60 hover:border-white/15'
              }`}
              aria-label={`Re-copy ${tool.name} loadstring`}
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 font-mono text-[10px] font-bold"
                style={{
                  backgroundColor: `${tileColor}1a`,
                  color: tileColor,
                }}
                aria-hidden
              >
                {(tool.icon ?? tool.name.slice(0, 2)).toUpperCase()}
              </div>
              <span className="line-clamp-1 w-full text-center text-[10px] font-medium text-slate-300">
                {isCopied ? '✓ Copied' : tool.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
