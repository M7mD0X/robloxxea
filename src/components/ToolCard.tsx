import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Tool {
  id: string;
  name: string;
  author: string;
  category: string;
  description: string;
  loadstring: string;
  repo?: string;
  icon?: string;
  iconColor?: string;
  tags?: string[];
  featured?: boolean;
  /** True when the loadstring has been HTTP-verified to return real Lua source. */
  verified?: boolean;
  /** ISO date of the last verification check. */
  lastVerified?: string;
}

interface ToolCardProps {
  tool: Tool;
  /** Show a "Featured" chip in the metadata row. */
  featured?: boolean;
  /** Optional tap handler that fires after a successful copy. */
  onCopied?: (tool: Tool) => void;
  /** Whether this tool is currently favorited by the user. */
  isFavorite?: boolean;
  /** Toggle the favorite state. */
  onToggleFavorite?: (id: string) => void;
}

/**
 * Reusable ToolCard — renders a mobile-optimized list item with:
 *  - A square icon tile (letter avatar fallback if `icon` is just initials)
 *  - Tool name, author, category chip, verified badge, featured chip
 *  - A star button (top-right) to favorite/unfavorite the tool
 *  - Concise description
 *  - A prominent "Copy Loadstring" button using the modern Clipboard API,
 *    with a visible success state ("Copied!") that auto-reverts after 1.5s.
 */
export default function ToolCard({ tool, featured, onCopied, isFavorite, onToggleFavorite }: ToolCardProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Navigate to the tool detail page. Passes the tool via router state so
  // the detail page doesn't need to refetch.
  const goToDetail = useCallback(() => {
    navigate(`/tool/${tool.id}`, { state: { tool } });
  }, [navigate, tool]);

  const handleCopy = useCallback(async () => {
    const text = tool.loadstring;
    try {
      // Modern Web Clipboard API — preferred path
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts (older mobile browsers)
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        if (!document.execCommand('copy')) {
          throw new Error('execCommand copy failed');
        }
        document.body.removeChild(ta);
      }
      setCopied(true);
      setError(null);
      onCopied?.(tool);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      setError('Copy failed — long-press to select manually.');
      window.setTimeout(() => setError(null), 2500);
    }
  }, [tool, onCopied]);

  const tileColor = tool.iconColor ?? '#22d3ee';
  const initials = (tool.icon ?? tool.name.slice(0, 2)).toUpperCase();

  return (
    <article className="card relative overflow-hidden p-4 tap-highlight-none">
      {/* Favorite star — top-right corner */}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(tool.id)}
          className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all active:scale-90 ${
            isFavorite
              ? 'border-amber-400/50 bg-amber-400/15 text-amber-400 shadow-[0_0_12px_-2px_rgba(251,191,36,0.5)]'
              : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300'
          }`}
          aria-label={isFavorite ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
          aria-pressed={isFavorite}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      )}

      {/* Clickable header — navigates to tool detail page.
          The star button is absolutely positioned above this with z-10,
          so taps on the star don't reach this handler. */}
      <button
        type="button"
        onClick={goToDetail}
        className="flex w-full items-start gap-3 text-left"
        aria-label={`View details for ${tool.name}`}
      >
        {/* Icon tile */}
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 font-mono text-sm font-bold"
          style={{
            backgroundColor: `${tileColor}1a`,
            color: tileColor,
            boxShadow: `0 0 18px -6px ${tileColor}66`
          }}
          aria-hidden
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-50">{tool.name}</h3>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>by {tool.author}</span>
            <span className="text-slate-600">•</span>
            <span className="chip">{tool.category}</span>
            {featured && (
              <span className="inline-flex items-center gap-0.5 rounded-full border border-neon-cyan/40 bg-neon-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-neon-cyan">
                ★ Featured
              </span>
            )}
            {tool.verified === true && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full border border-neon-green/40 bg-neon-green/10 px-2 py-0.5 text-[10px] font-semibold text-neon-green"
                title={`Loadstring verified${tool.lastVerified ? ` on ${tool.lastVerified}` : ''}`}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Verified
              </span>
            )}
            {tool.verified === false && (
              <span
                className="inline-flex items-center gap-0.5 rounded-full border border-neon-pink/40 bg-neon-pink/10 px-2 py-0.5 text-[10px] font-semibold text-neon-pink"
                title="Loadstring has not been verified — test before relying on it."
              >
                Unverified
              </span>
            )}
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={goToDetail}
        className="mt-3 block w-full text-left"
        aria-label={`View details for ${tool.name}`}
      >
        <p className="text-sm leading-relaxed text-slate-300">{tool.description}</p>
      </button>

      {tool.tags && tool.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tool.tags.slice(0, 5).map((t) => (
            <span key={t} className="chip">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Loadstring preview */}
      <pre className="mt-3 overflow-x-auto rounded-lg border border-white/5 bg-void-900/80 p-2.5 font-mono text-[11px] leading-relaxed text-slate-400">
        <code className="whitespace-pre">{tool.loadstring}</code>
      </pre>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={`btn-neon flex-1 ${copied ? 'btn-success' : ''}`}
          aria-label={`Copy loadstring for ${tool.name}`}
        >
          {copied ? (
            <>
              <CheckIcon /> Copied!
            </>
          ) : (
            <>
              <CopyIcon /> Copy Loadstring
            </>
          )}
        </button>

        {tool.repo && (
          <a
            href={tool.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon-purple px-3"
            aria-label={`Open ${tool.name} repository`}
          >
            <ExternalLinkIcon />
          </a>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-neon-pink" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}

/* --- Inline SVG icons (no external icon dep required) --- */
function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
