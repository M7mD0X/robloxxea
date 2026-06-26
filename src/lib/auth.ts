import { supabase } from './supabase';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: Profile | null;
  isAdmin: boolean;
}

/**
 * Sign up with email + password. Supabase will send a confirmation email.
 * The user must click the link before they can log in.
 */
export async function signUp(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { full_name: displayName } : undefined,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Log in with email + password.
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Log in with GitHub OAuth. Opens a popup/redirect.
 */
export async function signInWithGitHub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Log in with Google OAuth. Opens a popup/redirect.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Log out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Fetch the current user's profile (display_name, avatar_url) + admin status.
 * Returns null if not logged in.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;
  const email = session.user.email ?? '';

  // Fetch profile + admin status in parallel
  const [profileRes, adminRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('admins').select('email').eq('email', email).maybeSingle(),
  ]);

  // If profile doesn't exist yet (race condition with trigger), create a minimal one
  let profile = profileRes.data as Profile | null;
  if (!profile) {
    profile = {
      id: userId,
      email,
      display_name: email.split('@')[0],
      avatar_url: null,
    };
  }

  return {
    id: userId,
    email,
    profile,
    isAdmin: !!adminRes.data,
  };
}

/**
 * Update the current user's profile (display name + avatar URL).
 */
export async function updateProfile(updates: { display_name?: string; avatar_url?: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', session.user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}
