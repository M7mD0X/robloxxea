import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  signInWithEmail,
  signUp,
  signInWithGitHub,
  signInWithGoogle,
} from '../lib/auth';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

/**
 * AuthModal — a modal dialog with login + signup tabs.
 *
 * Three auth methods:
 * 1. Email + password (signup sends a confirmation email)
 * 2. GitHub OAuth (redirects to GitHub)
 * 3. Google OAuth (redirects to Google)
 *
 * On successful email signup, shows a "check your email" confirmation state.
 * OAuth methods redirect away and back — the AuthProvider picks up the
 * session on return.
 */
export default function AuthModal({ open, onClose, initialMode = 'login' }: AuthModalProps) {
  const { refresh } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setSignupSuccess(false);
      setEmail('');
      setPassword('');
      setDisplayName('');
      setLoading(false);  // Reset loading when modal opens (in case it was stuck)
    }
  }, [open, initialMode]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signUp(email, password, displayName || undefined);
        setSignupSuccess(true);
      } else {
        await signInWithEmail(email, password);
        await refresh();
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      // Make Supabase error messages more user-friendly
      if (msg.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before logging in.');
      } else if (msg.includes('Invalid login credentials')) {
        setError('Wrong email or password.');
      } else if (msg.includes('already registered')) {
        setError('An account with this email already exists. Try logging in instead.');
      } else if (msg.includes('Password should be at least')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'github') await signInWithGitHub();
      else await signInWithGoogle();
      // OAuth redirects the browser away. If the redirect succeeds, the page
      // unloads and the code below never runs. But if it fails (provider not
      // enabled, network error, user presses Back), we need to reset loading
      // so the user isn't stuck on "Please wait…" forever.
      //
      // Give the redirect 5 seconds to start, then reset. If the page is
      // still here after 5s, something went wrong.
      setTimeout(() => setLoading(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : `${provider} login failed`);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm animate-fade-in-up">
        <div className="card p-6">
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/5 hover:text-slate-200"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Logo */}
          <div className="mb-5 flex justify-center">
            <img src={`${import.meta.env.BASE_URL}rx-icon.png`} alt="" className="h-12 w-12 rounded-xl" />
          </div>

          {signupSuccess ? (
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-neon-green/40 bg-neon-green/10 text-neon-green">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-base font-bold text-slate-50">Check your email</h2>
              <p className="mt-2 text-sm text-slate-400">
                We sent a confirmation link to <span className="font-mono text-neon-cyan">{email}</span>.
                Click the link to activate your account, then log in.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSignupSuccess(false);
                  setMode('login');
                }}
                className="btn-neon mt-4 w-full"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="mb-5 flex gap-1 rounded-xl border border-white/10 bg-void-800/50 p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    mode === 'login' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
                    mode === 'signup' ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* OAuth buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleOAuth('github')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-void-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-white/20 hover:bg-void-700 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuth('google')}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-void-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition-all hover:border-white/20 hover:bg-void-700 disabled:opacity-50"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </div>

              {/* Divider */}
              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-[10px] font-medium uppercase tracking-wider text-slate-600">or</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Email form */}
              <form onSubmit={handleEmailSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Display Name <span className="text-slate-600">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>

                {error && (
                  <p className="rounded-lg border border-neon-pink/30 bg-neon-pink/10 p-2 text-xs text-neon-pink">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon w-full disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
                      Please wait…
                    </>
                  ) : mode === 'signup' ? (
                    'Create Account'
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>

              <p className="mt-3 text-center text-[10px] text-slate-600">
                {mode === 'signup'
                  ? 'By signing up, you agree to our terms.'
                  : 'New to RobloxXea? Click "Sign Up" above.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
