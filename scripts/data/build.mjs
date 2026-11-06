/**
 * Builds the site's data files from the raw source files.
 *
 *   Input:  data/raw/nexdoc/*       college list and seats, exact copies, never edited
 *           data/extracted/mcc/*    rows taken from MCC's result PDFs
 *           data/extracted/kea/*    rows taken from Karnataka's result PDFs
 *           data/extracted/states/* rows taken from other states' result PDFs
 *           data/curated/*          facts we added by hand
 *   Output: src/data/*.json         what the website reads
 *
 * Run with: npm run data:build, then npm run data:check
 * Never edit src/data by hand: the next build would overwrite it.
 * docs/data-guide.md explains the whole process.
 */
import fs from "node:fs";
import path from "node:path";
import { isNewAllotment, mapCategory, mapQuota, readCsv, squash } from "./mcc-lib.mjs";
import * as kea from "./kea-lib.mjs";
import { STATES } from "./state-rules.mjs";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "data/raw/nexdoc");
const CURATED = path.join(ROOT, "data/curated");
const OUT = path.join(ROOT, "src/data");
const MCC = path.join(ROOT, "data/extracted/mcc");
const KEA = path.join(ROOT, "data/extracted/kea");
const STATE_ROWS = path.join(ROOT, "data/extracted/states");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (name, value) =>
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + "\n");

/* ── Facts about the source that its files don't state ───────────────── */

// The NexDoc files have no year. See data/SOURCES.md for how this was worked out.
const SEAT_YEAR = "2026-27";

// Which round each MCC result file holds. Add a line here when MCC publishes a new one.
const MCC_ROUNDS = [
  { file: "2025-r1", year: 2025, round: 1 },
  { file: "2025-r2", year: 2025, round: 2 },
  { file: "2025-r3", year: 2025, round: 3 },
  { file: "2025-stray", year: 2025, round: 4 },
  { file: "2025-special", year: 2025, round: 5 },
  { file: "2026-r1", year: 2026, round: 1 },
  { file: "2026-r2", year: 2026, round: 2 },
  { file: "2026-r3", year: 2026, round: 3 },
  { file: "2026-stray", year: 2026, round: 4 },
];

/* ── Lookup tables: how source labels translate to the site's labels ──── */

const STATE_CODES = {
  "Andaman and Nicobar Islands": "AN",
  "Andhra Pradesh": "AP",
  "Arunachal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chandigarh: "CH",
  Chhattisgarh: "CG",
  "Dadra and Nagar Haveli and Daman and Diu": "DN",
  "Delhi (NCT)": "DL",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  "Jammu and Kashmir": "JK",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  Ladakh: "LA",
  Lakshadweep: "LD",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  Odisha: "OR",
  Puducherry: "PY",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Telangana: "TG",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UK",
  "West Bengal": "WB",
};

const SEAT_QUOTAS = {
  "All India Quota": "aiq",
  "Competent Authority Quota": "state",
  "Management Quota": "management",
  "NRI / Minority Quota": "nri",
};

// Karnataka's state counselling (KEA). Each file holds one round of MBBS allotments.
const KEA_ROUNDS = [
  { file: "2025-r1", year: 2025, round: 1 },
  { file: "2025-r2", year: 2025, round: 2 },
  { file: "2025-r3", year: 2025, round: 3 },
  { file: "2025-stray", year: 2025, round: 4 },
  { file: "2026-r1", year: 2026, round: 1 },
  { file: "2026-r2", year: 2026, round: 2 },
  { file: "2026-r3", year: 2026, round: 3 },
  { file: "2026-stray", year: 2026, round: 4 },
];

const CUTOFF_COURSES = new Set(["MBBS", "BDS"]);

/* ── Helpers ──────────────────────────────────────────────────────────── */

const clean = (value) =>
  String(value ?? "")
    .replace(/�/g, "")
    .replace(/\s+/g, " ")
    .trim();

