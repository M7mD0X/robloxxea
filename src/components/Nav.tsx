import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

interface NavSection {
  type: 'header';
  label: string;
}

interface NavItem {
  type: 'item';
  to: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
  children?: { to: string; label: string }[];
}

type NavEntry = NavSection | NavItem;

const ENTRIES: NavEntry[] = [
  {
    type: 'item',
    to: '/',
    label: 'Main',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    type: 'item',
    to: '/tools',
    label: 'Tools',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    children: [
      { to: '/tools', label: 'Official' },
      { to: '/tools?tab=community', label: 'Community' },
    ]
  },
  {
    type: 'item',
    to: '/apps',
    label: 'App Tools',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    children: [
      { to: '/apps', label: 'URL to Loadstring' },
    ]
  },
  {
    type: 'item',
    to: '/docs',
    label: 'Docs',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
  },
];

/**
 * Nav — unified sidebar that works as:
 * - Desktop (lg+): fixed 256px sidebar, always visible
 * - Mobile: off-canvas drawer, opened via hamburger button in the header
 *
 * Hierarchical structure (inspired by the reference screenshot):
 * - Parent items with icon + label
 * - Active parent gets colored left border + cyan text
 * - Children (subitems) are indented under the parent, smaller text
 * - Active child gets cyan text + subtle left border
 *
 * The drawer state is controlled by `isOpen` + `onClose` props. On desktop
 * the sidebar is always visible (isOpen is ignored).
 */
export default function Nav({
  isOpen = false,
  onClose = () => {},
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const location = useLocation();

  // Close drawer on route change (mobile only)
  useEffect(() => {
    onClose();
  }, [location.pathname, location.search, onClose]);

  // Close drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile backdrop — click to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      {/* Sidebar — fixed on desktop, drawer on mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-void-900/95 backdrop-blur-md safe-pt transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Primary navigation"
      >
        <div className="flex h-full flex-col">
          {/* Logo header with RX icon */}
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div className="flex items-center gap-2.5">
              {/* RX two-tone icon */}
              <img
                src={`${import.meta.env.BASE_URL}rx-icon.png`}
                alt=""
                className="h-8 w-8 rounded-lg"
                onError={(e) => {
                  // Fallback to inline SVG if image fails
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="leading-none">
                <h1 className="font-mono text-base font-bold tracking-tight text-slate-50">
                  Roblox<span className="text-neon-cyan">Xea</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Scripter Toolkit
                </p>
              </div>
            </div>

            {/* Close button (mobile only) */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200 lg:hidden"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Nav items — hierarchical */}
          <nav className="flex-1 overflow-y-auto p-3">
            <ul className="space-y-0.5">
              {ENTRIES.map((entry, i) => {
                if (entry.type === 'header') {
                  return (
                    <li key={`header-${i}`} className="px-3 pt-4 pb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        {entry.label}
                      </p>
                    </li>
                  );
                }

                const item = entry;
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg border-l-2 px-3 py-2.5 text-sm font-medium transition-all ${
                          isActive
                            ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan'
                            : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={isActive ? 'drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]' : ''}>
                            {item.icon(isActive)}
                          </span>
                          {item.label}
                        </>
                      )}
                    </NavLink>

                    {/* Children — indented subitems */}
                    {hasChildren && (
                      <ul className="mt-0.5 ml-5 space-y-0.5 border-l border-white/5 pl-3">
                        {item.children!.map((child) => (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              end={child.to === item.to}
                              className={({ isActive }) =>
                                `flex items-center rounded-md border-l-2 px-3 py-1.5 text-xs font-medium transition-all ${
                                  isActive
                                    ? 'border-neon-cyan/60 bg-neon-cyan/5 text-neon-cyan'
                                    : 'border-transparent text-slate-500 hover:text-slate-300'
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer — GitHub + version */}
          <div className="border-t border-white/5 p-3">
            <a
              href="https://github.com/M7mD0X/robloxxea"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
