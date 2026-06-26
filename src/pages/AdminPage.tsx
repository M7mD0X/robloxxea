import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

/**
 * AdminPage — placeholder for the admin panel. Only renders for admin users.
 * We'll add tool management + submission approval here later.
 */
export default function AdminPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
          <span className="font-mono text-xs uppercase tracking-widest">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <section className="rounded-2xl border border-neon-purple/20 bg-gradient-to-br from-neon-purple/10 via-void-700/40 to-neon-cyan/10 p-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-slate-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neon-purple" aria-hidden>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          Admin Panel
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Manage tools, approve submissions, and view analytics. Coming soon.
        </p>
      </section>

      <div className="card p-6">
        <p className="text-sm text-slate-400">
          This is a placeholder. The following features will be built here:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-300">
          <li className="flex items-center gap-2">
            <span className="text-slate-600">•</span> Add / edit / delete tools
          </li>
          <li className="flex items-center gap-2">
            <span className="text-slate-600">•</span> Approve / reject community submissions
          </li>
          <li className="flex items-center gap-2">
            <span className="text-slate-600">•</span> View copy analytics per tool
          </li>
          <li className="flex items-center gap-2">
            <span className="text-slate-600">•</span> Manage admin users
          </li>
        </ul>
      </div>
    </div>
  );
}
