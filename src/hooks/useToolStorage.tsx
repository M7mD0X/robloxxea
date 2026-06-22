import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { Tool } from '../components/ToolCard';

/**
 * ToolStorage — app-wide state for user-specific data (favorites + recently
 * copied tools). Persisted to localStorage so it survives page reloads and
 * works offline. Shared across all components via React Context so a star
 * toggled on one card instantly updates the Favorites filter on every tab.
 */

const FAVORITES_KEY = 'robloxxea:favorites:v1';
const RECENT_KEY = 'robloxxea:recent:v1';
const MAX_RECENT = 10;

interface RecentEntry {
  id: string;
  tool: Tool;
  timestamp: number;
}

interface ToolStorageValue {
  /** Array of favorited tool IDs. */
  favorites: string[];
  /** Check if a tool is favorited. */
  isFavorite: (id: string) => boolean;
  /** Toggle a tool's favorite state. */
  toggleFavorite: (id: string) => void;
  /** Number of favorited tools. */
  favoritesCount: number;

  /** Recently copied tools, newest first (max 10). */
  recent: RecentEntry[];
  /** Record a copy event — moves the tool to the top of the recent list. */
  addRecent: (tool: Tool) => void;
  /** Clear the entire recent list. */
  clearRecent: () => void;
}

const ToolStorageContext = createContext<ToolStorageValue | null>(null);

export function ToolStorageProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useLocalStorage<string[]>(FAVORITES_KEY, []);
  const [recent, setRecent] = useLocalStorage<RecentEntry[]>(RECENT_KEY, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) =>
        prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      );
    },
    [setFavorites]
  );

  const addRecent = useCallback(
    (tool: Tool) => {
      setRecent((prev) => {
        const entry: RecentEntry = {
          id: tool.id,
          tool,
          timestamp: Date.now(),
        };
        // Remove any existing entry for this tool, then prepend. Cap at MAX_RECENT.
        return [entry, ...prev.filter((e) => e.id !== tool.id)].slice(0, MAX_RECENT);
      });
    },
    [setRecent]
  );

  const clearRecent = useCallback(() => setRecent([]), [setRecent]);

  const value = useMemo<ToolStorageValue>(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      favoritesCount: favorites.length,
      recent,
      addRecent,
      clearRecent,
    }),
    [favorites, isFavorite, toggleFavorite, recent, addRecent, clearRecent]
  );

  return (
    <ToolStorageContext.Provider value={value}>
      {children}
    </ToolStorageContext.Provider>
  );
}

export function useToolStorage(): ToolStorageValue {
  const ctx = useContext(ToolStorageContext);
  if (!ctx) {
    throw new Error('useToolStorage must be used within a ToolStorageProvider');
  }
  return ctx;
}
