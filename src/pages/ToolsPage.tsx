import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import { useToolStorage } from '../hooks/useToolStorage';
import { fetchAllTools, type Tool } from '../lib/tools';

type Subtab = 'official' | 'community';

/**
 * ToolsPage — Official + Community tools with a segmented control subtab.
 * Data is fetched from Supabase on mount.
 */
export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Subtab) || 'official';
  const [subtab, setSubtab] = useState<Subtab>(initialTab);

  const [officialTools, setOfficialTools] = useState<Tool[]>([]);
  const [communityTools, setCommunityTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { favorites, isFavorite, toggleFavorite, addRecent } = useToolStorage();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const { official, community } = await fetchAllTools();
      if (cancelled) return;
      setOfficialTools(official);
      setCommunityTools(community);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setSearchParams(subtab === 'official' ? {} : { tab: subtab }, { replace: true });
  }, [subtab, setSearchParams]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const isOfficial = subtab === 'official';
  const tools = isOfficial ? officialTools : communityTools;

  const visibleTools = useMemo(() => {
    let result = tools;
    if (filter === 'favorites') result = result.filter((t) => favorites.includes(t.id));
    if (debouncedQuery) {
      const q = debouncedQuery;
      result = result.filter((t) => {
        const haystack = [t.name, t.author, t.category, t.description, ...(t.tags ?? [])].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }
    return result;
  }, [tools, filter, favorites, debouncedQuery]);

  const favoritesCount = useMemo(
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
      {/* Subtab segmented control */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-void-800/50 p-1">
        <SubtabButton active={isOfficial} onClick={() => setSubtab('official')}>
          Official ({officialTools.length})
        </SubtabButton>
        <SubtabButton active={!isOfficial} onClick={() => setSubtab('community')}>
          Community ({communityTools.length})
        </SubtabButton>
      </div>

      {/* Hero */}
      <section className={`rounded-2xl border p-4 transition-colors duration-300 ${isOfficial ? 'border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10' : 'border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-void-700/40 to-neon-cyan/10'}`}>
        <h2 className="text-lg font-bold text-slate-50">
          {isOfficial ? 'Official Tools' : 'Community Library'}
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          {isOfficial
            ? `Curated, hand-picked tools. ${officialTools.length} tools.`
            : `Community-published scripts. ${communityTools.length} tools.`}
        </p>

        {/* Search */}
        <div className="mt-3 relative">
          <input
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, author, tag…"
            className="input pl-10"
            aria-label="Search tools"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({tools.length})
          </FilterChip>
          <FilterChip active={filter === 'favorites'} onClick={() => setFilter('favorites')} disabled={favoritesCount === 0}>
            ♡ Favorites ({favoritesCount})
          </FilterChip>
        </div>
      </section>

      {/* Tools grid / empty state */}
      {visibleTools.length === 0 ? (
        <div className="card flex flex-col items-center p-10 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-600">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          {filter === 'favorites' ? (
            <p className="text-sm text-slate-400">No favorites yet.<br/>Tap the ♡ on any tool card to save it here.</p>
          ) : debouncedQuery ? (
            <p className="text-sm text-slate-400">No tools match <span className="font-mono text-neon-cyan">"{query}"</span>.<br/>Try a different keyword.</p>
          ) : (
            <p className="text-sm text-slate-400">No tools yet.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool, i) => (
            <div
              key={tool.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${Math.min(i * 50, 400)}ms`, animationFillMode: 'backwards' }}
            >
              <ToolCard
                tool={tool}
                isFavorite={isFavorite(tool.id)}
                onToggleFavorite={toggleFavorite}
                onCopied={addRecent}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubtabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-neon-cyan/15 text-neon-cyan shadow-glow'
          : 'text-slate-400 hover:text-slate-200'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function FilterChip({ active, onClick, disabled, children }: { active: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
        disabled
          ? 'cursor-not-allowed border-white/5 bg-white/5 text-slate-600 opacity-50'
          : active
            ? 'border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan'
            : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
      }`}
    >
      {children}
    </button>
  );
}
