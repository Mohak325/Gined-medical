import { MOCK_COLLEGES, type College } from "./mockData";

export async function getColleges(params: any): Promise<College[]> {
  let results = [...MOCK_COLLEGES];

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
  return MOCK_COLLEGES.find((c) => c.id === id) || null;
}

import { MOCK_SEATS, type SeatEntry } from "./mockData";

export async function getSeats(params: any): Promise<(SeatEntry & { college: College })[]> {
  let results = MOCK_SEATS.map(seat => ({
    ...seat,
    college: MOCK_COLLEGES.find(c => c.id === seat.collegeId)!
  }));

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
