"use server";
import type { College, CollegeCourse, CutoffEntry, OfficialFee, SeatEntry } from "./mockData";
import collegesData from "@/data/colleges.json";
import cutoffsData from "@/data/cutoffs.json";
import seatsData from "@/data/seats.json";
import feesData from "@/data/fees.json";
import meta from "@/data/meta.json";
import { allRoundsIndex, allRoundsYear, seatGroupKey } from "./rounds";
import { countLabels, labelRow, type FinderCollege, type FinderQuery, type FinderRow, type LabelCounts } from "./finder";

/** Seat matrix filters, as they arrive from the page address. */
type SeatQuery = { track?: string; quota?: string; state?: string; type?: string; search?: string; course?: string };

export async function getSeats(params: SeatQuery): Promise<(SeatEntry & { college: College })[]> {
  let results = (seatsData as SeatEntry[]).map(seat => {
    const college = (collegesData as College[]).find(c => c.id === seat.collegeId);
    if (!college) return null;
    return {
      ...seat,
      college
    };
  }).filter(Boolean) as (SeatEntry & { college: College })[];

  if (params.track) {
    results = results.filter(s => s.track === params.track);
  }
  if (params.quota && params.quota !== "all") {
    results = results.filter(s => s.quota === params.quota);
  }
  if (params.state) {
    results = results.filter(s => s.college.stateCode === params.state);
  }
  const type = params.type?.toLowerCase();
  if (type && type !== "all") {
    results = results.filter(s => s.college.type.toLowerCase() === type);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      s => s.college.name.toLowerCase().includes(q) || s.college.city.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) => a.college.name.localeCompare(b.college.name));

  return results;
}

// Adding getCutoffs so client components don't have to import the whole JSON directly
type CutoffQuery = Partial<Record<"collegeId" | "track" | "quota" | "state" | "stateCategory" | "category" | "course" | "specialty", string>> & { round?: number; year?: number };

export async function getCutoffs(params: CutoffQuery): Promise<CutoffEntry[]> {
  let results = [...cutoffsData] as CutoffEntry[];

  if (params.collegeId) {
    results = results.filter(c => c.collegeId === params.collegeId);
  }
  if (params.track) {
    results = results.filter(c => c.track === params.track);
  }
  if (params.quota && params.quota !== "all") {
    results = results.filter(c => c.quota === params.quota);
  }
  if (params.state) {
    results = results.filter(c => c.state === params.state);
  }
  if (params.stateCategory) {
    results = results.filter(c => c.stateCategory === params.stateCategory);
  }
  if (params.category && params.category !== "all") {
    results = results.filter(c => c.category === params.category);
  }
  if (params.course) {
    results = results.filter(c => c.course === params.course);
  }
  if (params.specialty) {
    results = results.filter(c => c.specialty === params.specialty);
  }
  if (params.round) {
    results = results.filter(c => c.round === params.round);
  }
  if (params.year) {
    results = results.filter(c => c.year === params.year);
  }

  return results;
}

/** One entry per track and course at a college: total seats, and its published fees. */
export async function getCourses(params: { collegeId: string }): Promise<CollegeCourse[]> {
  const grouped = new Map<string, CollegeCourse>();
  for (const seat of seatsData as SeatEntry[]) {
    if (seat.collegeId !== params.collegeId) continue;
    const key = `${seat.track}_${seat.course}`;
    const entry = grouped.get(key) ?? { collegeId: seat.collegeId, track: seat.track, course: seat.course, totalSeats: 0, officialFees: [] };
    entry.totalSeats += seat.seats;
    grouped.set(key, entry);
  }
  for (const entry of grouped.values()) {
    entry.officialFees = (feesData as OfficialFee[]).filter((fee) => fee.collegeId === entry.collegeId && fee.course === entry.course);
  }
  return [...grouped.values()];
}

/* ── College Finder ───────────────────────────────────────────────────── */

const finderCollege = (c: College): FinderCollege => ({
  id: c.id, name: c.name, city: c.city, state: c.state, stateCode: c.stateCode, type: c.type, established: c.established,
});

/**
 * One row per college and course: its latest Round 1 closing rank for the quota and category,
 * plus how far all rounds reached in the latest year that has later rounds. No rank is sent,
 * so the browser can label these rows for any rank without asking again.
 */
export async function getFinderRows(query: FinderQuery): Promise<FinderRow[]> {
  return finderRows(query);
}

function finderRows(query: FinderQuery): FinderRow[] {
  const isState = query.quota === "state";
  const isPg = query.track === "pg";
  const roundYear = allRoundsYear(query.track);
  const matches = (c: CutoffEntry) =>
    c.track === query.track &&
    c.quota === query.quota &&
    (isState ? c.state === query.state && (!query.stateCategory || c.stateCategory === query.stateCategory) : c.category === query.category) &&
    (isPg ? !query.specialty || c.specialty === query.specialty : c.course === "MBBS");

  const round1: CutoffEntry[] = [];
  const later: CutoffEntry[] = [];
  for (const c of cutoffsData as CutoffEntry[]) {
    if (!matches(c)) continue;
    if (c.year === meta.cutoffYear && c.round === 1) round1.push(c);
    if (c.year === roundYear) later.push(c);
  }
  const reach = allRoundsIndex(later);

  const byId = new Map((collegesData as College[]).map((c) => [c.id, c]));
  const seen = new Set<string>();
  const rows: FinderRow[] = [];
  for (const c of round1) {
    const college = byId.get(c.collegeId);
    const key = `${c.collegeId}|${c.course}`;
    if (!college || seen.has(key)) continue;
    if (query.type && query.type !== "all" && college.type.toLowerCase() !== query.type) continue;
    seen.add(key);
    const final = reach.get(seatGroupKey({ ...c, year: roundYear }));
    rows.push({
      college: finderCollege(college),
      cutoff: { track: c.track, course: c.course, quota: c.quota, year: c.year, round: c.round, closingRank: c.closingRank, state: c.state, stateCategory: c.stateCategory, rankType: c.rankType },
      ...(final ? { allRounds: { closingRank: final.closingRank, year: final.year, round: final.round, mainRoundsClosing: final.mainRoundsClosing } } : {}),
    });
  }
  return rows;
}

/** Label counts for the same rank in every quota, for the finder's quota tabs. */
export async function getQuotaCounts(query: Omit<FinderQuery, "quota">, rank: number) {
  const quotas: FinderQuery["quota"][] = query.track === "pg" ? ["aiq", "deemed", "central"] : ["aiq", "state", "deemed", "central"];
  const out: Partial<Record<FinderQuery["quota"], LabelCounts>> = {};
  for (const quota of quotas) {
    if (quota === "state" && !(query.state && meta.stateCutoffs.includes(query.state))) continue;
    out[quota] = countLabels(finderRows({ ...query, quota }).map((row) => labelRow(row, rank)));
  }
  return out;
}
