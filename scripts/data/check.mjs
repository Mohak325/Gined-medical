/**
 * Checks the built data in src/data. Run with: npm run data:check
 *
 *   ERROR    the data is wrong. The command fails, so don't publish it.
 *   WARNING  the data is usable but has a known gap. Fix it when you can.
 *
 * When you find a new kind of data bug, add a check here so it can't come back.
 */
import fs from "node:fs";
import path from "node:path";

const DATA = path.resolve(import.meta.dirname, "../../src/data");
const load = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8"));

const colleges = load("colleges.json");
const seats = load("seats.json");
const cutoffs = load("cutoffs.json");
const states = load("states.json");
const meta = load("meta.json");

const errors = [];
const warnings = [];

// Records a problem once, with a few examples rather than hundreds of lines.
function expectNone(list, message, bucket = errors) {
  if (list.length > 0) {
    bucket.push(`${message}: ${list.length}. Examples: ${list.slice(0, 3).join("; ")}`);
  }
}

/* ── Structure: is every record well formed? ─────────────────────────── */

const ids = colleges.map((college) => college.id);
const idSet = new Set(ids);
expectNone(ids.filter((id, i) => ids.indexOf(id) !== i), "Duplicate college ids");

const label = (college) => `${college.name} (${college.id})`;
expectNone(colleges.filter((c) => !c.name).map(label), "Colleges with no name");
expectNone(colleges.filter((c) => c.state === "India" || !c.state).map(label), "Colleges with no real state");
expectNone(colleges.filter((c) => c.stateCode === "XX").map(label), "Colleges with an unknown state code");
expectNone(
  colleges.filter((c) => !["Government", "Private", "Deemed", "Central"].includes(c.type)).map(label),
  "Colleges with an unknown type"
);

const stateCodes = states.map((state) => state.code);
expectNone(stateCodes.filter((code, i) => stateCodes.indexOf(code) !== i), "State codes used twice");

const photos = colleges.map((c) => c.hero_image_url).filter(Boolean);
expectNone(photos.filter((url, i) => photos.indexOf(url) !== i), "A photo used for more than one college");

/* ── Links: does everything point at a real college? ─────────────────── */

expectNone([...new Set(seats.filter((s) => !idSet.has(s.collegeId)).map((s) => s.collegeId))], "Seats for an unknown college");
expectNone([...new Set(cutoffs.filter((c) => !idSet.has(c.collegeId)).map((c) => c.collegeId))], "Cutoffs for an unknown college");

/* ── Values: are the numbers possible? ───────────────────────────────── */

const describe = (c) => `${c.collegeId} ${c.course} ${c.quota} ${c.category} R${c.round}`;
expectNone(seats.filter((s) => !(s.seats > 0)).map((s) => s.collegeId), "Seat rows with no seats");
expectNone(
  seats.filter((s) => !["aiq", "state", "management", "nri"].includes(s.quota)).map((s) => s.quota),
  "Seat rows with an unknown quota"
);
expectNone(cutoffs.filter((c) => !(c.openingRank > 0 && c.closingRank > 0)).map(describe), "Cutoffs with an impossible rank");
expectNone(cutoffs.filter((c) => c.openingRank > c.closingRank).map(describe), "Cutoffs where opening rank is above closing rank");
expectNone(cutoffs.filter((c) => c.year !== meta.cutoffYear).map(describe), "Cutoffs with an unexpected year");

const keys = cutoffs.map((c) => `${describe(c)} ${c.quotaDetail} ${c.year}`);
const seen = new Set();
expectNone(keys.filter((key) => seen.has(key) || !seen.add(key)), "Duplicate cutoff rows");

/* ── Spot checks: do we match numbers published independently? ───────── */

function expectEqual(name, actual, expected) {
  if (actual !== expected) errors.push(`Spot check failed, ${name}: expected ${expected}, got ${actual}`);
}

function closingRank(collegeId, category = "general", round = 1) {
  return cutoffs.find(
    (c) => c.collegeId === collegeId && c.course === "MBBS" && c.quota === "aiq" &&
      c.category === category && c.round === round
  )?.closingRank;
}

// Press reports of the 2025 MCC Round 1 result. See data/SOURCES.md.
expectEqual("AIIMS Delhi 2025 R1 general closing rank", closingRank("ug_in014i1"), 48);
expectEqual("Madras Medical College 2025 R1 general closing rank", closingRank("ug_in071g1"), 695);

// NMC's July 2026 release: 1,36,939 MBBS seats, not counting national institutes.
const nonCentralUgSeats = seats
  .filter((s) => s.track === "ug" && colleges.find((c) => c.id === s.collegeId)?.type !== "Central")
  .reduce((sum, s) => sum + s.seats, 0);
expectEqual("UG seats excluding national institutes", nonCentralUgSeats, 136939);

/* ── Known gaps: these don't stop a build, but stay visible ──────────── */

expectNone(colleges.filter((c) => c.city === c.state).map(label), "City is just the state name", warnings);
expectNone(colleges.filter((c) => !c.established).map(label), "Colleges with no founding year", warnings);
expectNone(colleges.filter((c) => !c.university).map(label), "Colleges with no university", warnings);
expectNone(colleges.filter((c) => !c.website).map(label), "Colleges with no website", warnings);

const withCutoffs = new Set(cutoffs.map((c) => c.collegeId));
const ugColleges = colleges.filter((c) => c.ugSeats > 0);
const missing = ugColleges.filter((c) => !withCutoffs.has(c.id));
warnings.push(`UG colleges with no cutoffs: ${missing.length} of ${ugColleges.length}`);
warnings.push(`State-quota cutoffs: ${cutoffs.filter((c) => c.quota === "state").length} rows (none collected yet)`);
warnings.push(`PG cutoffs: ${cutoffs.filter((c) => c.track === "pg").length} rows (none collected yet)`);
warnings.push(`Cutoff years held: ${[...new Set(cutoffs.map((c) => c.year))].join(", ")} (one year cannot show a trend)`);

/* ── Report ──────────────────────────────────────────────────────────── */

for (const warning of warnings) console.log(`WARNING  ${warning}`);
for (const error of errors) console.log(`ERROR    ${error}`);

if (errors.length > 0) {
  console.log(`\nFailed with ${errors.length} error(s). Do not publish this data.`);
  process.exit(1);
}
console.log(`\nPassed, with ${warnings.length} warning(s).`);
