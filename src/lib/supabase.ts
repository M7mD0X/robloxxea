import { createClient } from '@supabase/supabase-js';

/**
 * Supabase client — single instance shared across the app.
 *
 * Reads URL + anon key from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * env vars (set in .env for local dev, in the deploy workflow for prod).
 *
 * The anon key is safe to expose in the client bundle — it's protected by
 * Row-Level Security policies on the database side. Public users can only
 * SELECT from the tools table; writes require authentication.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'The app will not be able to load tools. Set these in .env (local) or ' +
    'as GitHub repo secrets (production).'
  );
}

export const supabase = createClient(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
  {
    auth: { persistSession: false },
  }
);
