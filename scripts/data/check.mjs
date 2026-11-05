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

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "src/data");
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

const describe = (c) => `${c.collegeId} ${c.course} ${c.quota} ${c.stateCategory ?? c.category} R${c.round}`;
expectNone(seats.filter((s) => !(s.seats > 0)).map((s) => s.collegeId), "Seat rows with no seats");
expectNone(
  seats.filter((s) => !["aiq", "state", "management", "nri"].includes(s.quota)).map((s) => s.quota),
  "Seat rows with an unknown quota"
);
expectNone(cutoffs.filter((c) => !(c.openingRank > 0 && c.closingRank > 0)).map(describe), "Cutoffs with an impossible rank");
expectNone(cutoffs.filter((c) => c.openingRank > c.closingRank).map(describe), "Cutoffs where opening rank is above closing rank");
expectNone(cutoffs.filter((c) => !meta.cutoffYears.includes(c.year)).map(describe), "Cutoffs with an unexpected year");
expectNone(cutoffs.filter((c) => c.round < 1 || c.round > 5).map(describe), "Cutoffs with an unknown round");
expectNone(cutoffs.filter((c) => !(c.allotted > 0)).map(describe), "Cutoffs with no students behind them");
expectNone(cutoffs.filter((c) => c.quota === "state" && !(c.state && c.stateCategory)).map(describe), "State cutoffs with no state or category");

const keys = cutoffs.map((c) => `${describe(c)} ${c.quotaDetail} ${c.year}`);
const seen = new Set();
expectNone(keys.filter((key) => seen.has(key) || !seen.add(key)), "Duplicate cutoff rows");

/* ── Spot checks: do we match numbers published independently? ───────── */

function expectEqual(name, actual, expected) {
  if (actual !== expected) errors.push(`Spot check failed, ${name}: expected ${expected}, got ${actual}`);
}

function closingRank(collegeId, year, category = "general", round = 1) {
  return cutoffs.find(
    (c) => c.collegeId === collegeId && c.course === "MBBS" && c.quota === "aiq" &&
      c.category === category && c.round === round && c.year === year
  )?.closingRank;
}

// Press reports of the 2025 MCC Round 1 result. See data/SOURCES.md.
expectEqual("AIIMS Delhi 2025 R1 general closing rank", closingRank("ug_in014i1", 2025), 48);
expectEqual("Madras Medical College 2025 R1 general closing rank", closingRank("ug_in071g1", 2025), 695);
// Press reports of the 2026 MCC Round 1 result, and the 2025 figure beside it.
expectEqual("AIIMS Delhi 2026 R1 general closing rank", closingRank("ug_in014i1", 2026), 52);
expectEqual("Maulana Azad 2026 R1 general closing rank", closingRank("ug_in073g1", 2026), 129);
expectEqual("Maulana Azad 2025 R1 general closing rank", closingRank("ug_in073g1", 2025), 103);

// NMC's July 2026 release: 1,36,939 MBBS seats, not counting national institutes.
const nonCentralUgSeats = seats
  .filter((s) => s.track === "ug" && colleges.find((c) => c.id === s.collegeId)?.type !== "Central")
  .reduce((sum, s) => sum + s.seats, 0);
expectEqual("UG seats excluding national institutes", nonCentralUgSeats, 136939);

/* ── Second opinion: does a separate compilation of the same PDFs agree? ─ */

// NexDoc worked out 2025 closing ranks from the same MCC PDFs, separately from us. It often
// files a row under the wrong college (Career Institute got King George's ranks), and it
// puts dental rows on medical colleges, so its college isn't trusted. But every medical
// result it holds should exist somewhere in our data. If many don't, our extraction broke.
const NEXDOC_CATEGORY = { OPEN: "general", OBC: "obc", SC: "sc", ST: "st", EWS: "ews", OPEN_PWD: "general_pwd", OBC_PWD: "obc_pwd", SC_PWD: "sc_pwd", ST_PWD: "st_pwd", EWS_PWD: "ews_pwd" };
const nexdoc = JSON.parse(fs.readFileSync(path.join(ROOT, "data/raw/nexdoc/ug_colleges_aiq_mapping.json"), "utf8"));
const groupKey = (detail, category, round, rank) => [detail, category, round, rank].join("|");
const ourResults = new Set(
  cutoffs.filter((c) => c.year === 2025 && c.course === "MBBS").map((c) => groupKey(c.quotaDetail, c.category, c.round, c.closingRank))
);
let found = 0;
const notFound = [];
for (const college of nexdoc) {
  for (const row of college.aiq_cutoffs_raw) {
    if (row.course !== "MBBS" || !NEXDOC_CATEGORY[row.category] || ["CW_ARMED_FORCES", "FOREIGN"].includes(row.quota)) continue;
    for (const round of [1, 2, 3]) {
      const rank = row[`r${round}_closing_rank`];
      if (rank == null) continue;
      if (ourResults.has(groupKey(row.quota, NEXDOC_CATEGORY[row.category], round, rank))) found++;
      else notFound.push(`${college.college_name} ${row.quota} ${row.category} R${round}: ${rank}`);
    }
  }
}
console.log(`NexDoc's 2025 medical results also found in MCC's PDFs: ${found} of ${found + notFound.length}`);
expectNone(notFound.length > 10 ? notFound : [], "NexDoc results missing from our 2025 data");