const normalizeState = (state) => (clean(state) === "Delhi" ? "Delhi (NCT)" : clean(state));

function collegeType(raw) {
  if (raw.college_type === "INI") return "Central";
  if (raw.college_type === "Deemed") return "Deemed";
  // The source's type wrongly says Private for some state-run colleges; its
  // management field gets them right.
  if (raw.college_type === "Government" || raw.management === "Government") return "Government";
  return "Private";
}

function websiteUrl(website) {
  const value = clean(website);
  if (!value || /\s/.test(value)) return "";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

/* ── Read the inputs ──────────────────────────────────────────────────── */

const rawColleges = Object.values(readJson(path.join(RAW, "colleges_details.json")));
const rawUg = readJson(path.join(RAW, "ug_all.json"));
const rawPg = readJson(path.join(RAW, "pg_all.json"));
const crosswalk = readJson(path.join(CURATED, "mcc-college-crosswalk.json"));
const keaCodes = readJson(path.join(CURATED, "kea-college-codes.json"));
const stateColleges = readJson(path.join(CURATED, "state-colleges.json"));
const stateSources = [
  ...readJson(path.join(ROOT, "data/raw/states/sources.json")),
  ...readJson(path.join(ROOT, "data/raw/states/gj.json")).filter((s) => !s.lastMerit).map((s) => ({ ...s, state: "GJ" })),
  ...readJson(path.join(ROOT, "data/raw/states/ap.json")).map((s) => ({ ...s, state: "AP" })),
  ...readJson(path.join(ROOT, "data/raw/states/tg.json")).map((s) => ({ ...s, state: "TG" })),
  ...readJson(path.join(ROOT, "data/raw/states/mh.json")).map((s) => ({ ...s, state: "MH" })),
  ...readJson(path.join(ROOT, "data/raw/states/pb.json")).map((s) => ({ ...s, state: "PB" })),
  ...readJson(path.join(ROOT, "data/raw/states/hp.json")).map((s) => ({ ...s, state: "HP" })),
  ...readJson(path.join(ROOT, "data/raw/states/mp.json")).map((s) => ({ ...s, state: "MP" })),
  ...readJson(path.join(ROOT, "data/raw/states/tn.json")).map((s) => ({ ...s, state: "TN" })),
  ...readJson(path.join(ROOT, "data/raw/states/kl.json")).map((s) => ({ ...s, state: "KL" })),
  ...readJson(path.join(ROOT, "data/raw/states/up.json")).map((s) => ({ ...s, state: "UP" })),
  ...readJson(path.join(ROOT, "data/raw/states/wb.json")).map((s) => ({ ...s, state: "WB" })),
  ...readJson(path.join(ROOT, "data/raw/states/or.json")).map((s) => ({ ...s, state: "OR" })),
  ...readJson(path.join(ROOT, "data/raw/states/py.json")).map((s) => ({ ...s, state: "PY" })),
  ...readJson(path.join(ROOT, "data/raw/states/uk.json")).map((s) => ({ ...s, state: "UK" })),
];
const extras = readJson(path.join(CURATED, "college-extras.json"));

/* ── Seats ────────────────────────────────────────────────────────────── */

const seats = [];
const report = { zeroSeatRows: 0, droppedCutoffs: {} };
const seatRows = [
  ...rawUg.map((row) => ({ ...row, track: "ug" })),
  ...rawPg.map((row) => ({ ...row, track: "pg" })),
];

const stateFromSeatRows = new Map();
const courseNames = new Map();
const seatTotals = new Map();

for (const row of seatRows) {
  const collegeId = row.college_id;
  const course = clean(row.course);
  const count = Number(row.seats);

  const state = normalizeState(row.state);
  if (state && state !== "India") stateFromSeatRows.set(collegeId, state);

  if (!(count > 0)) {
    report.zeroSeatRows++;
    continue;
  }
  const quota = SEAT_QUOTAS[row.quota_type];
  if (!quota) throw new Error(`Unknown seat quota "${row.quota_type}". Add it to SEAT_QUOTAS.`);

  seats.push({ collegeId, track: row.track, course, quota, seats: count });

  if (!courseNames.has(collegeId)) courseNames.set(collegeId, new Set());
  courseNames.get(collegeId).add(course);

  const totals = seatTotals.get(collegeId) ?? { ug: 0, pg: 0 };
  totals[row.track] += count;
  seatTotals.set(collegeId, totals);
}

/* ── Colleges ─────────────────────────────────────────────────────────── */

const colleges = rawColleges.map((raw) => {
  const id = raw.college_id;
  // 175 colleges have the state "India" in the college file. Their seat rows have the real one.
  const state = stateFromSeatRows.get(id) ?? normalizeState(raw.state);
  const totals = seatTotals.get(id) ?? { ug: 0, pg: 0 };
  const extra = extras[id] ?? {};

  return {
    id,
    name: clean(raw.college_name),
    city: clean(raw.city),
    state,
    stateCode: STATE_CODES[state] ?? "XX",
    type: collegeType(raw),
    established: Number.parseInt(raw.year_of_inc, 10) || 0,
    nmcStatus: clean(raw.status),
    nmcRecognized: clean(raw.status).toLowerCase() === "recognized",
    university: clean(raw.university),
    website: websiteUrl(raw.website),
    address: clean(raw.address).replace(/^[s,.-]+/, ""),
    hero_image_url: extra.hero_image_url ?? null,
    ...(extra.nirfRanking ? { nirfRanking: extra.nirfRanking } : {}),
    branches: [...(courseNames.get(id) ?? [])],
    ugSeats: totals.ug,
    pgSeats: totals.pg,
    totalSeats: totals.ug + totals.pg,
  };
});

/* ── Cutoffs ──────────────────────────────────────────────────────────── */

const drop = (reason) => {
  report.droppedCutoffs[reason] = (report.droppedCutoffs[reason] ?? 0) + 1;
};

// A closing rank is the highest rank that received a new seat in a group, where a group
// is one college + course + quota + category + round + year. See mcc-lib.mjs.
const groups = new Map();

for (const { file, year, round } of MCC_ROUNDS) {
  for (const row of readCsv(path.join(MCC, `${file}.csv`))) {
    const { quota, detail } = mapQuota(row.quota);
    if (!isNewAllotment(row)) { drop("student kept an earlier seat"); continue; }
    if (!quota) { drop(`quota ${detail}`); continue; }
    if (!CUTOFF_COURSES.has(row.course)) { drop(`course ${row.course}`); continue; }

    const match = crosswalk[squash(row.institute)];
    if (!match) {
      if (row.course === "MBBS") throw new Error(`No match for "${row.institute}". Run: npm run data:mcc:match`);
      drop("BDS college not on the site");
      continue;
    }
    if (!match.id) { drop("college not on the site"); continue; }

    const category = mapCategory(row.allottedCategory);
    const key = [match.id, row.course, quota, detail, category, round, year].join("|");
    const rank = Number(row.rank);
    const group = groups.get(key) ?? {
      collegeId: match.id, track: "ug", course: row.course, quota, category, round, year,
      openingRank: rank, closingRank: rank, allotted: 0, quotaDetail: detail,
    };
    group.openingRank = Math.min(group.openingRank, rank);
    group.closingRank = Math.max(group.closingRank, rank);
    group.allotted++;
    groups.set(key, group);
  }
}

// Karnataka's rows work the same way, with its own seat types and categories.
for (const { file, year, round } of KEA_ROUNDS) {
  for (const row of readCsv(path.join(KEA, `${file}.csv`))) {
    if (!kea.isNewAllotment(row.status)) { drop("student kept an earlier seat"); continue; }
    const { college, seatType } = kea.parseCourseCode(row.code);
    const stateCategory = row.category;
    const { quota, category } = kea.mapSeat(seatType, stateCategory);
    if (!(college in keaCodes)) throw new Error(`KEA college ${college} (${row.college}) has no match. Add it to kea-college-codes.json.`);
    const collegeId = keaCodes[college];
    if (!collegeId) { drop("college not on the site"); continue; }
    if (!colleges.some((c) => c.id === collegeId)) throw new Error(`kea-college-codes.json names unknown college ${collegeId}.`);

    const key = ["KA", collegeId, seatType, stateCategory, round, year].join("|");
    const rank = Number(row.rank);
    const group = groups.get(key) ?? {
      collegeId, track: "ug", course: "MBBS", quota, category, round, year,
      openingRank: rank, closingRank: rank, allotted: 0,
      quotaDetail: `KEA_${seatType.toUpperCase()}`, state: "KA", seatType, stateCategory,
    };
    group.openingRank = Math.min(group.openingRank, rank);
    group.closingRank = Math.max(group.closingRank, rank);
    group.allotted++;
    groups.set(key, group);
  }
}

/* ── Fees ─────────────────────────────────────────────────────────────── */

// Official annual fees, one row per college, course and seat type. Colleges with none show an estimate.
const fees = new Map();
function addFee(fee) {
  const key = [fee.collegeId, fee.course, fee.seatType].join("|");
  const existing = fees.get(key);
  if (existing && existing.year === fee.year && existing.annualFee !== fee.annualFee) {
    throw new Error(`Two fees for ${key} in ${fee.year}: ${existing.annualFee} and ${fee.annualFee}.`);
  }
  if (!existing || existing.year < fee.year) fees.set(key, fee);
}

// Karnataka's allotment lists print the fee of every seat. The latest year wins.
for (const { file, year } of KEA_ROUNDS) {
  for (const row of readCsv(path.join(KEA, `${file}.csv`))) {
    const { college, seatType } = kea.parseCourseCode(row.code);
    const collegeId = keaCodes[college];
    // A fee of 0 means none was printed for that seat.
    if (!collegeId || !(Number(row.fee) > 0)) continue;
    // KEA's management quota seats are "others" in kea-lib.
    addFee({ collegeId, course: "MBBS", seatType: seatType === "others" ? "management" : seatType, annualFee: Number(row.fee), year, source: "KEA allotment lists", state: "KA" });
  }
}

// Fees read by hand from official notices, with the document named for each.
const curatedFees = readJson(path.join(CURATED, "fees.json"));
for (const row of curatedFees.fees) {
  const source = curatedFees.sources[row.source];
  if (!source) throw new Error(`Fee for ${row.collegeId} names unknown source ${row.source}.`);
  if (!colleges.some((c) => c.id === row.collegeId)) throw new Error(`fees.json names unknown college ${row.collegeId}.`);
  addFee({ collegeId: row.collegeId, course: "MBBS", seatType: row.seatType, annualFee: row.annualFee, year: row.year,
    source: source.label, sourceUrl: source.url, state: row.state });
}

// Other states. Names vary between files, so a listed name only has to start the college's name.
function matchStateCollege(state, name) {
  const squashed = squash(name);
  const entries = Object.entries(stateColleges[state]).sort((a, b) => b[0].length - a[0].length);
  const found = entries.find(([listed]) => squashed.startsWith(squash(listed)));
  if (!found) throw new Error(`No match for ${state} college "${name}". Add it to state-colleges.json.`);
  return found[1];
}

for (const source of stateSources.filter((s) => !s.checkOnly)) {
  const rules = STATES[source.state];
  for (const row of readCsv(path.join(STATE_ROWS, `${source.state}-${source.name}.csv`))) {
    if (!rules.isMbbs(row)) { drop(`${source.state} row that isn't MBBS`); continue; }
    const collegeId = matchStateCollege(source.state, row.college);
    if (!collegeId) { drop("college not on the site"); continue; }
    const seat = rules.map(row, source);
    if (!seat) { drop("student kept an earlier seat"); continue; }

    const key = [source.state, collegeId, seat.seatType, seat.code, source.round, source.year].join("|");
    const rank = Number(row.rank);
    const group = groups.get(key) ?? {
      collegeId, track: "ug", course: "MBBS", quota: seat.quota, category: seat.category,
      round: source.round, year: source.year, openingRank: rank, closingRank: rank, allotted: 0,
      quotaDetail: `${source.state}_${seat.seatType.toUpperCase()}`, state: source.state,
      seatType: seat.seatType, stateCategory: seat.code,
      // A state's own rank can't be compared with an All India rank, so the rows say which they hold.
      ...(rules.stateRank ? { rankType: "state" } : {}),
    };
    group.openingRank = Math.min(group.openingRank, rank);
    group.closingRank = Math.max(group.closingRank, rank);
    group.allotted++;
    groups.set(key, group);
  }
}

const cutoffs = [...groups.values()];

/* ── States and summary numbers ───────────────────────────────────────── */

const states = [...new Set(colleges.map((college) => college.state))]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ code: STATE_CODES[name] ?? "XX", name }));

