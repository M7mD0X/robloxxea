import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ToolCard, { type Tool } from '../components/ToolCard';
import RecentCopiedStrip from '../components/RecentCopiedStrip';
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

/**
 * Main — home/overview page. Shows app stats, featured tools, quick-access
 * cards to each section, and the recently-copied strip.
 */
export default function Main() {
  const [mainTools, setMainTools] = useState<Tool[]>([]);
  const [communityTools, setCommunityTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const { isFavorite, toggleFavorite, addRecent } = useToolStorage();

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

  const stats = useMemo(() => {
    const all = [...mainTools, ...communityTools];
    return {
      total: all.length,
      verified: all.filter((t) => t.verified).length,
      official: mainTools.length,
      community: communityTools.length,
      featured: all.filter((t) => t.featured).length,
    };
  }, [mainTools, communityTools]);

  const featuredTools = useMemo(
    () => [...mainTools, ...communityTools].filter((t) => t.featured).slice(0, 3),
    [mainTools, communityTools]
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10 p-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-50">
          Roblox<span className="text-neon-cyan">Xea</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Advanced toolkit for Roblox scripters. {stats.total} verified tools, docs, and utilities.
        </p>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Tools" value={stats.total} color="#22d3ee" />
        <StatCard label="Verified" value={stats.verified} color="#4ade80" />
        <StatCard label="Official" value={stats.official} color="#a855f7" />
        <StatCard label="Community" value={stats.community} color="#ec4899" />
      </section>

      {/* Quick access cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <QuickAccessCard
          to="/tools"
          title="Tools"
          desc="Browse official + community tools"
          icon="wrench"
          color="#22d3ee"
        />
        <QuickAccessCard
          to="/apps"
          title="App Tools"
          desc="URL to Loadstring converter"
          icon="link"
          color="#a855f7"
        />
        <QuickAccessCard
          to="/docs"
          title="Docs"
          desc="Luau guides & scripting tutorials"
          icon="book"
          color="#4ade80"
        />
        <QuickAccessCard
          to="https://github.com/M7mD0X/robloxxea-data/issues/new?template=submit-a-tool.yml&labels=submission"
          title="Submit"
          desc="Add a tool to the directory"
          icon="plus"
          color="#ec4899"
          external
        />
      </section>

      <RecentCopiedStrip />

      {/* Featured tools */}
      {featuredTools.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Featured
            </h2>
            <Link to="/tools" className="text-[10px] font-medium uppercase tracking-wider text-slate-500 hover:text-neon-cyan">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTools.map((tool) => (
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
        </section>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="card p-3 text-center">
      <p className="font-mono text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function QuickAccessCard({
  to, title, desc, icon, color, external
}: {
  to: string; title: string; desc: string; icon: 'wrench' | 'link' | 'book' | 'plus'; color: string; external?: boolean;
}) {
  const icons = {
    wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
    plus: <><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></>,
  };

  const content = (
    <div className="card flex items-center gap-3 p-4 transition-colors hover:border-white/20">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
        style={{ backgroundColor: `${color}1a`, color, borderColor: `${color}40` }}
        aria-hidden
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icons[icon]}
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-50">{title}</h3>
        <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );

  if (external) {
    return <a href={to} target="_blank" rel="noopener noreferrer">{content}</a>;
  }
  return <Link to={to}>{content}</Link>;
}