// Press counts of students allotted a seat, which test that no PDF rows were lost.
const extract = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/mcc/extract-report.json"), "utf8"));
expectEqual("2025 Round 1 students allotted, per Careers360", extract["2025-r1"].written, 26608);
for (const [name, result] of Object.entries(extract)) {
  if (result.rejected > 0) errors.push(`${name}: ${result.rejected} rows could not be read from the PDF`);
  if (result.snoGapCount > 0) errors.push(`${name}: serial numbers skip, so rows may be missing`);
  if (result.rankDropCount > 0) errors.push(`${name}: ranks go backwards, so a rank was misread`);
}

/* ── One answer per question ─────────────────────────────────────────── */

// The rank predictor looks up college + course + quota + category + round + year and uses
// the first row. Two rows there would give an arbitrary answer.
const predictorKeys = cutoffs
  .filter((c) => c.quota !== "special" && c.category !== "state_only")
  .map((c) => [c.collegeId, c.course, c.quota, c.category, c.round, c.year].join(" "))
  .concat(cutoffs.filter((c) => c.quota === "state").map((c) => [c.collegeId, c.state, c.stateCategory, c.round, c.year].join(" ")));
const predictorSeen = new Set();
expectNone(
  predictorKeys.filter((key) => predictorSeen.has(key) || !predictorSeen.add(key)),
  "Two cutoffs compete for one rank-predictor lookup",
  warnings
);

/* ── Karnataka: do we match KEA's published figures? ─────────────────── */

const keaClosing = (collegeId, code = "GM", year = 2026) =>
  cutoffs.find((c) => c.state === "KA" && c.collegeId === collegeId && c.stateCategory === code && c.round === 1 && c.year === year)?.closingRank;

// neet2seat's table of 2026 Round 1 closing ranks. See data/SOURCES.md.
expectEqual("KEA Bangalore Medical College", keaClosing("ug_ka001g1"), 2655);
expectEqual("KEA Mysore Medical College", keaClosing("ug_ka026g1"), 6539);
expectEqual("KEA Shri Atal Bihari Vajpayee", keaClosing("ug_ka032g1"), 8022);
expectEqual("KEA Kasturba Mangalore", keaClosing("ug_ka021p3"), 9426);
expectEqual("KEA ESIC Bangalore", keaClosing("ug_ka010g1"), 11745);
expectEqual("KEA Ramaiah", keaClosing("ug_ka025p3"), 12100);
expectEqual("KEA JSS Mysore", keaClosing("ug_ka016p3"), 12456);
expectEqual("KEA Karnataka Medical College Hubballi", keaClosing("ug_ka020g1"), 12840);
expectEqual("KEA Kempegowda", keaClosing("ug_ka023p3"), 18046);

const keaReport = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/kea/extract-report.json"), "utf8"));
expectEqual("KEA 2026 Round 1 students allotted, per neet2seat", keaReport["2026-r1"].written, 11875);
for (const [name, result] of Object.entries(keaReport)) {
  if (result.rejected > 0) errors.push(`KEA ${name}: ${result.rejected} rows could not be read from the PDF`);
  if (result.snoGapCount > 0) errors.push(`KEA ${name}: serial numbers skip, so rows may be missing`);
  if (result.rankDropCount > 0) warnings.push(`KEA ${name}: ranks go backwards ${result.rankDropCount} times`);
}

