/**
 * GitHub Releases fetcher — pulls the latest releases for a tool's repository
 * using the public GitHub API (no auth required, 60 req/hour per IP).
 *
 * Results are cached in sessionStorage for 10 minutes so navigating back to
 * a detail page doesn't re-fetch.
 */

export interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string | null;
  published_at: string;
  body: string | null;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

const CACHE_KEY = 'robloxxea:releases-cache:v1';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  releases: GitHubRelease[];
  timestamp: number;
}

/** Extracts owner/repo from a GitHub URL like https://github.com/EdgeIY/infiniteyield */
export function parseRepoUrl(repoUrl: string): { owner: string; repo: string } | null {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!m) return null;
  return { owner: m[1], repo: m[2].replace(/\.git$/, '') };
}

export async function fetchReleases(
  repoUrl: string
): Promise<{ releases: GitHubRelease[]; error: string | null }> {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) {
    return { releases: [], error: 'Invalid repository URL' };
  }

  // Check cache
  const cacheKey = `${parsed.owner}/${parsed.repo}`;
  try {
    const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
    const entry: CacheEntry | undefined = cache[cacheKey];
    if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
      return { releases: entry.releases, error: null };
    }
  } catch {
    // cache corrupt — ignore
  }

  const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases?per_page=5`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });

    if (res.status === 403) {
      return {
        releases: [],
        error: 'GitHub API rate limit reached (60 requests/hour for unauthenticated requests). Try again later.',
      };
    }

    if (res.status === 404) {
      return { releases: [], error: 'Repository has no published releases.' };
    }

    if (!res.ok) {
      return { releases: [], error: `GitHub API returned HTTP ${res.status}` };
    }

    const data = await res.json();
    const releases: GitHubRelease[] = (Array.isArray(data) ? data : []).map((r: any) => ({
      id: r.id,
      tag_name: r.tag_name,
      name: r.name,
      published_at: r.published_at,
      body: r.body,
      html_url: r.html_url,
      prerelease: r.prerelease,
      draft: r.draft,
    }));

    // Cache the result
    try {
      const cache = JSON.parse(sessionStorage.getItem(CACHE_KEY) || '{}');
      cache[cacheKey] = { releases, timestamp: Date.now() };
      // Cap cache at 20 repos
      const entries = Object.entries(cache);
      if (entries.length > 20) {
        entries.slice(0, entries.length - 20).forEach(([k]) => delete cache[k]);
      }
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch {
      // cache write failed — non-fatal
    }

    return { releases, error: null };
  } catch (e) {
    return {
      releases: [],
      error: e instanceof Error ? e.message : 'Network error fetching releases',
    };
  }
}
