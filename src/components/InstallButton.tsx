import { useEffect, useState, useCallback } from 'react';

/**
 * InstallButton — renders a small "Install app" button in the header when the
 * browser fires `beforeinstallprompt` (Chrome/Edge Android, Chrome desktop,
 * Edge desktop, Samsung Internet).
 *
 * On iOS Safari the BeforeInstallPrompt API doesn't exist, so the button
 * instead shows a "tap to dismiss" tooltip instructing the user to use
 * Share → Add to Home Screen. We detect iOS via the user agent (the only
 * reliable signal — Apple doesn't expose a feature check).
 *
 * The button is hidden once the user either installs or explicitly dismisses
 * the native prompt, and on iOS after the user dismisses the tooltip.
 */
export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [iosHintVisible, setIosHintVisible] = useState(false);
  const [iosHintDismissed, setIosHintDismissed] = useState(false);

  // Detect iOS Safari — no BeforeInstallPrompt API there.
  const isIOS = typeof window !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent) &&
    !(/crios|fxios/i.test(navigator.userAgent)); // Chrome/Firefox on iOS use the iOS API path

  useEffect(() => {
    // Already installed (standalone mode)? Don't show the button.
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) {
      setInstalled(true);
      return;
    }

    const onBeforeInstall = (e: BeforeInstallPromptEvent) => {
      e.preventDefault(); // Don't let Chrome auto-show its own prompt
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    window.addEventListener('appinstalled', onInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // On iOS, surface the hint once after a short delay (only if not dismissed).
  useEffect(() => {
    if (!isIOS || iosHintDismissed || installed) return;
    const t = window.setTimeout(() => setIosHintVisible(true), 2500);
    return () => window.clearTimeout(t);
  }, [isIOS, iosHintDismissed, installed]);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstalled(true);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (installed) return null;

  // Chrome/Edge/etc path — show real install button
  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 rounded-full border border-neon-cyan/50 bg-neon-cyan/15 px-3 py-1.5 text-xs font-semibold text-neon-cyan transition-all hover:bg-neon-cyan/25 hover:shadow-glow active:scale-95"
        aria-label="Install RobloxXea app"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 3v12" />
          <polyline points="7 10 12 15 17 10" />
          <path d="M5 21h14" />
        </svg>
        Install
      </button>
    );
  }

  // iOS path — show a dismissible hint pointing at the Share menu
  if (isIOS && iosHintVisible && !iosHintDismissed) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIosHintVisible(false)}
          className="inline-flex items-center gap-1.5 rounded-full border border-neon-purple/50 bg-neon-purple/15 px-3 py-1.5 text-xs font-semibold text-neon-purple transition-all active:scale-95"
          aria-label="Show install instructions"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Install
        </button>

        {/* Tooltip bubble */}
        <div
          role="tooltip"
          className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-neon-purple/30 bg-void-800 p-3 text-xs text-slate-300 shadow-glow-purple"
        >
          <div className="mb-1 flex items-center justify-between">
            <span className="font-semibold text-neon-purple">Install on iOS</span>
            <button
              type="button"
              onClick={() => {
                setIosHintDismissed(true);
                setIosHintVisible(false);
              }}
              className="text-slate-500 hover:text-slate-200"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <p className="leading-relaxed">
            Tap the <strong className="text-slate-100">Share</strong> icon
            (<svg className="inline" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>)
            in Safari, then <strong className="text-slate-100">Add to Home Screen</strong>.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
