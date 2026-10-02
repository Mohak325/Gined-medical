"use server";
import type { College, CutoffEntry, SeatEntry } from "./mockData";
import collegesData from "@/data/colleges.json";
import cutoffsData from "@/data/cutoffs.json";
import seatsData from "@/data/seats.json";

export async function getColleges(params: Record<string, any>): Promise<College[]> {
  let results = [...collegesData] as College[];

  const PLACEHOLDERS = [
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1200", // Original modern
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200", // Classic brick
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200", // Graduation
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=1200", // Library/campus
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200", // Modern campus
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=1200", // Medical building
  ];

  results = results.map(c => {
    if (!c.hero_image_url || c.hero_image_url === PLACEHOLDERS[0]) {
      // Deterministic pseudo-random based on id length and characters
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
    "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=1200", // Original modern
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200", // Classic brick
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200", // Graduation
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&q=80&w=1200", // Library/campus
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200", // Modern campus
    "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?auto=format&fit=crop&q=80&w=1200", // Medical building
  ];

  if (!c.hero_image_url || c.hero_image_url === PLACEHOLDERS[0]) {
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
