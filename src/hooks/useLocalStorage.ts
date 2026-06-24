import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorage — generic hook for persisting state to localStorage.
 *
 * - JSON-serializes values automatically.
 * - Syncs across browser tabs via the `storage` event.
 * - Within the same tab, updates propagate via React's normal state mechanism.
 * - Gracefully degrades if localStorage is unavailable (private mode, quota
 *   exceeded, etc.) — falls back to in-memory state with a console warning.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: error reading key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue =
          value instanceof Function ? (value as (p: T) => T)(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        } catch (error) {
          console.warn(`useLocalStorage: error writing key "${key}":`, error);
        }
        return nextValue;
      });
    },
    [key]
  );

  // Cross-tab sync: when another tab writes to the same key, update our state.
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key !== key || e.newValue === null) return;
      try {
        setStoredValue(JSON.parse(e.newValue) as T);
      } catch {
        // ignore parse errors — keep the old value
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [key]);

  return [storedValue, setValue];
}
