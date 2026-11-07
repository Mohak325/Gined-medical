"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * A string kept in browser storage and shared by every component that reads it.
 * The server render (and the first browser render) sees `fallback`, then the stored value.
 * Session values last for the tab; local values persist and follow other tabs' changes.
 */
type Kind = "session" | "local";
const listeners = new Map<string, Set<() => void>>();

const store = (kind: Kind): Storage => (kind === "local" ? localStorage : sessionStorage);

function read(kind: Kind, key: string): string | null {
  try {
    return store(kind).getItem(key);
  } catch {
    return null; // Storage can be blocked, e.g. in some private windows.
  }
}

function useStoredValue(kind: Kind, key: string, fallback: string): [string, (value: string) => void] {
  const id = `${kind}:${key}`;
  const subscribe = useCallback(
    (onChange: () => void) => {
      const set = listeners.get(id) ?? new Set();
      set.add(onChange);
      listeners.set(id, set);
      // Another tab changed local storage.
      const onStorage = (e: StorageEvent) => {
        if (kind === "local" && e.key === key) onChange();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        set.delete(onChange);
        window.removeEventListener("storage", onStorage);
      };
    },
    [id, kind, key]
  );
  const value = useSyncExternalStore(subscribe, () => read(kind, key) ?? fallback, () => fallback);

  const setValue = useCallback(
    (next: string) => {
      try {
        store(kind).setItem(key, next);
      } catch {
        // Without storage the value lasts only until the next read; nothing else to do.
      }
      listeners.get(id)?.forEach((notify) => notify());
    },
    [id, kind, key]
  );

  return [value, setValue];
}

export function useSessionValue(key: string, fallback: string) {
  return useStoredValue("session", key, fallback);
}

export function useLocalValue(key: string, fallback: string) {
  return useStoredValue("local", key, fallback);
}

/** Reads a stored value outside React, e.g. at the moment a form is sent. */
export function readStored(kind: Kind, key: string): string | null {
  return read(kind, key);
}
