import meta from "@/data/meta.json";
import { type CutoffEntry } from "@/lib/medical/mockData";

/**
 * "All rounds" closing ranks.
 *
 * Round 1 is the first allotment. Later rounds fill seats freed by students who upgrade or
 * leave, so they reach further down the rank list. The highest closing rank across every
 * round of a year is the furthest rank that got that seat at all that year.
 *
 * It uses the latest year that has rounds after Round 1 (for PG, the current year may only
 * have Round 1 so far), and only sources that published those rounds.
 */
export interface AllRoundsClosing {
  closingRank: number;
  year: number;
  /** The round that reached furthest down the list. */
  round: number;
  /**
   * The furthest rank reached in Rounds 1 to 3, leaving out stray and extra rounds (4 and up).
   * A stray round often fills one leftover seat far down the list, which is too thin to rely on.
   */
  mainRoundsClosing?: number;
}

/** One seat group: the same college, course, quota and category, in any round. */
export const seatGroupKey = (c: CutoffEntry) =>
  [c.collegeId, c.course, c.quota, c.quotaDetail ?? "", c.state ?? "", c.stateCategory ?? "", c.category].join("|");

export const allRoundsYear = (track: "ug" | "pg"): number => (meta.allRoundsYear as Record<string, number>)[track];

const laterRounds = new Set(meta.laterRounds);
const hasLaterRounds = (c: CutoffEntry) =>
  laterRounds.has(`${c.track}|${c.year}|${c.quota === "state" ? c.state : c.quota}`);

/** Highest closing rank per seat group, over every round of the all-rounds year. */
export function allRoundsIndex(cutoffs: CutoffEntry[]): Map<string, AllRoundsClosing> {
  const index = new Map<string, AllRoundsClosing>();
  for (const c of cutoffs) {
    if (c.year !== allRoundsYear(c.track) || !hasLaterRounds(c)) continue;
    const key = seatGroupKey(c);
    const best = index.get(key) ?? { closingRank: 0, year: c.year, round: c.round };
    if (c.closingRank > best.closingRank) Object.assign(best, { closingRank: c.closingRank, round: c.round });
    if (c.round <= 3) best.mainRoundsClosing = Math.max(best.mainRoundsClosing ?? 0, c.closingRank);
    index.set(key, best);
  }
  return index;
}
