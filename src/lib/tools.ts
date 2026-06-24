import { supabase } from './supabase';

export interface Tool {
  id: string;
  name: string;
  author: string;
  category: string;
  description: string;
  loadstring: string;
  repo?: string;
  icon?: string;
  iconColor?: string;
  tags?: string[];
  feed: 'official' | 'community';
  created_at?: string;
  updated_at?: string;
}

export type Feed = 'official' | 'community';

/**
 * Fetch all tools for a given feed, ordered by name ascending.
 * Returns empty array on error (the caller can show an empty state).
 */
export async function fetchTools(feed: Feed): Promise<Tool[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('feed', feed)
    .order('name', { ascending: true });
  if (error) {
    console.error(`[Supabase] fetchTools(${feed}) failed:`, error.message);
    return [];
  }
  return (data ?? []) as Tool[];
}

/**
 * Fetch both feeds in parallel. Returns { official, community }.
 */
export async function fetchAllTools(): Promise<{ official: Tool[]; community: Tool[] }> {
  const [official, community] = await Promise.all([
    fetchTools('official'),
    fetchTools('community'),
  ]);
  return { official, community };
}

/**
 * Fetch a single tool by ID. Returns null if not found.
 */
export async function fetchTool(id: string): Promise<Tool | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.error(`[Supabase] fetchTool(${id}) failed:`, error.message);
    return null;
  }
  return (data as Tool) ?? null;
}
