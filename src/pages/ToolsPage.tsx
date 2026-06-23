import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolCard, { type Tool } from '../components/ToolCard';
import SubmitToolButton from '../components/SubmitToolButton';
import { useToolStorage } from '../hooks/useToolStorage';
import mainToolsData from '../data/mainTools.json';
import communityToolsData from '../data/communityTools.json';

type MainToolsPayload = { tools: Tool[] };
type CommunityPayload = { tools: Tool[] };

const MAIN_URL =
  (import.meta.env.VITE_MAIN_TOOLS_URL as string | undefined) ??
  'https://raw.githubusercontent.com/M7mD0X/robloxxea-data/main/mainTools.json';
const COMMUNITY_URL =
  (import.meta.env.VITE_COMMUNITY_TOOLS_URL as string | undefined) ??
  'https://raw.githubusercontent.com/M7mD0X/robloxxea-data/main/communityTools.json';

type Subtab = 'official' | 'community';

/**
 * ToolsPage — wrapper that combines Official Tools + Community Tools with
 * a segmented control (subtab) at the top.
 *
 * Official subtab: curated maintainer picks (was "Main Tools" tab).
 * Community subtab: user-submitted tools with search (was "Community" tab).
 */
export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Subtab) || 'official';
  const [subtab, setSubtab] = useState<Subtab>(initialTab);

  const [mainTools, setMainTools] = useState<Tool[]>([]);
  const [communityTools, setCommunityTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'featured' | 'favorites'>('all');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { favorites, isFavorite, toggleFavorite, addRecent } = useToolStorage();

  // Fetch both feeds on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [mainRes, commRes] = await Promise.all([
          fetch(MAIN_URL, { cache: 'force-cache' }).then((r) => r.json()).catch(() => null),
          fetch(COMMUNITY_URL, { cache: 'force-cache' }).then((r) => r.json()).catch(() => null),
        ]);
        if (cancelled) return;
        setMainTools((mainRes as MainToolsPayload | null)?.tools ?? (mainToolsData as MainToolsPayload).tools);
        setCommunityTools((commRes as CommunityPayload | null)?.tools ?? (communityToolsData as CommunityPayload).tools);
      } catch {
        if (!cancelled) {
          setMainTools((mainToolsData as MainToolsPayload).tools);
          setCommunityTools((communityToolsData as CommunityPayload).tools);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Sync subtab to URL
  useEffect(() => {
    setSearchParams(subtab === 'official' ? {} : { tab: subtab }, { replace: true });
  }, [subtab, setSearchParams]);

  // Debounced search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  const isOfficial = subtab === 'official';
  const tools = isOfficial ? mainTools : communityTools;

  const visibleTools = useMemo(() => {
    let result = tools;
    if (filter === 'featured') result = result.filter((t) => t.featured);
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
          Official ({mainTools.length})
        </SubtabButton>
        <SubtabButton active={!isOfficial} onClick={() => setSubtab('community')}>
          Community ({communityTools.length})
        </SubtabButton>
      </div>

      {/* Hero — changes per subtab */}
      <section className={`rounded-2xl border p-4 ${isOfficial ? 'border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10' : 'border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-void-700/40 to-neon-cyan/10'}`}>
        <h2 className="text-lg font-bold text-slate-50">
          {isOfficial ? 'Official Tools' : 'Community Library'}
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          {isOfficial
            ? `Curated, hand-picked tools maintained by the RobloxXea team. ${mainTools.length} tools.`
            : `Auto-updating feed of community-published scripts. ${communityTools.length} tools.`}
        </p>

        {/* Search (community only) */}
        {!isOfficial && (
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
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        )}

        {/* Filter chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({tools.length})
          </FilterChip>
          <FilterChip active={filter === 'featured'} onClick={() => setFilter('featured')}>
            ★ Featured ({tools.filter((t) => t.featured).length})
          </FilterChip>
          <FilterChip active={filter === 'favorites'} onClick={() => setFilter('favorites')} disabled={favoritesCount === 0}>
            ♡ Favorites ({favoritesCount})
          </FilterChip>
        </div>
      </section>

      <SubmitToolButton variant="full" />

      {/* Tools grid */}
      {visibleTools.length === 0 ? (
        <div className="card p-6 text-center text-sm text-slate-400">
          {filter === 'favorites'
            ? 'No favorites yet. Tap the ♡ on any tool card to save it here.'
            : debouncedQuery
              ? <>No tools match <span className="font-mono text-neon-cyan">"{query}"</span>. Try a different keyword.</>
              : 'No tools found.'}
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

function SubtabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
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
