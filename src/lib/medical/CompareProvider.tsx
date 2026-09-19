"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

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
const MAX = 3;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  // Hydrate from sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setIds(parsed.slice(0, MAX));
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist on change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  const add = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id) || prev.length >= MAX) return prev;
      return [...prev, id];
    });
  }, []);

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const clear = useCallback(() => setIds([]), []);

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
