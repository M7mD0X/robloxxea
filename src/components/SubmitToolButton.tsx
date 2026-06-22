/**
 * SubmitToolButton — opens a pre-filled "Submit a tool" issue on the
 * robloxxea-data repo. The issue form lives at:
 *   https://github.com/M7mD0X/robloxxea-data/issues/new?template=submit-a-tool.yml
 *
 * GitHub issue forms accept query-string pre-fill via `?field=<value>` for
 * each field ID. We pre-fill nothing by default (the form is short enough
 * that pre-filling would be presumptuous) — we just deep-link to the form
 * so users don't have to find it.
 *
 * On iOS Safari this opens in a new tab; on Android Chrome it opens in the
 * GitHub PWA if installed, otherwise the browser.
 */
const SUBMIT_URL =
  'https://github.com/M7mD0X/robloxxea-data/issues/new?template=submit-a-tool.yml&labels=submission';

export default function SubmitToolButton({
  variant = 'full'
}: {
  variant?: 'full' | 'compact';
}) {
  if (variant === 'compact') {
    return (
      <a
        href={SUBMIT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full border border-neon-purple/50 bg-neon-purple/15 px-3 py-1.5 text-xs font-semibold text-neon-purple transition-all hover:bg-neon-purple/25 hover:shadow-glow-purple active:scale-95"
        aria-label="Submit a new tool to RobloxXea"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Submit
      </a>
    );
  }

  return (
    <a
      href={SUBMIT_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="card flex items-center gap-3 p-4 transition-colors hover:border-neon-purple/40"
    >
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neon-purple/30 bg-neon-purple/10 text-neon-purple"
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-slate-50">Submit a tool</h3>
        <p className="mt-0.5 text-xs text-slate-400">
          Know a Roblox script that should be here? Open an issue and the bot will auto-verify the loadstring.
        </p>
      </div>
      <svg className="text-slate-500" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}
