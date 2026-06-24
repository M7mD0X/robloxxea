import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ToolCard from '../components/ToolCard';
import RecentCopiedStrip from '../components/RecentCopiedStrip';
import { useToolStorage } from '../hooks/useToolStorage';
import { fetchAllTools, type Tool } from '../lib/tools';

/**
 * Main — home/overview page. Shows app stats, quick-access cards to each
 * section, recently-copied strip, and a preview of recent tools.
 */
export default function Main() {
  const [officialTools, setOfficialTools] = useState<Tool[]>([]);
  const [communityTools, setCommunityTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  const { isFavorite, toggleFavorite, addRecent } = useToolStorage();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { official, community } = await fetchAllTools();
      if (cancelled) return;
      setOfficialTools(official);
      setCommunityTools(community);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = useMemo(() => ({
    total: officialTools.length + communityTools.length,
    official: officialTools.length,
    community: communityTools.length,
  }), [officialTools, communityTools]);

  const recentTools = useMemo(
    () => [...officialTools, ...communityTools].slice(0, 3),
    [officialTools, communityTools]
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
    <div className="space-y-4 animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/10 via-void-700/40 to-neon-purple/10 p-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-50">
          Roblox<span className="text-neon-cyan">Xea</span>
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Advanced toolkit for Roblox scripters. {stats.total} tools and counting.
        </p>
      </section>

      {/* Stats grid */}
      <section className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={stats.total} color="#22d3ee" delay={0} />
        <StatCard label="Official" value={stats.official} color="#a855f7" delay={50} />
        <StatCard label="Community" value={stats.community} color="#ec4899" delay={100} />
      </section>

      {/* Quick access cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <QuickAccessCard to="/tools" title="Tools" desc="Browse official + community tools" icon="wrench" color="#22d3ee" />
        <QuickAccessCard to="/apps" title="App Tools" desc="URL to Loadstring converter" icon="link" color="#a855f7" />
        <QuickAccessCard to="/docs" title="Docs" desc="Luau guides & scripting tutorials" icon="book" color="#4ade80" />
        <QuickAccessCard to="https://github.com/M7mD0X/robloxxea" title="GitHub" desc="View source code" icon="github" color="#ec4899" external />
      </section>

      <RecentCopiedStrip />

      {/* Recent tools preview */}
      {recentTools.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Recent Tools
            </h2>
            <Link to="/tools" className="text-[10px] font-medium uppercase tracking-wider text-slate-500 hover:text-neon-cyan">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recentTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
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

function StatCard({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  return (
    <div
      className="card p-3 text-center animate-fade-in-up"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards' }}
    >
      <p className="font-mono text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">{label}</p>
    </div>
  );
}

function QuickAccessCard({
  to, title, desc, icon, color, external
}: {
  to: string; title: string; desc: string; icon: 'wrench' | 'link' | 'book' | 'github'; color: string; external?: boolean;
}) {
  const icons = {
    wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
    link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
    book: <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></>,
    github: <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />,
  };

  const content = (
    <div className="card flex items-center gap-3 p-4 transition-all duration-200 hover:border-white/20 hover:scale-[1.02] active:scale-[0.99]">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-110"
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
    return <a href={to} target="_blank" rel="noopener noreferrer" className="group block">{content}</a>;
  }
  return <Link to={to} className="group block">{content}</Link>;
}
