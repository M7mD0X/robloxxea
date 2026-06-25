import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import { useToolStorage } from '../hooks/useToolStorage';
import { fetchAllTools, fetchCategories, type Tool, type SortOption } from '../lib/tools';

type Subtab = 'official' | 'community';
type Filter = 'all' | 'favorites';

/**
 * ToolsPage — Official + Community tools. The subtab is controlled by the
 * sidebar (which sets ?tab=community in the URL). Data is fetched from
 * Supabase on mount.
 *
 * Features:
 * - Search (debounced 200ms)
 * - Category filter chips (dynamically populated from the data)
 * - All / Favorites filter chips
 * - Sort dropdown (Name / Newest / Author)
 * - Keyboard shortcut: "/" to focus search, "Esc" to clear
 */
export default function ToolsPage() {
  const [searchParams] = useSearchParams();
  const subtab: Subtab = (searchParams.get('tab') as Subtab) || 'official';

  const [officialTools, setOfficialTools] = useState<Tool[]>([]);
  const [communityTools, setCommunityTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('name');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { favorites, isFavorite, toggleFavorite, addRecent } = useToolStorage();

  // Fetch tools + categories on mount, and refetch when sort changes
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [all, cats] = await Promise.all([
        fetchAllTools(sort),
        fetchCategories(),
      ]);
      if (cancelled) return;
      setOfficialTools(all.official);
      setCommunityTools(all.community);
      setCategories(cats);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [sort]);

  // Debounced search
  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim().toLowerCase()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  // Keyboard shortcuts: "/" focuses search, "Esc" clears it
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Only trigger if not already typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          setQuery('');
          searchInputRef.current?.blur();
        }
        return;
      }
      if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const isOfficial = subtab === 'official';
  const tools = isOfficial ? officialTools : communityTools;

  const visibleTools = useMemo(() => {
    let result = tools;
    if (filter === 'favorites') result = result.filter((t) => favorites.includes(t.id));
    if (selectedCategory) result = result.filter((t) => t.category === selectedCategory);
    if (debouncedQuery) {
      const q = debouncedQuery;
      result = result.filter((t) => {
        const haystack = [t.name, t.author, t.category, t.description, ...(t.tags ?? [])].join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }
    return result;
  }, [tools, filter, favorites, selectedCategory, debouncedQuery]);

  const favoritesCount = useMemo(
    () => tools.filter((t) => favorites.includes(t.id)).length,
    [tools, favorites]
  );

  // Reset category when switching subtabs (categories apply per-feed view)
  useEffect(() => {
    setSelectedCategory(null);
  }, [subtab]);

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
      {/* Hero */}
      <section className={`rounded-2xl border p-4 transition-colors duration-300 ${isOfficial ? 'border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10' : 'border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-void-700/40 to-neon-cyan/10'}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-50">
              {isOfficial ? 'Official Tools' : 'Community Library'}
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              {isOfficial
                ? `Curated, hand-picked tools. ${officialTools.length} tools.`
                : `Community-published scripts. ${communityTools.length} tools.`}
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="appearance-none rounded-lg border border-white/10 bg-void-800/80 py-2 pl-3 pr-8 text-xs font-semibold text-slate-300 transition-colors hover:border-white/20 focus:border-neon-cyan/60 focus:outline-none"
              aria-label="Sort tools"
            >
              <option value="name">Name (A-Z)</option>
              <option value="newest">Newest</option>
              <option value="author">Author (A-Z)</option>
            </select>
            <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        {/* Search */}
        <div className="mt-3 relative">
          <input
            ref={searchInputRef}
            type="search"
            inputMode="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, author, tag…  (press /)"
            className="input pl-10"
            aria-label="Search tools"
          />
          <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover:text-slate-300"
              aria-label="Clear search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter chips: All / Favorites + category chips */}
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
            All ({tools.length})
          </FilterChip>
          <FilterChip active={filter === 'favorites'} onClick={() => setFilter('favorites')} disabled={favoritesCount === 0}>
            ♡ Favorites ({favoritesCount})
          </FilterChip>
        </div>

        {categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <CategoryChip
              active={selectedCategory === null}
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </CategoryChip>
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </CategoryChip>
            ))}
          </div>
        )}
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

function CategoryChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-all duration-200 ${
        active
          ? 'border-neon-purple/60 bg-neon-purple/15 text-neon-purple'
          : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300 hover:border-white/20'
      }`}
    >
      {children}
    </button>
  );
}
