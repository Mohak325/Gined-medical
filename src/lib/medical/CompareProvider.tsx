"use client";

import { createContext, useContext, useCallback, useMemo } from "react";
import { useSessionValue } from "./sessionValue";

interface CompareContextValue {
  ids: string[];
  add: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

const STORAGE_KEY = "medical:compare";
export const COMPARE_MAX = 4;
const MAX = COMPARE_MAX;

function parseIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [raw, store] = useSessionValue(STORAGE_KEY, "[]");
  const ids = useMemo(() => parseIds(raw), [raw]);
  // Read storage at call time, so two quick changes in a row both land.
  const update = useCallback(
    (change: (prev: string[]) => string[]) => {
      let current = raw;
      try {
        current = sessionStorage.getItem(STORAGE_KEY) ?? "[]";
      } catch {
        // Storage blocked: fall back to what this render saw.
      }
      store(JSON.stringify(change(parseIds(current))));
    },
    [raw, store]
  );

  const add = useCallback(
    (id: string) => update((prev) => (prev.includes(id) || prev.length >= MAX ? prev : [...prev, id])),
    [update]
  );
  const remove = useCallback((id: string) => update((prev) => prev.filter((i) => i !== id)), [update]);
  const clear = useCallback(() => store("[]"), [store]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  return (
    <CompareContext value={{ ids, add, remove, clear, has, isFull: ids.length >= MAX }}>
      {children}
    </CompareContext>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within <CompareProvider>");
  return ctx;
}
