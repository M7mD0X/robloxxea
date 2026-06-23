import { useState } from 'react';
import UrlToLoadstring from './UrlToLoadstring';

/**
 * AppToolsPage — wrapper for app utilities. Currently contains the URL to
 * Loadstring converter as the only subtab. Designed to accommodate more
 * tools in the future (the user has plans for a "Loadstring Builder").
 *
 * When more app tools are added, add a subtab segmented control here like
 * ToolsPage has for Official/Community.
 */
export default function AppToolsPage() {
  const [_subtab] = useState<'convert'>('convert');

  return (
    <div className="space-y-4">
      {/* Subtab segmented control — currently single tool, but ready for expansion */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-void-800/50 p-1">
        <button
          type="button"
          className="flex-1 rounded-lg bg-neon-purple/15 px-3 py-2 text-sm font-semibold text-neon-purple shadow-glow-purple"
          aria-pressed={true}
        >
          URL to Loadstring
        </button>
        {/* Future: Loadstring Builder, Script Formatter, etc. */}
      </div>

      {_subtab === 'convert' && <UrlToLoadstring />}
    </div>
  );
}
