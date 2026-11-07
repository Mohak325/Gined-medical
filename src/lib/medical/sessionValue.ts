"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A string kept in sessionStorage and shared by every component that reads it.
 * The server render (and the first browser render) sees `fallback`, then the stored value.
 */
const listeners = new Map<string, Set<() => void>>();

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null; // Storage can be blocked, e.g. in some private windows.
  }
}

export function useSessionValue(key: string, fallback: string): [string, (value: string) => void] {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const set = listeners.get(key) ?? new Set();
      set.add(onChange);
      listeners.set(key, set);
      return () => {
        set.delete(onChange);
      };
    },
    [key]
  );
  const value = useSyncExternalStore(subscribe, () => read(key) ?? fallback, () => fallback);

  const setValue = useCallback(
    (next: string) => {
      try {
        sessionStorage.setItem(key, next);
      } catch {
        // Without storage the value lasts only until the next read; nothing else to do.
      }
      listeners.get(key)?.forEach((notify) => notify());
    },
    [key]
  );

  return [value, setValue];
}