const ugSeats = seats.filter((seat) => seat.track === "ug").reduce((sum, seat) => sum + seat.seats, 0);
const meta = {
  source: "NexDoc",
  sourceCommit: fs.readFileSync(path.join(RAW, "COMMIT"), "utf8").trim(),
  cutoffSource: "MCC",
  cutoffYear: Math.max(...cutoffs.map((cutoff) => cutoff.year)),
  cutoffYears: [...new Set(cutoffs.map((cutoff) => cutoff.year))].sort(),
  stateCutoffs: [...new Set(cutoffs.map((cutoff) => cutoff.state).filter(Boolean))].sort(),
  stateOptions: Object.fromEntries(Object.entries(STATES).map(([code, rules]) => [code, rules.options])),
  stateRanks: Object.fromEntries(Object.entries(STATES).filter(([, rules]) => rules.stateRank).map(([code, rules]) => [code, rules.stateRank])),
  seatYear: SEAT_YEAR,
  collegeCount: colleges.length,
  ugCollegeCount: colleges.filter((college) => college.ugSeats > 0).length,
  ugSeats,
  collegesWithCutoffs: new Set(cutoffs.map((cutoff) => cutoff.collegeId)).size,
  collegesWithFees: new Set([...fees.values()].map((fee) => fee.collegeId)).size,
};

/* ── Write everything ─────────────────────────────────────────────────── */

fs.mkdirSync(OUT, { recursive: true });
writeJson("colleges.json", colleges);
writeJson("seats.json", seats);
// One row per line keeps this large file smaller and its changes easy to read.
fs.writeFileSync(path.join(OUT, "cutoffs.json"), `[\n${cutoffs.map((c) => JSON.stringify(c)).join(",\n")}\n]\n`);
writeJson("states.json", states);
writeJson("meta.json", meta);
writeJson("fees.json", [...fees.values()].sort((a, b) => a.collegeId.localeCompare(b.collegeId) || a.seatType.localeCompare(b.seatType)));

console.log("Built src/data");
console.log(`  Colleges: ${colleges.length} (${meta.ugCollegeCount} with UG seats)`);
console.log(`  States:   ${states.length}`);
console.log(`  Seats:    ${seats.length} rows (${ugSeats} UG seats), ${report.zeroSeatRows} zero-seat rows skipped`);
console.log(`  Cutoffs:  ${cutoffs.length} rows across ${meta.collegesWithCutoffs} colleges`);
console.log("  Rows not used for cutoffs:", report.droppedCutoffs);
console.log("Now run: npm run data:check");
