import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import BottomNav from './components/BottomNav';
import InstallButton from './components/InstallButton';
import UpdateToast from './components/UpdateToast';

// Lazy-load each tab so the PWA ships a tiny initial bundle.
const MainTools = lazy(() => import('./pages/MainTools'));
const CommunityTools = lazy(() => import('./pages/CommunityTools'));
const Docs = lazy(() => import('./pages/Docs'));

function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
        <span className="font-mono text-xs uppercase tracking-widest">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* App header — slim, sticky top bar with the RobloxXea wordmark */}
      <header className="safe-pt sticky top-0 z-30 border-b border-white/5 bg-void-900/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-screen-xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 font-mono text-xs font-bold text-neon-cyan"
              aria-hidden
            >
              RX
            </span>
            <div className="leading-none">
              <h1 className="font-mono text-base font-bold tracking-tight text-slate-50">
                Roblox<span className="text-neon-cyan">Xea</span>
              </h1>
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                Scripter Toolkit
              </p>
            </div>
          </div>

          <a
            href="https://github.com/M7mD0X/robloxxea"
            target="_blank"
            rel="noopener noreferrer"
            className="chip border-neon-purple/30 text-neon-purple"
            aria-label="View source on GitHub"
          >
            v1.0.0
          </a>

          <InstallButton />
        </div>
      </header>

      {/* Page outlet — bottom padding clears the fixed BottomNav.
          Inner container is full-width on mobile, capped on large screens. */}
      <main className="mx-auto w-full max-w-screen-xl flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<MainTools />} />
            <Route path="/community" element={<CommunityTools />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <BottomNav />
      <UpdateToast />
    </div>
  );
}
