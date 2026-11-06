'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

const listeners = new Map();

const getKeyListeners = (key) => {
  if (!listeners.has(key)) listeners.set(key, new Set());
  return listeners.get(key);
};

const notify = (key) => {
  getKeyListeners(key).forEach((listener) => listener());
};

const getServerSnapshot = () => null;

// Parsed values are cached against the exact raw string they came from.
//
// Without this, `JSON.parse` ran on every single render and returned a brand
// new object each time. That new identity invalidated the `useMemo` in
// CartContext / AuthContext, so every context consumer re-rendered on every
// render of any ancestor — the Navbar and every ProductCard included.
// Caching by raw string makes the value referentially stable until
// localStorage actually changes.
const parseCache = new Map();

const parse = (key, raw) => {
  const cached = parseCache.get(key);
  if (cached && cached.raw === raw) return cached.value;

  let value;
  try {
    value = JSON.parse(raw);
  } catch {
    // Corrupt entry — treat it as absent rather than throwing during render.
    value = undefined;
  }

  parseCache.set(key, { raw, value });
  return value;
};

export default function useLocalStorageState(key, defaultValue) {
  const subscribe = useCallback(
    (callback) => {
      const keyListeners = getKeyListeners(key);
      keyListeners.add(callback);

      const onStorage = (event) => {
        if (event.key === key) callback();
      };
      window.addEventListener('storage', onStorage);

      return () => {
        keyListeners.delete(callback);
        window.removeEventListener('storage', onStorage);
      };
    },
    [key]
  );

  const getSnapshot = useCallback(() => localStorage.getItem(key), [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(() => {
    if (raw === null || raw === undefined) return defaultValue;
    const parsed = parse(key, raw);
    return parsed === undefined ? defaultValue : parsed;
    // `defaultValue` is intentionally excluded: callers pass literals like `[]`
    // or `{}` inline, so including it would defeat the memo on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, raw]);

  const setValue = useCallback(
    (next) => {
      const serialized = JSON.stringify(next);
      // Seed the cache with the value we already have in hand so the very next
      // render reuses this identity instead of re-parsing.
      parseCache.set(key, { raw: serialized, value: next });
      localStorage.setItem(key, serialized);
      notify(key);
    },
    [key]
  );

  return [value, setValue];
}
