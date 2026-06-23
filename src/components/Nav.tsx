import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
}

const ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Main',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    to: '/tools',
    label: 'Tools',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    )
  },
  {
    to: '/apps',
    label: 'App Tools',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    )
  },
  {
    to: '/docs',
    label: 'Docs',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.4 : 2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
    )
  }
];

/**
 * Navigation — responsive:
 * - Mobile (default): fixed bottom bar, mimics native app layout.
 * - Desktop (lg+): fixed sidebar on the left with icons + labels + logo.
 *
 * Both share the same ITEMS array and NavLink logic, so active state and
 * routes stay in sync. The main content area gets `lg:pl-64` on desktop
 * to make room for the sidebar.
 */
export default function Nav() {
  return (
    <>
      {/* Desktop sidebar — hidden on mobile */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/10 bg-void-900/90 backdrop-blur-md lg:block safe-pt">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-white/5 px-6 py-5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-neon-cyan/40 bg-neon-cyan/10 font-mono text-sm font-bold text-neon-cyan" aria-hidden>
                RX
              </span>
              <div className="leading-none">
                <h1 className="font-mono text-base font-bold tracking-tight text-slate-50">
                  Roblox<span className="text-neon-cyan">Xea</span>
                </h1>
                <p className="text-[9px] uppercase tracking-[0.18em] text-slate-500">
                  Scripter Toolkit
                </p>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <nav className="flex-1 space-y-1 p-4" aria-label="Primary">
            {ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neon-cyan/10 text-neon-cyan'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}>
                      {item.icon(isActive)}
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/5 p-4">
            <a
              href="https://github.com/M7mD0X/robloxxea"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 transition-colors hover:text-slate-300"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav — hidden on desktop */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-void-800/85 backdrop-blur-lg safe-pb lg:hidden"
        aria-label="Primary"
      >
        <ul className="mx-auto flex max-w-2xl items-stretch justify-around">
          {ITEMS.map((item) => (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-neon-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]' : ''}>
                      {item.icon(isActive)}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
