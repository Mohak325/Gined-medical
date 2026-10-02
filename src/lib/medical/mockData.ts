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
  campusSize: string;
  hospitalBeds: number;
  nmcRecognized: boolean;
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
  quota: "aiq" | "state" | "deemed" | "central";
  category: "general" | "obc" | "sc" | "st" | "ews";
  round: 1 | 2 | 3 | 4; // 3 = mop-up, 4 = stray
  year: number;
  openingRank: number;
  closingRank: number;
}

export interface SeatEntry {
  collegeId: string;
  track: "ug" | "pg";
  course: string;
  quota: "aiq" | "state" | "deemed" | "central";
  category: "general" | "obc" | "sc" | "st" | "ews";
  seats: number;
}

import statesData from "@/data/states.json";

export const INDIA_STATES = statesData;
