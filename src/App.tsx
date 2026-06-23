import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Nav from './components/Nav';
import InstallButton from './components/InstallButton';
import UpdateToast from './components/UpdateToast';

// Lazy-load each page so the PWA ships a tiny initial bundle.
const Main = lazy(() => import('./pages/Main'));
const ToolsPage = lazy(() => import('./pages/ToolsPage'));
const AppToolsPage = lazy(() => import('./pages/AppToolsPage'));
const Docs = lazy(() => import('./pages/Docs'));
const ToolDetail = lazy(() => import('./pages/ToolDetail'));

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
    <div className="relative min-h-screen w-full">
      <Nav />

      {/* Main content — offset for sidebar on desktop (lg:pl-64),
          bottom padding for mobile bottom nav (pb-28). */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        {/* Mobile-only header (desktop has the sidebar logo) */}
        <header className="safe-pt sticky top-0 z-30 border-b border-white/5 bg-void-900/80 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 font-mono text-xs font-bold text-neon-cyan" aria-hidden>
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

            <div className="flex items-center gap-2">
              <a
                href="https://github.com/M7mD0X/robloxxea"
                target="_blank"
                rel="noopener noreferrer"
                className="chip border-neon-purple/30 text-neon-purple"
                aria-label="View source on GitHub"
              >
                v1.4.0
              </a>
              <InstallButton />
            </div>
          </div>
        </header>

        {/* Desktop-only top bar (install button + GitHub link) */}
        <div className="hidden items-center justify-end gap-2 px-8 py-3 lg:flex">
          <a
            href="https://github.com/M7mD0X/robloxxea"
            target="_blank"
            rel="noopener noreferrer"
            className="chip border-neon-purple/30 text-neon-purple"
            aria-label="View source on GitHub"
          >
            v1.4.0
          </a>
          <InstallButton />
        </div>

        {/* Page outlet */}
        <main className="mx-auto w-full max-w-screen-xl flex-1 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Main />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/apps" element={<AppToolsPage />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/tool/:id" element={<ToolDetail />} />
              {/* Legacy redirects — old routes map to new ones */}
              <Route path="/community" element={<Navigate to="/tools?tab=community" replace />} />
              <Route path="/convert" element={<Navigate to="/apps" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      <UpdateToast />
    </div>
  );
}
