import { useEffect, useState, useMemo } from 'react';
import ToolCard, { type Tool } from '../components/ToolCard';
import SubmitToolButton from '../components/SubmitToolButton';
import RecentCopiedStrip from '../components/RecentCopiedStrip';
import { useToolStorage } from '../hooks/useToolStorage';
import mainToolsData from '../data/mainTools.json';

type MainToolsPayload = { tools: Tool[] };

/**
 * Tab 1 — Main Tools (Curated Toolkit)
 *
 * Data source: in production, fetch this JSON from the robloxxea-data repo.
 * Falls back to the bundled copy at `src/data/mainTools.json` if the network
 * call fails (offline-first PWA behavior).
 *
 * Features:
 * - Filter chips: All / Featured / Favorites (favorites persisted to localStorage)
 * - Recently Copied strip at the top (shared across tabs via ToolStorage context)
 * - Each card has a star button to toggle favorite + records copies to recent
 */
const REMOTE_URL =
  (import.meta.env.VITE_MAIN_TOOLS_URL as string | undefined) ?? null;

type Filter = 'all' | 'featured' | 'favorites';

export default function MainTools() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const { favorites, isFavorite, toggleFavorite, addRecent } = useToolStorage();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (REMOTE_URL) {
          const res = await fetch(REMOTE_URL, { cache: 'no-store' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data: MainToolsPayload = await res.json();
          if (!cancelled) setTools(data.tools);
        } else {
          await new Promise((r) => setTimeout(r, 250));
          if (!cancelled) setTools((mainToolsData as MainToolsPayload).tools);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load tools.');
          setTools((mainToolsData as MainToolsPayload).tools);
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

  const visibleTools = useMemo(() => {
    if (filter === 'featured') return tools.filter((t) => t.featured);
    if (filter === 'favorites') return tools.filter((t) => favorites.includes(t.id));
    return tools;
  }, [tools, filter, favorites]);

  const favoritesCountInTab = useMemo(
    () => tools.filter((t) => favorites.includes(t.id)).length,
    [tools, favorites]
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading tools…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10 p-4">
        <h2 className="text-lg font-bold text-slate-50">Curated Toolkit</h2>
        <p className="mt-1 text-sm text-slate-300">
          Our hand-picked set of {tools.length} universal, open-source Roblox scripting tools. Tap <strong className="text-neon-cyan">Copy Loadstring</strong> on any card to grab the executor-ready snippet.
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({tools.length})
          </FilterChip>
          <FilterChip active={filter === 'featured'} onClick={() => setFilter('featured')}>
            ★ Featured ({tools.filter((t) => t.featured).length})
          </FilterChip>
          <FilterChip
            active={filter === 'favorites'}
            onClick={() => setFilter('favorites')}
            disabled={favoritesCountInTab === 0}
          >
            ♡ Favorites ({favoritesCountInTab})
          </FilterChip>
        </div>
      </section>

      <RecentCopiedStrip />

      {error && (
        <div className="rounded-xl border border-neon-pink/30 bg-neon-pink/10 p-3 text-xs text-neon-pink">
          Network fetch failed — showing bundled fallback. ({error})
        </div>
      )}

      <SubmitToolButton variant="full" />

      {filter === 'favorites' && visibleTools.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-400">
            No favorites yet. Tap the <span className="text-amber-400">♡</span> on any tool card to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              featured={tool.featured}
              isFavorite={isFavorite(tool.id)}
              onToggleFavorite={toggleFavorite}
              onCopied={addRecent}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  disabled,
  children
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
        disabled
          ? 'cursor-not-allowed border-white/5 bg-white/5 text-slate-600 opacity-50'
          : active
            ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan'
            : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
      }`}
    >
      {children}
    </button>
  );
}
