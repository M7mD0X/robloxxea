import { useEffect, useState, useMemo } from 'react';
import ToolCard, { type Tool } from '../components/ToolCard';
import communityData from '../data/communityTools.json';

type CommunityPayload = { tools: Tool[] };

/**
 * Tab 2 — Community Tools (Auto-Updating)
 *
 * Data source: an external JSON feed. The URL is configurable via
 * VITE_COMMUNITY_TOOLS_URL; otherwise we fetch the bundled copy as a fallback
 * so the page is always populated during development and offline.
 *
 * The feed shape is identical to mainTools.json, so the same ToolCard renders
 * both. The page adds a debounced search box that filters by name, author,
 * category, and tags.
 */

// Default feed URL — the live robloxxea-data repo. Overridable via
// VITE_COMMUNITY_TOOLS_URL for forks / testing.
const DEFAULT_FEED_URL =
  'https://raw.githubusercontent.com/M7mD0X/robloxxea-data/main/communityTools.json';

const FEED_URL =
  (import.meta.env.VITE_COMMUNITY_TOOLS_URL as string | undefined) ?? DEFAULT_FEED_URL;

export default function CommunityTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Always attempt the network fetch — that's the "auto-updating" promise.
        const res = await fetch(FEED_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: CommunityPayload = await res.json();
        if (!cancelled) {
          setTools(data.tools);
          setLastUpdated(new Date());
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to fetch community feed.');
          // Fallback to bundled sample so the UX never shows an empty page.
          setTools((communityData as CommunityPayload).tools);
          setLastUpdated(new Date());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced search — 200ms is enough to feel instant without thrashing renders.
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const filtered = useMemo(() => {
    if (!debouncedQuery) return tools;
    const q = debouncedQuery;
    return tools.filter((t) => {
      const haystack = [
        t.name,
        t.author,
        t.category,
        t.description,
        ...(t.tags ?? [])
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [tools, debouncedQuery]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-purple/30 border-t-neon-purple" />
          <span className="font-mono text-xs uppercase tracking-widest">Fetching community feed…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-void-700/40 to-neon-cyan/10 p-4">
        <h2 className="text-lg font-bold text-slate-50">Community Library</h2>
        <p className="mt-1 text-sm text-slate-300">
          Auto-updating feed of community-published scripts. {tools.length} tools indexed.
        </p>
        {lastUpdated && (
          <p className="mt-1 text-[11px] font-mono text-slate-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        <div className="mt-3 relative">
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, author, tag…"
            className="input pl-10"
            aria-label="Search community tools"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 p-3 text-xs text-neon-pink">
          Couldn't reach the live feed — showing bundled sample data. ({error})
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-400">
          No tools match <span className="font-mono text-neon-cyan">"{query}"</span>.
          Try a different keyword.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
