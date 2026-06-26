import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from '../lib/auth';
import { Link } from 'react-router-dom';

interface UserMenuProps {
  onLoginClick: () => void;
}

/**
 * UserMenu — shown in the sidebar footer.
 * - Logged out: shows a "Log In" button
 * - Logged in: shows avatar + name, dropdown with Profile / Admin (if admin) / Log Out
 */
export default function UserMenu({ onLoginClick }: UserMenuProps) {
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-600">
        <div className="h-3 w-3 animate-spin rounded-full border border-slate-600 border-t-slate-400" />
        Loading…
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={onLoginClick}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-neon-cyan/10 px-3 py-2 text-xs font-semibold text-neon-cyan transition-all hover:bg-neon-cyan/20 hover:shadow-glow"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        Log In
      </button>
    );
  }

  const displayName = user.profile?.display_name || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors hover:bg-white/5"
      >
        {user.profile?.avatar_url ? (
          <img src={user.profile.avatar_url} alt="" className="h-7 w-7 rounded-full" />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon-cyan/15 font-mono text-[10px] font-bold text-neon-cyan">
            {initials}
          </div>
        )}
        <div className="min-w-0 flex-1 text-left">
          <p className="truncate font-semibold text-slate-200">{displayName}</p>
          <p className="truncate text-[10px] text-slate-500">{user.email}</p>
        </div>
        <svg className={`text-slate-500 transition-transform ${menuOpen ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute bottom-full left-0 mb-1 w-full overflow-hidden rounded-lg border border-white/10 bg-void-800/95 py-1 backdrop-blur-md">
          {user.isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-neon-purple transition-colors hover:bg-white/5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Admin Panel
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              await signOut();
              setMenuOpen(false);
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-neon-pink transition-colors hover:bg-white/5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