// A college can't fill more seats in Round 1 than it has. More means a wrong college match.
const keaFirstRound = new Map();
for (const c of cutoffs.filter((c) => c.state === "KA" && c.year === 2026 && c.round === 1)) {
  keaFirstRound.set(c.collegeId, (keaFirstRound.get(c.collegeId) ?? 0) + c.allotted);
}
expectNone(
  [...keaFirstRound]
    .filter(([id, count]) => { const seats = colleges.find((c) => c.id === id)?.ugSeats ?? 0; return seats > 0 && count > seats * 1.1; })
    .map(([id, count]) => `${id} allotted ${count}, seats ${colleges.find((c) => c.id === id).ugSeats}`),
  "Karnataka colleges with more Round 1 students than seats",
  warnings
);

/* ── Other states: do we match what they publish themselves? ────────── */

const stateReport = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/extract-report.json"), "utf8"));
for (const [name, result] of Object.entries(stateReport)) {
  if (result.rejected > 0) errors.push(`${name}: ${result.rejected} rows could not be read from the PDF`);
  if (result.written === 0) errors.push(`${name}: no rows were read from the PDF`);
}

// Telangana's counts, as reported by neet2seat.
{
  const tg = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/tg-report.json"), "utf8"));
  for (const [name, result] of Object.entries(tg)) {
    if (result.rejected > 0) errors.push(`${name}: ${result.rejected} rows could not be read from the PDF`);
  }
  expectEqual("Telangana 2026 Phase 1 MBBS seats, per neet2seat", tg["TG-2026-cq-r1"].written, 4734);
  expectEqual("Telangana 2026 Phase 2 MBBS seats, per neet2seat", tg["TG-2026-cq-r2"].written, 6181);

  // neet2seat's table of the last All India Rank allotted in each category, statewide, in Phase 1.
  // Apart from its Open female row, the table covers general seats, not female ones.
  const lastInState = (...codes) => Math.max(0, ...cutoffs
    .filter((c) => c.state === "TG" && c.year === 2026 && c.round === 1 && codes.includes(c.stateCategory))
    .map((c) => c.closingRank));
  expectEqual("Telangana EWS last rank", lastInState("EWS-G"), 90014);
  expectEqual("Telangana Open general last rank", lastInState("OPEN-G"), 164912);
  expectEqual("Telangana Open female last rank", lastInState("OPEN-F"), 171983);
  expectEqual("Telangana BC-D last rank", lastInState("BCD-G"), 168391);
  expectEqual("Telangana BC-B last rank", lastInState("BCB-G"), 191895);
  expectEqual("Telangana BC-E last rank", lastInState("BCE-G"), 181262);
  expectEqual("Telangana Minority last rank", lastInState("MIN-G"), 194811);
  expectEqual("Telangana ST last rank", lastInState("ST-G"), 239392);
  expectEqual("Telangana SC group 3 last rank", lastInState("SC3-G"), 239994);
  expectEqual("Telangana BC-C last rank", lastInState("BCC-G"), 267387);
  expectEqual("Telangana SC group 2 last rank", lastInState("SC2-G"), 294966);
  expectEqual("Telangana BC-A last rank", lastInState("BCA-G"), 333056);
}

// Andhra Pradesh's lists are read by their own script.
{
  const ap = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/ap-report.json"), "utf8"));
  for (const [name, result] of Object.entries(ap.files)) {
    if (result.rejected > 0) errors.push(`${name}: ${result.rejected} rows could not be read from the PDF`);
  }
  expectEqual("Andhra Pradesh 2026 management quota Phase 1 seats, per neet2seat", ap.files["AP-2026-mq-r1"].written, 1629);
}

// Gujarat publishes its last merit number for each college in Round 1. Compare with ours.
{
  const gj = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/gj-report.json"), "utf8"));
  expectEqual("Gujarat 2026 Round 1 students allotted, per neet2seat", gj["GJ-2026-r1"].written, 7459);
  for (const [name, result] of Object.entries(gj)) {
    if (result.rejected > 0) errors.push(`${name}: ${result.rejected} rows could not be read from the PDF`);
  }
  const lines = fs.readFileSync(path.join(ROOT, "data/extracted/states/GJ-2026-r1.csv"), "utf8").split(/\r?\n/).slice(1).filter(Boolean);
  const highest = {};
  for (const line of lines) {
    const c = line.split(",");
    if (c[5] === "GQ" && c[3] === "OP") highest[c[1]] = Math.max(highest[c[1]] ?? 0, Number(c[8]));
  }
  const official = Object.entries(gj["GJ-2026-lastmerit-r1"].openMerit);
  const same = official.filter(([label, merit]) => highest[label] === Number(merit)).length;
  console.log(`Gujarat's own 2026 Round 1 last merit numbers matched: ${same} of ${official.length}`);
  if (same < official.length * 0.95) errors.push(`Only ${same} of ${official.length} Gujarat last merit numbers match`);
}

