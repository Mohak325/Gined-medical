"use client";

import { useCallback, useMemo } from "react";
import { readStored, useLocalValue } from "./sessionValue";

/**
 * The student's shortlist, in preference order, kept in this browser (no account needed).
 * An entry saved from the College Finder remembers the closing rank it was labelled against,
 * so the shortlist can label it the same way later.
 */
export interface ShortlistEntry {
  id: string;
  name: string;
  /** Closing rank the entry was compared with, and what it was (e.g. "All India · General · 2026 R1"). */
  closing?: number;
  basis?: string;
}

export const SHORTLIST_KEY = "medical:shortlist";
const RANK_KEY = "medical:shortlist-rank";
const MAX = 100;

function parse(raw: string): ShortlistEntry[] {
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list.filter((e) => e && typeof e.id === "string" && typeof e.name === "string").slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function useShortlist() {
  const [raw, setRaw] = useLocalValue(SHORTLIST_KEY, "[]");
  const [rankText, setRankText] = useLocalValue(RANK_KEY, "");
  const entries = useMemo(() => parse(raw), [raw]);

  // Read storage at call time, so quick changes in a row all land.
  const update = useCallback(
    (change: (list: ShortlistEntry[]) => ShortlistEntry[]) => setRaw(JSON.stringify(change(parse(readStored("local", SHORTLIST_KEY) ?? raw)))),
    [raw, setRaw]
  );

  const has = useCallback((id: string) => entries.some((e) => e.id === id), [entries]);
  const toggle = useCallback(
    (entry: ShortlistEntry) =>
      update((list) => (list.some((e) => e.id === entry.id) ? list.filter((e) => e.id !== entry.id) : [...list, entry].slice(0, MAX))),
    [update]
  );
  const remove = useCallback((id: string) => update((list) => list.filter((e) => e.id !== id)), [update]);
  const move = useCallback(
    (from: number, to: number) =>
      update((list) => {
        if (to < 0 || to >= list.length) return list;
        const next = [...list];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      }),
    [update]
  );
  const clear = useCallback(() => setRaw("[]"), [setRaw]);

  const rank = Number(rankText.replace(/\D/g, "")) || undefined;
  return { entries, has, toggle, remove, move, clear, rank, setRankText, rankText };
}

/** The shortlist as plain text for the booking form, in preference order. */
export function shortlistText(entries: ShortlistEntry[]): string {
  return entries.map((e, i) => `${i + 1}. ${e.name}`).join("\n").slice(0, 1500);
}
