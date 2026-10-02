"use server";
import type { College, CutoffEntry, SeatEntry } from "./mockData";
import collegesData from "@/data/colleges.json";
import cutoffsData from "@/data/cutoffs.json";
import seatsData from "@/data/seats.json";

export async function getColleges(params: Record<string, any>): Promise<College[]> {
  let results = [...collegesData] as College[];

  // Reliable, fast SVG gradients to replace Unsplash (which can be rate-limited/blocked)
  const PLACEHOLDERS = [
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a365d"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g1)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g2)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g3" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="%234c1d95"/><stop offset="100%" stop-color="%237c3aed"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g3)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g4" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%237f1d1d"/><stop offset="100%" stop-color="%23dc2626"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g4)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g5)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
  ];

  results = results.map(c => {
    // If it's a placeholder or doesn't have an image, apply SVG
    if (!c.hero_image_url || c.hero_image_url.includes("images.unsplash.com")) {
      const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return { ...c, hero_image_url: PLACEHOLDERS[hash % PLACEHOLDERS.length] };
    }
    return c;
  });

  if (params.type && params.type !== "all") {
    results = results.filter((c) => c.type.toLowerCase() === params.type.toLowerCase());
  }
  if (params.state) {
    results = results.filter((c) => c.stateCode.toLowerCase() === params.state.toLowerCase());
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
    );
  }

  // Sort
  if (params.sort === "name_desc") {
    results.sort((a, b) => b.name.localeCompare(a.name));
  } else if (params.sort === "established") {
    results.sort((a, b) => a.established - b.established);
  } else if (params.sort === "nirf_asc") {
    results.sort((a, b) => (a.nirfRanking || 9999) - (b.nirfRanking || 9999));
  } else {
    // name_asc is default
    results.sort((a, b) => a.name.localeCompare(b.name));
  }

  return results;
}

export async function getCollegeById(id: string): Promise<College | null> {
  const c = (collegesData as College[]).find((c) => c.id === id);
  if (!c) return null;

  const PLACEHOLDERS = [
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a365d"/><stop offset="100%" stop-color="%232563eb"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g1)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23064e3b"/><stop offset="100%" stop-color="%23059669"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g2)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g3" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="%234c1d95"/><stop offset="100%" stop-color="%237c3aed"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g3)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g4" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%237f1d1d"/><stop offset="100%" stop-color="%23dc2626"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g4)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
    `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e3a8a"/><stop offset="100%" stop-color="%233b82f6"/></linearGradient></defs><rect width="100%" height="100%" fill="url(%23g5)"/><text x="50%" y="50%" font-family="sans-serif" font-size="48" font-weight="bold" fill="%23ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">Medical Campus</text></svg>`,
  ];

  if (!c.hero_image_url || c.hero_image_url.includes("images.unsplash.com")) {
    const hash = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return { ...c, hero_image_url: PLACEHOLDERS[hash % PLACEHOLDERS.length] };
  }
  return c;
}

export async function getSeats(params: Record<string, any>): Promise<(SeatEntry & { college: College })[]> {
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
  if (params.category && params.category !== "all") {
    results = results.filter(s => s.category === params.category);
  }
  if (params.state) {
    results = results.filter(s => s.college.stateCode === params.state);
  }
  if (params.type && params.type !== "all") {
    results = results.filter(s => s.college.type.toLowerCase() === params.type.toLowerCase());
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
export async function getCutoffs(params: Record<string, any>): Promise<CutoffEntry[]> {
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
  if (params.category && params.category !== "all") {
    results = results.filter(c => c.category === params.category);
  }
  if (params.round) {
    results = results.filter(c => c.round === params.round);
  }
  if (params.year) {
    results = results.filter(c => c.year === params.year);
  }

  return results;
}

export async function getCourses(params: Record<string, any>) {
  // Derive courses from seats data dynamically
  let results = (seatsData as SeatEntry[]).filter(s => s.collegeId === params.collegeId);
  
  const college = await getCollegeById(params.collegeId);
  if (!college) return [];

  // Group by track and course to get total seats
  const grouped = results.reduce((acc, curr) => {
    const key = `${curr.track}_${curr.course}`;
    if (!acc[key]) {
      acc[key] = {
        collegeId: curr.collegeId,
        track: curr.track,
        course: curr.course,
        totalSeats: 0,
      };
    }
    acc[key].totalSeats += curr.seats;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(grouped).map((course: any) => {
    // Generate estimated fees based on college type
    let fees = 0;
    let bondYears = 0;
    let bondPenalty = 0;

    if (college.type === "Government") {
      fees = 50000;
      bondYears = 1;
      bondPenalty = 1000000;
    } else if (college.type === "Central") {
      fees = 15000;
      bondYears = 0;
    } else if (college.type === "Deemed") {
      fees = 2000000; // 20 LPA
      bondYears = 0;
    } else {
      // Private
      fees = 1500000; // 15 LPA
      bondYears = 1;
      bondPenalty = 500000;
    }

    return {
      ...course,
      fees,
      bondYears,
      bondPenalty
    };
  });
}
