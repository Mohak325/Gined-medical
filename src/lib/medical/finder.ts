/**
 * College Finder rows and labels.
 *
 * The server sends one row per college and course for a quota and category, with no rank in
 * the request. The browser labels the rows for any rank, so changing the rank (or dragging the
 * "what if" slider) needs no new request.
 */
import { computeConfidence, type ConfidenceLevel } from "./confidence";
import type { College, CutoffEntry } from "./mockData";

export type FinderCollege = Pick<College, "id" | "name" | "city" | "state" | "stateCode" | "type" | "established">;
export type FinderCutoff = Pick<CutoffEntry, "track" | "course" | "quota" | "year" | "round" | "closingRank" | "state" | "stateCategory" | "rankType">;

export interface FinderRow {
  college: FinderCollege;
  cutoff: FinderCutoff;
  /** How far the latest year with later rounds reached, across all its rounds. */
  allRounds?: { closingRank: number; year: number; round: number; mainRoundsClosing?: number };
}

export interface LabelledRow extends FinderRow {
  confidence: ConfidenceLevel;
  /** Round 1 closed before the rank, but Round 2 or 3 reached it. */
  laterRounds: boolean;
}

export type LabelCounts = Record<ConfidenceLevel, number>;

/**
 * The label comes from Round 1. A seat Round 1 never reached, but Round 2 or 3 did, shows as
 * Ambitious instead of being hidden as a long shot; no label gets more hopeful than that. The
 * stray round doesn't count here: it often fills one leftover seat far down the list.
 */
export function labelRow(row: FinderRow, rank: number): LabelledRow {
  const main = row.allRounds?.mainRoundsClosing;
  const laterRounds = !!main && rank > row.cutoff.closingRank && rank <= main;
  let confidence = computeConfidence(rank, row.cutoff.closingRank);
  if (laterRounds && confidence === "longshot") confidence = "ambitious";
  return { ...row, confidence, laterRounds };
}

const ORDER: Record<ConfidenceLevel, number> = { safe: 0, moderate: 1, ambitious: 2, longshot: 3 };

export type FinderSort = "confidence_desc" | "cutoff_asc" | "cutoff_desc";

export function labelAll(rows: FinderRow[], rank: number, sort: FinderSort = "confidence_desc"): LabelledRow[] {
  const labelled = rows.map((row) => labelRow(row, rank));
  labelled.sort((a, b) => {
    if (sort === "cutoff_desc") return b.cutoff.closingRank - a.cutoff.closingRank;
    if (sort === "cutoff_asc") return a.cutoff.closingRank - b.cutoff.closingRank;
    const byLabel = ORDER[a.confidence] - ORDER[b.confidence];
    if (byLabel !== 0) return byLabel;
    // Seats only a later round reached come after the ones Round 1 reached.
    if (a.laterRounds !== b.laterRounds) return a.laterRounds ? 1 : -1;
    return a.cutoff.closingRank - b.cutoff.closingRank;
  });
  return labelled;
}

export function countLabels(rows: { confidence: ConfidenceLevel }[]): LabelCounts {
  const counts: LabelCounts = { safe: 0, moderate: 0, ambitious: 0, longshot: 0 };
  for (const row of rows) counts[row.confidence]++;
  return counts;
}

/** What the finder asks the server for: everything except the rank. */
export interface FinderQuery {
  track: "ug" | "pg";
  quota: "aiq" | "state" | "deemed" | "central";
  category?: string;
  state?: string;
  stateCategory?: string;
  /** PG: one specialty; none means every specialty. */
  specialty?: string;
  type?: string;
}
