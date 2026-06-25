import { useState, useCallback } from 'react';

interface ShareButtonProps {
  tool: {
    id: string;
    name: string;
    loadstring: string;
  };
  variant?: 'compact' | 'full';
  className?: string;
}

/**
 * ShareButton — uses the native Web Share API when available (mobile browsers,
 * some desktop browsers). Falls back to copying a share link to the clipboard.
 *
 * The shared content includes:
 * - title: tool name
 * - text: "Check out {name} on RobloxXea"
 * - url: deep link to the tool detail page
 */
export default function ShareButton({ tool, variant = 'compact', className = '' }: ShareButtonProps) {
  const [shared, setShared] = useState(false);

  const shareUrl = `${window.location.origin}${window.location.pathname}#/tool/${tool.id}`;

  const handleShare = useCallback(async () => {
    const shareData = {
      title: `RobloxXea — ${tool.name}`,
      text: `Check out ${tool.name} on RobloxXea`,
      url: shareUrl,
    };

    // Try native share API first (mobile + browsers that support it)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShared(true);
        window.setTimeout(() => setShared(false), 1500);
        return;
      } catch (e) {
        // User cancelled — don't show error, just return
        if (e instanceof Error && e.name === 'AbortError') return;
        // Fall through to copy fallback
      }
    }

    // Fallback: copy the share link to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement('textarea');
        ta.value = shareUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 1500);
    } catch {
      // Last resort: open the share URL in a new tab so the user can copy manually
      window.open(shareUrl, '_blank');
    }
  }, [shareUrl, tool.name]);

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={`btn-neon-purple ${className}`}
        aria-label={`Share ${tool.name}`}
      >
        {shared ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            Share
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`btn-neon-purple px-3 ${className}`}
      aria-label={`Share ${tool.name}`}
    >
      {shared ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
    </button>
  );
}
