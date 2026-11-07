/**
 * One small summary per college, for the directory, college pages, compare and "similar
 * colleges". Built once per server process from the JSON data; import only from server code.
 */
import collegesData from "@/data/colleges.json";
import cutoffsData from "@/data/cutoffs.json";
import seatsData from "@/data/seats.json";
import feesData from "@/data/fees.json";
import meta from "@/data/meta.json";
import type { College, CutoffEntry, OfficialFee, SeatEntry } from "./mockData";

export interface CollegeSummary {
  id: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  type: College["type"];
  established: number;
  university?: string;
  website?: string;
  nmcStatus?: string;
  /** MBBS seats in the latest seat matrix, every quota. */
  mbbsSeats: number;
  pgSeats: number;
  /** Latest-year Round 1 All India closing rank for General MBBS seats. */
  aiqClose?: number;
  /** Lowest and highest published yearly MBBS fee, any seat type. */
  feeMin?: number;
  feeMax?: number;
  /** Published yearly MBBS fee for government quota seats, where there is one. */
  feeGovt?: number;
}

let cache: { list: CollegeSummary[]; byId: Map<string, CollegeSummary> } | null = null;

function build() {
  const seats = new Map<string, { mbbs: number; pg: number }>();
  for (const s of seatsData as SeatEntry[]) {
    const entry = seats.get(s.collegeId) ?? { mbbs: 0, pg: 0 };
    if (s.track === "ug" && s.course === "MBBS") entry.mbbs += s.seats;
    if (s.track === "pg") entry.pg += s.seats;
    seats.set(s.collegeId, entry);
  }

  const aiq = new Map<string, number>();
  for (const c of cutoffsData as CutoffEntry[]) {
    if (c.track !== "ug" || c.course !== "MBBS" || c.quota !== "aiq" || c.category !== "general" || c.round !== 1 || c.year !== meta.cutoffYear) continue;
    // Several AIQ rows can exist (sub-quotas); keep the furthest Round 1 reached.
    aiq.set(c.collegeId, Math.max(aiq.get(c.collegeId) ?? 0, c.closingRank));
  }

  const fees = new Map<string, { min: number; max: number; govt?: number }>();
  for (const f of feesData as OfficialFee[]) {
    if (f.course !== "MBBS") continue;
    const entry = fees.get(f.collegeId) ?? { min: Infinity, max: 0 };
    entry.min = Math.min(entry.min, f.annualFee);
    entry.max = Math.max(entry.max, f.annualFee);
    if (f.seatType === "government") entry.govt = Math.min(entry.govt ?? Infinity, f.annualFee);
    fees.set(f.collegeId, entry);
  }

  const list: CollegeSummary[] = (collegesData as College[]).map((c) => {
    const s = seats.get(c.id);
    const f = fees.get(c.id);
    return {
      id: c.id,
      name: c.name,
      city: c.city,
      state: c.state,
      stateCode: c.stateCode,
      type: c.type,
      established: c.established,
      university: c.university,
      website: c.website,
      nmcStatus: c.nmcStatus,
      mbbsSeats: s?.mbbs ?? 0,
      pgSeats: s?.pg ?? 0,
      aiqClose: aiq.get(c.id),
      feeMin: f?.min,
      feeMax: f?.max,
      feeGovt: f?.govt,
    };
  });
  return { list, byId: new Map(list.map((c) => [c.id, c])) };
}

export function collegeSummaries(): CollegeSummary[] {
  cache ??= build();
  return cache.list;
}

export function collegeSummary(id: string): CollegeSummary | undefined {
  cache ??= build();
  return cache.byId.get(id);
}

/**
 * Up to `limit` colleges like this one: same type first, then same state, nearest All India
 * closing rank (or, without one, nearest MBBS seat count).
 */
export function similarColleges(id: string, limit = 4): CollegeSummary[] {
  const self = collegeSummary(id);
  if (!self || self.mbbsSeats === 0) return [];
  const distance = (c: CollegeSummary) =>
    self.aiqClose && c.aiqClose ? Math.abs(Math.log(c.aiqClose / self.aiqClose)) : 2 + Math.abs(c.mbbsSeats - self.mbbsSeats) / 100;
  return collegeSummaries()
    .filter((c) => c.id !== id && c.mbbsSeats > 0)
    .map((c) => ({ c, score: (c.type === self.type ? 0 : 3) + (c.stateCode === self.stateCode ? 0 : 1.5) + distance(c) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map(({ c }) => c);
}
