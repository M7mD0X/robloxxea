import type { Tool } from '../components/ToolCard';

/**
 * Executor compatibility detector.
 *
 * Fetches the actual Lua source code from the tool's loadstring URL and
 * scans it for known executor-only APIs. Returns a list of badges to display
 * on the tool detail page.
 *
 * Detection is heuristic — not exhaustive. A "Universal" badge means no
 * known executor-only APIs were found in the source, which strongly suggests
 * (but doesn't guarantee) the script runs in any Roblox environment.
 */

export interface CompatibilityBadge {
  label: string;
  variant: 'universal' | 'executor' | 'info' | 'warning';
  detail: string;
}

const PATTERNS: { pattern: RegExp; label: string; variant: CompatibilityBadge['variant']; detail: string }[] = [
  // Synapse X specific
  { pattern: /\bsyn\./, label: 'Synapse X', variant: 'executor', detail: 'Uses `syn.*` APIs specific to Synapse X. May not work on other executors.' },
  { pattern: /\bsyn_context\b/, label: 'Synapse X', variant: 'executor', detail: 'Uses `syn_context` (Synapse X specific).' },

  // General executor-only APIs
  { pattern: /\bgetgenv\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `getgenv()` — requires an exploit executor.' },
  { pattern: /\bgetrenv\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `getrenv()` — requires an exploit executor.' },
  { pattern: /\bgetreg\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `getreg()` — requires an exploit executor.' },
  { pattern: /\bhookfunction\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `hookfunction()` — requires an exploit executor.' },
  { pattern: /\bhookmetamethod\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `hookmetamethod()` — requires an exploit executor.' },
  { pattern: /\bcheckcaller\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `checkcaller()` — requires an exploit executor.' },
  { pattern: /\bgethui\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `gethui()` — requires an exploit executor.' },
  { pattern: /\bclonefunction\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `clonefunction()` — requires an exploit executor.' },
  { pattern: /\bloadstring\s*\(/, label: 'Executor Required', variant: 'executor', detail: 'Uses `loadstring()` at runtime — requires an exploit executor (Luau disables this by default).' },

  // Drawing API (most modern executors support it, but it's not vanilla Roblox)
  { pattern: /\bDrawing\.new\b/, label: 'Drawing API', variant: 'executor', detail: 'Uses the Drawing API for on-screen rendering. Supported by most modern executors.' },

  // HTTP requests (executor-only in most contexts)
  { pattern: /\bgame:HttpGet\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `game:HttpGet()` — requires an exploit executor.' },
  { pattern: /\bgame:HttpGetAsync\b/, label: 'Executor Required', variant: 'executor', detail: 'Uses `game:HttpGetAsync()` — requires an exploit executor.' },
  { pattern: /\brequest\s*\(/, label: 'Executor Required', variant: 'executor', detail: 'Uses `request()` — requires an exploit executor.' },
];

const SOURCE_CACHE_KEY = 'robloxxea:source-cache:v1';

function getCachedSource(url: string): string | null {
  try {
    const cache = JSON.parse(sessionStorage.getItem(SOURCE_CACHE_KEY) || '{}');
    return cache[url] ?? null;
  } catch {
    return null;
  }
}

function setCachedSource(url: string, source: string): void {
  try {
    const cache = JSON.parse(sessionStorage.getItem(SOURCE_CACHE_KEY) || '{}');
    cache[url] = source;
    const entries = Object.entries(cache);
    if (entries.length > 20) {
      entries.slice(0, entries.length - 20).forEach(([k]) => delete cache[k]);
    }
    sessionStorage.setItem(SOURCE_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage might be full or unavailable — silently skip
  }
}

function extractUrl(loadstring: string): string | null {
  const m = loadstring.match(/(?:HttpGet|HttpGetAsync|request)\s*\(\s*['"]([^'"]+)['"]/);
  if (m) return m[1];
  const fallback = loadstring.match(/https?:\/\/[^\s'")]+/);
  return fallback ? fallback[0] : null;
}

export async function detectCompatibility(
  tool: Tool
): Promise<{ badges: CompatibilityBadge[]; sourceSize: number } | null> {
  const url = extractUrl(tool.loadstring);
  if (!url) return null;

  const cached = getCachedSource(url);
  if (cached) {
    return analyzeSource(cached);
  }

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const source = await res.text();
    if (source.length < 100) return null;

    setCachedSource(url, source);
    return analyzeSource(source);
  } catch {
    return null;
  }
}

function analyzeSource(source: string): { badges: CompatibilityBadge[]; sourceSize: number } {
  const badges: CompatibilityBadge[] = [];
  const detectedLabels = new Set<string>();

  for (const { pattern, label, variant, detail } of PATTERNS) {
    if (pattern.test(source) && !detectedLabels.has(label)) {
      if (label === 'Executor Required' && detectedLabels.has('Executor Required')) continue;
      badges.push({ label, variant, detail });
      detectedLabels.add(label);
    }
  }

  const hasExecutorBadge = badges.some((b) => b.variant === 'executor');
  if (!hasExecutorBadge) {
    badges.unshift({
      label: 'Universal',
      variant: 'universal',
      detail: 'No executor-only APIs detected. Should run in any Roblox environment, including Studio and non-exploit contexts.',
    });
  }

  badges.push({
    label: 'Luau',
    variant: 'info',
    detail: 'Written for Luau (Roblox\'s dialect of Lua 5.1).',
  });

  return { badges, sourceSize: source.length };
}
