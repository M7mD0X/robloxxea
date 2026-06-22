import { useState, useCallback } from 'react';

interface CodeBlockProps {
  code: string;
  /** Optional language label shown in the header chip (e.g. "luau"). */
  language?: string;
  /** Optional caption / filename shown in the header. */
  caption?: string;
}

/**
 * CodeBlock — a dark, monospace code viewer with a copy button and very
 * lightweight Luau-aware syntax highlighting (keywords, strings, comments,
 * numbers, built-ins). Highlighting is intentionally simple and dependency-free
 * so it stays fast on mobile and survives any Luau syntax Roblox throws at it.
 */
export default function CodeBlock({ code, language = 'luau', caption }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* swallow */
    }
  }, [code]);

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-void-900/90">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 bg-void-800/60 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span className="flex gap-1" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-neon-pink/70" />
            <span className="h-2 w-2 rounded-full bg-neon-purple/70" />
            <span className="h-2 w-2 rounded-full bg-neon-green/70" />
          </span>
          <span className="font-mono uppercase tracking-wide">{language}</span>
          {caption && <span className="text-slate-500">— {caption}</span>}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold transition-colors ${
            copied
              ? 'border-neon-green/40 bg-neon-green/10 text-neon-green'
              : 'border-white/10 bg-white/5 text-slate-300 hover:border-neon-cyan/40 hover:text-neon-cyan'
          }`}
          aria-label="Copy code"
        >
          {copied ? '✓ Copied' : 'Copy Code'}
        </button>
      </div>

      {/* Code body */}
      <pre className="overflow-x-auto p-3 font-mono text-[12.5px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlightLuau(code) }} />
      </pre>
    </div>
  );
}

/* --- Minimal Luau syntax highlighter (regex-based, escape-safe) --- */
const KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
  'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
  'until', 'while', 'continue', 'export', 'type'
]);

const BUILTINS = new Set([
  'game', 'workspace', 'script', 'self', 'print', 'warn', 'error', 'assert',
  'pcall', 'xpcall', 'typeof', 'type', 'tostring', 'tonumber', 'pairs', 'ipairs',
  'next', 'select', 'unpack', 'setmetatable', 'getmetatable', 'rawget', 'rawset',
  'rawequal', 'rawlen', 'require', 'loadstring', 'HttpGet', 'getgenv', 'getrenv',
  'getreg', 'hookfunction', 'hookmetamethod', 'checkcaller', 'Drawing', 'syn'
]);

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function highlightLuau(src: string): string {
  // Tokenize line by line, preserving comments and strings as atomic units.
  const lines = src.split('\n');
  return lines
    .map((line) => {
      let result = '';
      let i = 0;
      while (i < line.length) {
        const ch = line[i];

        // Line comment
        if (ch === '-' && line[i + 1] === '-') {
          result += `<span style="color:#5b6477">${escapeHtml(line.slice(i))}</span>`;
          break;
        }

        // Long string [[ ... ]]
        if (ch === '[' && line[i + 1] === '[') {
          const end = line.indexOf(']]', i + 2);
          const stop = end === -1 ? line.length : end + 2;
          result += `<span style="color:#4ade80">${escapeHtml(line.slice(i, stop))}</span>`;
          i = stop;
          continue;
        }

        // Single/double quoted string
        if (ch === '"' || ch === "'") {
          let j = i + 1;
          while (j < line.length && line[j] !== ch) {
            if (line[j] === '\\') j++;
            j++;
          }
          const stop = Math.min(j + 1, line.length);
          result += `<span style="color:#4ade80">${escapeHtml(line.slice(i, stop))}</span>`;
          i = stop;
          continue;
        }

        // Identifier / keyword / builtin
        if (/[A-Za-z_]/.test(ch)) {
          let j = i + 1;
          while (j < line.length && /[A-Za-z0-9_]/.test(line[j])) j++;
          const word = line.slice(i, j);
          if (KEYWORDS.has(word)) {
            result += `<span style="color:#a855f7;font-weight:600">${word}</span>`;
          } else if (BUILTINS.has(word)) {
            result += `<span style="color:#22d3ee">${word}</span>`;
          } else {
            result += escapeHtml(word);
          }
          i = j;
          continue;
        }

        // Number
        if (/[0-9]/.test(ch)) {
          let j = i + 1;
          while (j < line.length && /[0-9.eExXa-fA-F]/.test(line[j])) j++;
          result += `<span style="color:#ec4899">${escapeHtml(line.slice(i, j))}</span>`;
          i = j;
          continue;
        }

        // Default — escape and emit
        result += escapeHtml(ch);
        i++;
      }
      return result;
    })
    .join('\n');
}
