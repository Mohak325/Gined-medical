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
  hero_image_url: string | null;
  nirfRanking?: number;
  branches?: string[];
  totalSeats?: number;
}

export interface CollegeCourse {
  collegeId: string;
  track: "ug" | "pg";
  course: string;
  fees: number;           // Per year
  bondYears: number;      // 0 if none
  bondPenalty: number;    // 0 if none
  totalSeats: number;
}

export interface CutoffEntry {
  collegeId: string;
  track: "ug" | "pg";
  course: string;
  /** "special" quotas have their own eligibility rules and are left out of predictions. */
  quota: "aiq" | "state" | "deemed" | "central" | "special" | "nri" | "management";
  category: string; // general, obc, sc, st, ews, the same with _pwd, or state_only for a state's own codes
  round: 1 | 2 | 3;
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
