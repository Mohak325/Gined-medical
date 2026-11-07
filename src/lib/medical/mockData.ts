/**
 * Mock Data — PRD v2 §8
 * Data structure completely rebuilt for v2 features.
 */

export interface College {
  id: string;
  name: string;
  city: string;
  state: string;
  stateCode: string;
  type: "Government" | "Private" | "Deemed" | "Central";
  established: number;
  campusSize?: string;
  hospitalBeds?: number;
  nmcStatus?: string;
  nmcRecognized: boolean;
  university?: string;
  website?: string;
  address?: string;
  ugSeats?: number;
  pgSeats?: number;
  /** A freely licensed photo from Wikimedia Commons, linked rather than copied (see scripts/data/photos.mjs). */
  photo?: CollegePhoto | null;
  nirfRanking?: number;
  branches?: string[];
  totalSeats?: number;
}

export interface CollegePhoto {
  /** Thumbnail address with {w} for the width; Wikimedia serves only standard widths. */
  thumb?: string | null;
  /** The original file, for photos too small to have thumbnails. */
  src?: string;
  width: number;
  height: number;
  /** Who took it and under what licence: both must be shown next to the photo. */
  author: string | null;
  license: string;
  licenseUrl: string | null;
  /** The photo's page on Wikimedia Commons. */
  page: string;
}

export interface OfficialFee {
  collegeId: string;
  course: string;
  seatType: "government" | "private" | "management" | "nri";
  annualFee: number;      // Rupees per year, as published
  year: number;
  source: string;
  sourceUrl?: string;     // The document, where it has a stable address
  state: string;
}

export interface CollegeCourse {
  collegeId: string;
  track: "ug" | "pg";
  course: string;
  officialFees: OfficialFee[]; // Published fees by seat type, newest year only
  totalSeats: number;
}

export interface CutoffEntry {
  collegeId: string;
  track: "ug" | "pg";
  course: string;
  /** PG only: the specialty's usual name, grouping spellings that differ by college. */
  specialty?: string;
  /** "special" quotas have their own eligibility rules and are left out of predictions. */
  quota: "aiq" | "state" | "deemed" | "central" | "special" | "nri" | "management";
  category: string; // general, obc, sc, st, ews, the same with _pwd, or state_only for a state's own codes
  round: number; // 1 to 3; 4 and 5 are stray or extra rounds, which differ by source
  year: number;
  openingRank: number;
  closingRank: number;
  allotted?: number;
  quotaDetail?: string; // The quota label used by the source
  state?: string; // State code, for state counselling
  seatType?: "government" | "private" | "nri" | "others"; // The state's seat type
  stateCategory?: string; // The state's own seat code, e.g. "2AG"
  rankType?: "state"; // Set when ranks are the state's own, not All India ranks
}

export interface SeatEntry {
  collegeId: string;
  track: "ug" | "pg";
  course: string;
  quota: "aiq" | "state" | "management" | "nri";
  seats: number;
}

import statesData from "@/data/states.json";

export const INDIA_STATES = statesData;
