import { useState, useCallback } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * UpdateToast — invisible by default. When vite-plugin-pwa's service worker
 * detects a new bundle on the network (checked on every navigation and every
 * hour while the tab is open), `onNeedRefresh` fires and we show a small
 * toast above the bottom nav with a "Reload" button.
 *
 * Calling `updateSW(true)` tells Workbox to skip waiting and activate the new
 * SW immediately, then reloads the page so the new bundle is fetched.
 *
 * The toast auto-dismisses after 15s — users who ignore it get the update on
 * their next visit anyway because of `registerType: 'autoUpdate'`.
 */
export default function UpdateToast() {
  const [offlineReadyVisible, setOfflineReadyVisible] = useState(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.warn('[PWA] SW registration failed:', error);
    },
    onOfflineReady() {
      setOfflineReadyVisible(true);
      window.setTimeout(() => setOfflineReadyVisible(false), 4000);
    },
    onNeedRefresh() {
      window.setTimeout(() => setNeedRefresh(false), 15000);
    },
  });

  const handleReload = useCallback(() => {
    updateServiceWorker(true);
  }, [updateServiceWorker]);

  const handleClose = useCallback(() => {
    setNeedRefresh(false);
  }, [setNeedRefresh]);

  if (!needRefresh && !offlineReadyVisible) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-20 z-50 mx-auto w-[calc(100%-2rem)] max-w-md safe-pb"
      role="status"
      aria-live="polite"
    >
      <div
        className={`card flex items-center gap-3 border p-3 shadow-lg ${
          needRefresh
            ? 'border-neon-cyan/40 bg-void-700/95 shadow-glow'
            : 'border-neon-green/30 bg-void-700/95'
        }`}
      >
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
            needRefresh ? 'bg-neon-cyan/15 text-neon-cyan' : 'bg-neon-green/15 text-neon-green'
          }`}
          aria-hidden
        >
          {needRefresh ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-2.64-6.36" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-50">
            {needRefresh ? 'New version available' : 'Ready for offline'}
          </p>
          <p className="truncate text-xs text-slate-400">
            {needRefresh
              ? 'Reload to get the latest tools and fixes.'
              : 'RobloxXea is cached and works without internet.'}
          </p>
        </div>

        {needRefresh ? (
          <>
            <button
              type="button"
              onClick={handleReload}
              className="rounded-lg bg-neon-cyan px-3 py-1.5 text-xs font-bold text-void-900 transition-colors hover:bg-neon-cyan/90 active:scale-95"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="text-slate-500 hover:text-slate-200"
              aria-label="Dismiss update notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