// Careers360 reported 5,666 MBBS and BDS seats in Rajasthan's Round 1.
expectEqual("Rajasthan 2026 Round 1 students allotted", stateReport["RJ-2026-r1"].written, 5666);

// Bihar publishes its own closing ranks for Round 1, so we can compare every one with ours.
{
  const official = fs.readFileSync(path.join(ROOT, "data/extracted/states/BR-2026-official-r1.csv"), "utf8").split(/\r?\n/).slice(1).filter(Boolean);
  const ours = cutoffs.filter((c) => c.state === "BR" && c.year === 2026 && c.round === 1);
  const closing = new Set(ours.map((c) => `${c.stateCategory}|${c.closingRank}`));
  let same = 0;
  const differ = [];
  for (const line of official) {
    const match = line.match(/^([\d.]+),(?:"[^"]*"|[^,]*),([^,]*),([^,]*),([^,]*),/);
    if (!match || !/m\.?b\.?b\.?s/i.test(match[2])) continue;
    const base = match[3].trim();
    if (!["UR", "EWS", "BC", "EBC", "SC", "ST"].includes(base)) continue;
    const code = /female/i.test(match[4]) ? `${base}-F` : base;
    if (closing.has(`${code}|${Number(match[1])}`)) same++;
    else differ.push(`${code} ${match[1]}`);
  }
  console.log(`Bihar's own 2026 Round 1 closing ranks also found in ours: ${same} of ${same + differ.length}`);
  if (same === 0 || differ.length > (same + differ.length) * 0.05) {
    errors.push(`Bihar's published closing ranks don't match ours: ${differ.length} differ. Examples: ${differ.slice(0, 4).join("; ")}`);
  }
}

/* ── A college shouldn't change character between years ──────────────── */

// A closing rank that moves more than 4 times over in a year usually means a wrong college
// match. Small groups can move a lot for real reasons, so only larger ones are compared.
const firstRound = (year) => new Map(
  cutoffs
    .filter((c) => c.year === year && c.round === 1 && c.course === "MBBS" && c.quota === "aiq" && c.category === "general" && c.allotted >= 5)
    .map((c) => [c.collegeId, c.closingRank])
);
const before = firstRound(2025);
const jumps = [...firstRound(2026)]
  .filter(([id, rank]) => before.has(id) && (rank > before.get(id) * 4 || rank * 4 < before.get(id)))
  .map(([id, rank]) => `${id} ${before.get(id)} to ${rank}`);
expectNone(jumps, "All India closing rank moved over 4 times between 2025 and 2026", warnings);

/* ── Known gaps: these don't stop a build, but stay visible ──────────── */

expectNone(colleges.filter((c) => c.city === c.state).map(label), "City is just the state name", warnings);
expectNone(colleges.filter((c) => !c.established).map(label), "Colleges with no founding year", warnings);
expectNone(colleges.filter((c) => !c.university).map(label), "Colleges with no university", warnings);
expectNone(colleges.filter((c) => !c.website).map(label), "Colleges with no website", warnings);

const withCutoffs = new Set(cutoffs.map((c) => c.collegeId));
const ugColleges = colleges.filter((c) => c.ugSeats > 0);
const missing = ugColleges.filter((c) => !withCutoffs.has(c.id));
warnings.push(`UG colleges with no cutoffs: ${missing.length} of ${ugColleges.length}`);
warnings.push(`State-quota cutoffs cover only: ${meta.stateCutoffs.join(", ")} (${cutoffs.filter((c) => c.quota === "state").length} rows)`);
warnings.push(`PG cutoffs: ${cutoffs.filter((c) => c.track === "pg").length} rows (none collected yet)`);

/* ── Report ──────────────────────────────────────────────────────────── */

for (const warning of warnings) console.log(`WARNING  ${warning}`);
for (const error of errors) console.log(`ERROR    ${error}`);

if (errors.length > 0) {
  console.log(`\nFailed with ${errors.length} error(s). Do not publish this data.`);
  process.exit(1);
}
console.log(`\nPassed, with ${warnings.length} warning(s).`);
