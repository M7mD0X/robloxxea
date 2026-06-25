import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { type Tool, fetchTool } from '../lib/tools';
import CodeBlock from '../components/CodeBlock';
import ShareButton from '../components/ShareButton';
import { useToolStorage } from '../hooks/useToolStorage';
import { fetchReleases, type GitHubRelease, parseRepoUrl } from '../lib/github';

/**
 * ToolDetail — dedicated page for a single tool.
 *
 * Shows the full description, loadstring with copy button, and the latest
 * 5 GitHub releases as a changelog (if the tool has a `repo` URL).
 *
 * Navigation:
 * - From a ToolCard click: tool data passed via router state (no refetch).
 * - From a direct link / refresh: fetched from Supabase by ID.
 */
export default function ToolDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [tool, setTool] = useState<Tool | null>(
    (location.state as { tool?: Tool } | null)?.tool ?? null
  );
  const [loading, setLoading] = useState(!tool);
  const [notFound, setNotFound] = useState(false);

  const { isFavorite, toggleFavorite, addRecent } = useToolStorage();

  // Releases state
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [releasesLoading, setReleasesLoading] = useState(true);
  const [releasesError, setReleasesError] = useState<string | null>(null);
  const [changelogOpen, setChangelogOpen] = useState(true);

  // Find the tool if we don't have it from router state
  useEffect(() => {
    if (tool) {
      setLoading(false);
      return;
    }
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function findTool() {
      setLoading(true);
      const found = await fetchTool(id!);
      if (cancelled) return;
      if (found) {
        setTool(found);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    findTool();
    return () => { cancelled = true; };
  }, [id, tool]);

  // Fetch GitHub releases
  useEffect(() => {
    if (!tool?.repo) {
      setReleasesLoading(false);
      return;
    }
    setReleasesLoading(true);
    fetchReleases(tool.repo)
      .then(({ releases, error }) => {
        setReleases(releases);
        setReleasesError(error);
      })
      .finally(() => setReleasesLoading(false));
  }, [tool?.repo]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading tool…</span>
        </div>
      </div>
    );
  }

  if (notFound || !tool) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-neon-cyan"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div className="card p-8 text-center">
          <p className="text-sm text-slate-400">Tool not found.</p>
          <Link to="/" className="mt-3 inline-block text-sm font-semibold text-neon-cyan">
            Go to Main →
          </Link>
        </div>
      </div>
    );
  }

  const tileColor = tool.iconColor ?? '#22d3ee';
  const initials = (tool.icon ?? tool.name.slice(0, 2)).toUpperCase();
  const parsedRepo = tool.repo ? parseRepoUrl(tool.repo) : null;

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neon-cyan"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      {/* Header */}
      <section className="card p-5">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 font-mono text-xl font-bold"
            style={{
              backgroundColor: `${tileColor}1a`,
              color: tileColor,
              boxShadow: `0 0 24px -8px ${tileColor}66`,
            }}
            aria-hidden
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-50">{tool.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
              <span>by <strong className="text-slate-300">{tool.author}</strong></span>
              <span className="text-slate-600">•</span>
              <span className="chip">{tool.category}</span>
            </div>
          </div>

          {/* Favorite star */}
          <button
            type="button"
            onClick={() => toggleFavorite(tool.id)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90 ${
              isFavorite(tool.id)
                ? 'border-amber-400/50 bg-amber-400/15 text-amber-400 shadow-[0_0_12px_-2px_rgba(251,191,36,0.5)]'
                : 'border-white/10 bg-white/5 text-slate-500 hover:text-slate-300'
            }`}
            aria-label={isFavorite(tool.id) ? `Unfavorite ${tool.name}` : `Favorite ${tool.name}`}
            aria-pressed={isFavorite(tool.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite(tool.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>

        {/* Description */}
        <p className="mt-4 text-[15px] leading-relaxed text-slate-300">{tool.description}</p>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tool.tags.map((t) => (
              <span key={t} className="chip">#{t}</span>
            ))}
          </div>
        )}
      </section>

      {/* Loadstring */}
      <section className="card p-5">
        <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          Loadstring
        </h2>
        <CodeBlock code={tool.loadstring} language="luau" caption="Paste into your executor" />
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
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
                addRecent(tool);
              } catch {
                // swallow
              }
            }}
            className="btn-neon flex-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Loadstring
          </button>
          {tool.repo && (
            <a
              href={tool.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon-purple px-3"
              aria-label={`Open ${tool.name} repository`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Repo
            </a>
          )}
          <ShareButton tool={tool} variant="compact" />
        </div>
      </section>

      {/* Changelog — GitHub Releases (collapsible, only if tool has a repo URL) */}
      {tool.repo && (
        <section className="card p-5">
          <button
            type="button"
            onClick={() => setChangelogOpen((v) => !v)}
            className="flex w-full items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-200"
            aria-expanded={changelogOpen}
            aria-controls="changelog-body"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M3 3v18h18" />
              <path d="M7 12l3-3 3 3 4-4" />
            </svg>
            Changelog
            <svg
              className={`ml-1 transition-transform duration-200 ${changelogOpen ? 'rotate-90' : ''}`}
              width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            {parsedRepo && (
              <a
                href={`${tool.repo}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-[10px] font-medium normal-case tracking-normal text-slate-500 hover:text-neon-cyan"
                onClick={(e) => e.stopPropagation()}
              >
                View all on GitHub →
              </a>
            )}
          </button>

          {changelogOpen && (
            <div id="changelog-body" className="mt-3">
              {releasesLoading ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <div className="h-3 w-3 animate-spin rounded-full border border-neon-cyan/30 border-t-neon-cyan" />
                  Fetching releases…
                </div>
              ) : releasesError ? (
                <p className="text-xs text-slate-500">{releasesError}</p>
              ) : releases.length === 0 ? (
                <p className="text-xs text-slate-500">No releases published.</p>
              ) : (
                <ul className="space-y-3">
                  {releases.map((release) => (
                    <li key={release.id} className="rounded-xl border border-white/5 bg-void-800/50 p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-neon-cyan">
                          {release.tag_name}
                        </span>
                        {release.prerelease && (
                          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                            Pre
                          </span>
                        )}
                        <span className="ml-auto text-[10px] text-slate-500">
                          {new Date(release.published_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {release.name && release.name !== release.tag_name && (
                        <p className="mt-1 text-sm font-medium text-slate-200">{release.name}</p>
                      )}
                      {release.body && (
                        <p className="mt-1.5 line-clamp-4 text-xs leading-relaxed text-slate-400 whitespace-pre-wrap">
                          {release.body}
                        </p>
                      )}
                      <a
                        href={release.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-[10px] font-medium text-slate-500 hover:text-neon-cyan"
                      >
                        View release →
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
