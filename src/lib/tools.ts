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
export type SortOption = 'name' | 'newest' | 'author';

/**
 * Fetch all tools for a given feed.
 * `sort` controls ordering: name (A-Z), newest (created_at desc), author (A-Z).
 */
export async function fetchTools(
  feed: Feed,
  sort: SortOption = 'name'
): Promise<Tool[]> {
  if (!supabase) return [];
  let query = supabase.from('tools').select('*').eq('feed', feed);
  if (sort === 'newest') {
    query = query.order('created_at', { ascending: false });
  } else if (sort === 'author') {
    query = query.order('author', { ascending: true }).order('name', { ascending: true });
  } else {
    query = query.order('name', { ascending: true });
  }
  const { data, error } = await query;
  if (error) {
    console.error(`[Supabase] fetchTools(${feed}, ${sort}) failed:`, error.message);
    return [];
  }
  return (data ?? []) as Tool[];
}

/**
 * Fetch both feeds in parallel with the same sort applied.
 */
export async function fetchAllTools(
  sort: SortOption = 'name'
): Promise<{ official: Tool[]; community: Tool[] }> {
  const [official, community] = await Promise.all([
    fetchTools('official', sort),
    fetchTools('community', sort),
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

/**
 * Fetch the N most recently added tools across both feeds.
 * Used by the "Recently Added" section on the Main page.
 */
export async function fetchRecentTools(limit: number = 5): Promise<Tool[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    console.error(`[Supabase] fetchRecentTools(${limit}) failed:`, error.message);
    return [];
  }
  return (data ?? []) as Tool[];
}

/**
 * Fetch all distinct categories across both feeds.
 * Used by the category filter chips on the Tools page.
 */
export async function fetchCategories(): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('tools')
    .select('category');
  if (error) {
    console.error('[Supabase] fetchCategories failed:', error.message);
    return [];
  }
  const categories = new Set<string>();
  (data ?? []).forEach((row: { category: string }) => {
    if (row.category) categories.add(row.category);
  });
  return Array.from(categories).sort();
}
