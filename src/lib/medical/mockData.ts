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

// ── COLLEGES ──
export const MOCK_COLLEGES: College[] = [
  {
    id: "c1",
    name: "AIIMS New Delhi",
    city: "New Delhi",
    state: "Delhi",
    stateCode: "DL",
    type: "Central",
    established: 1956,
    campusSize: "214 Acres",
    hospitalBeds: 2478,
    nmcRecognized: true,
    hero_image_url: "https://images.unsplash.com/photo-1598256989800-fea5ce59faeb?auto=format&fit=crop&q=80&w=1200",
    nirfRanking: 1
  },
  {
    id: "c2",
    name: "Christian Medical College (CMC)",
    city: "Vellore",
    state: "Tamil Nadu",
    stateCode: "TN",
    type: "Private",
    established: 1900,
    campusSize: "200 Acres",
    hospitalBeds: 2858,
    nmcRecognized: true,
    hero_image_url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=1200",
    nirfRanking: Math.floor(Math.random() * 20) + 1
  },
  {
    id: "c3",
    name: "Kasturba Medical College",
    city: "Manipal",
    state: "Karnataka",
    stateCode: "KA",
    type: "Deemed",
    established: 1953,
    campusSize: "600 Acres",
    hospitalBeds: 2032,
    nmcRecognized: true,
    hero_image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1200",
    nirfRanking: Math.floor(Math.random() * 20) + 1
  },
  {
    id: "c4",
    name: "Grant Medical College",
    city: "Mumbai",
    state: "Maharashtra",
    stateCode: "MH",
    type: "Government",
    established: 1845,
    campusSize: "44 Acres",
    hospitalBeds: 2844,
    nmcRecognized: true,
    hero_image_url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=1200",
    nirfRanking: Math.floor(Math.random() * 20) + 1
  },
  {
    id: "c5",
    name: "King George's Medical University",
    city: "Lucknow",
    state: "Uttar Pradesh",
    stateCode: "UP",
    type: "Government",
    established: 1911,
    campusSize: "250 Acres",
    hospitalBeds: 4500,
    nmcRecognized: true,
    hero_image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1200",
    nirfRanking: Math.floor(Math.random() * 20) + 1
  }
];

// ── COURSES ──
export const MOCK_COURSES: CollegeCourse[] = [
  // UG
  { collegeId: "c1", track: "ug", course: "MBBS", fees: 1628, bondYears: 0, bondPenalty: 0, totalSeats: 132 },
  { collegeId: "c2", track: "ug", course: "MBBS", fees: 52830, bondYears: 2, bondPenalty: 500000, totalSeats: 100 },
  { collegeId: "c3", track: "ug", course: "MBBS", fees: 1780000, bondYears: 0, bondPenalty: 0, totalSeats: 250 },
  { collegeId: "c4", track: "ug", course: "MBBS", fees: 114300, bondYears: 1, bondPenalty: 1000000, totalSeats: 250 },
  { collegeId: "c5", track: "ug", course: "MBBS", fees: 54600, bondYears: 2, bondPenalty: 1000000, totalSeats: 250 },
  // PG (c1 AIIMS)
  { collegeId: "c1", track: "pg", course: "MD General Medicine", fees: 2125, bondYears: 0, bondPenalty: 0, totalSeats: 25 },
  { collegeId: "c1", track: "pg", course: "MS General Surgery", fees: 2125, bondYears: 0, bondPenalty: 0, totalSeats: 18 },
  // PG (c4 Grant)
  { collegeId: "c4", track: "pg", course: "MD General Medicine", fees: 125000, bondYears: 1, bondPenalty: 5000000, totalSeats: 30 },
];

// ── CUTOFFS (3 years: 2023, 2024, 2025) ──
export const MOCK_CUTOFFS: CutoffEntry[] = [
  // AIIMS Delhi (MBBS, AIQ, General)
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "general", round: 1, year: 2025, openingRank: Math.max(1, 52 - Math.floor(Math.random() * 50)), closingRank: 52 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "general", round: 1, year: 2024, openingRank: Math.max(1, 57 - Math.floor(Math.random() * 50)), closingRank: 57 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "general", round: 1, year: 2023, openingRank: Math.max(1, 55 - Math.floor(Math.random() * 50)), closingRank: 55 },
  
  // AIIMS Delhi (MBBS, AIQ, OBC)
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "obc", round: 1, year: 2025, openingRank: Math.max(1, 245 - Math.floor(Math.random() * 50)), closingRank: 245 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "obc", round: 1, year: 2024, openingRank: Math.max(1, 255 - Math.floor(Math.random() * 50)), closingRank: 255 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "obc", round: 1, year: 2023, openingRank: Math.max(1, 240 - Math.floor(Math.random() * 50)), closingRank: 240 },

  // Grant Medical College (MBBS, AIQ, General) - Harder trend
  { collegeId: "c4", track: "ug", course: "MBBS", quota: "aiq", category: "general", round: 1, year: 2025, openingRank: Math.max(1, 1100 - Math.floor(Math.random() * 50)), closingRank: 1100 },
  { collegeId: "c4", track: "ug", course: "MBBS", quota: "aiq", category: "general", round: 1, year: 2024, openingRank: Math.max(1, 1520 - Math.floor(Math.random() * 50)), closingRank: 1520 },
  { collegeId: "c4", track: "ug", course: "MBBS", quota: "aiq", category: "general", round: 1, year: 2023, openingRank: Math.max(1, 1800 - Math.floor(Math.random() * 50)), closingRank: 1800 },

  // Kasturba Manipal (MBBS, Deemed, General) - Easier trend
  { collegeId: "c3", track: "ug", course: "MBBS", quota: "deemed", category: "general", round: 1, year: 2025, openingRank: Math.max(1, 48000 - Math.floor(Math.random() * 50)), closingRank: 48000 },
  { collegeId: "c3", track: "ug", course: "MBBS", quota: "deemed", category: "general", round: 1, year: 2024, openingRank: Math.max(1, 42000 - Math.floor(Math.random() * 50)), closingRank: 42000 },
  { collegeId: "c3", track: "ug", course: "MBBS", quota: "deemed", category: "general", round: 1, year: 2023, openingRank: Math.max(1, 38000 - Math.floor(Math.random() * 50)), closingRank: 38000 },
];

// ── SEATS ──
export const MOCK_SEATS: SeatEntry[] = [
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "general", seats: 46 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "obc", seats: 32 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "sc", seats: 18 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "st", seats: 9 },
  { collegeId: "c1", track: "ug", course: "MBBS", quota: "aiq", category: "ews", seats: 11 },

  { collegeId: "c4", track: "ug", course: "MBBS", quota: "aiq", category: "general", seats: 38 },
  { collegeId: "c4", track: "ug", course: "MBBS", quota: "state", category: "general", seats: 110 },
];

export const INDIA_STATES = [
  { code: "DL", name: "Delhi" },
  { code: "MH", name: "Maharashtra" },
  { code: "KA", name: "Karnataka" },
  { code: "TN", name: "Tamil Nadu" },
  { code: "UP", name: "Uttar Pradesh" },
  { code: "GJ", name: "Gujarat" },
];
