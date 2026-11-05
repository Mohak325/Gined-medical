/**
 * Builds the site's data files from the raw source files.
 *
 *   Input:  data/raw/nexdoc/*   exact copies of the source files, never edited
 *           data/curated/*      facts we added by hand
 *   Output: src/data/*.json     what the website reads
 *
 * Run with: npm run data:build, then npm run data:check
 * Never edit src/data by hand: the next build would overwrite it.
 * docs/data-guide.md explains the whole process.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const RAW = path.join(ROOT, "data/raw/nexdoc");
const CURATED = path.join(ROOT, "data/curated");
const OUT = path.join(ROOT, "src/data");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (name, value) =>
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(value, null, 2) + "\n");

/* ── Facts about the source that its files don't state ───────────────── */

// The source files have no year. See data/SOURCES.md for how these were worked out.
const CUTOFF_YEAR = 2025;
const SEAT_YEAR = "2026-27";

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

// "special" quotas have their own eligibility rules, so they must not be mixed
// into a prediction for an ordinary student. Unlisted quotas (such as FOREIGN)
// are dropped, and the build reports how many.
const CUTOFF_QUOTAS = {
  AIQ: "aiq",
  OPEN_SEAT: "aiq",
  DEEMED: "deemed",
  DU: "central",
  AMU: "central",
  CW_ARMED_FORCES: "special",
  IPU: "special",
  ESI: "special",
  PUDUCHERRY_INTERNAL: "special",
  MUSLIM_MINORITY: "special",
  NRI: "nri",
};

const CUTOFF_CATEGORIES = {
  OPEN: "general",
  OBC: "obc",
  SC: "sc",
  ST: "st",
  EWS: "ews",
  OPEN_PWD: "general_pwd",
  OBC_PWD: "obc_pwd",
  SC_PWD: "sc_pwd",
  ST_PWD: "st_pwd",
  EWS_PWD: "ews_pwd",
};

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
const rawCutoffs = readJson(path.join(RAW, "ug_colleges_aiq_mapping.json"));
const crosswalk = readJson(path.join(CURATED, "cutoff-college-crosswalk.json"));
const extras = readJson(path.join(CURATED, "college-extras.json"));

const collegeIds = new Set(rawColleges.map((college) => college.college_id));

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

const cutoffs = [];
const drop = (reason) => {
  report.droppedCutoffs[reason] = (report.droppedCutoffs[reason] ?? 0) + 1;
};

for (const college of rawCutoffs) {
  const collegeId = crosswalk[college.college_id] ?? college.college_id;
  // AIIMS Guwahati alone has both OPEN_SEAT and AIQ rows, with very different ranks.
  // Until checked against MCC's PDF, predict from the stricter OPEN_SEAT rows and
  // set the others aside, so no student is told a seat is safer than it is.
  const hasOpenSeat = college.aiq_cutoffs_raw.some((row) => row.quota === "OPEN_SEAT");
  if (!collegeIds.has(collegeId)) {
    throw new Error(`Cutoff college ${college.college_id} (${college.college_name}) has no match. Add it to the crosswalk.`);
  }

  for (const row of college.aiq_cutoffs_raw) {
    const quota = hasOpenSeat && row.quota === "AIQ" ? "special" : CUTOFF_QUOTAS[row.quota];
    const category = CUTOFF_CATEGORIES[row.category];
    const course = clean(row.course);
    if (!quota) { drop(`quota ${row.quota}`); continue; }
    if (!category) { drop(`category ${row.category}`); continue; }
    if (!CUTOFF_COURSES.has(course)) { drop(`course ${course}`); continue; }

    for (const round of [1, 2, 3]) {
      const openingRank = row[`r${round}_opening_rank`];
      const closingRank = row[`r${round}_closing_rank`];
      if (openingRank == null || closingRank == null) continue;
      cutoffs.push({
        collegeId,
        track: "ug",
        course,
        quota,
        category,
        round,
        year: CUTOFF_YEAR,
        openingRank: Number(openingRank),
        closingRank: Number(closingRank),
        allotted: Number(row[`r${round}_total_allotted`] ?? 0),
        quotaDetail: row.quota,
      });
    }
  }
}

/* ── States and summary numbers ───────────────────────────────────────── */

const states = [...new Set(colleges.map((college) => college.state))]
  .sort((a, b) => a.localeCompare(b))
  .map((name) => ({ code: STATE_CODES[name] ?? "XX", name }));

const ugSeats = seats.filter((seat) => seat.track === "ug").reduce((sum, seat) => sum + seat.seats, 0);
const meta = {
  source: "NexDoc",
  sourceCommit: fs.readFileSync(path.join(RAW, "COMMIT"), "utf8").trim(),
  cutoffYear: CUTOFF_YEAR,
  seatYear: SEAT_YEAR,
  collegeCount: colleges.length,
  ugCollegeCount: colleges.filter((college) => college.ugSeats > 0).length,
  ugSeats,
  collegesWithCutoffs: new Set(cutoffs.map((cutoff) => cutoff.collegeId)).size,
};

/* ── Write everything ─────────────────────────────────────────────────── */

fs.mkdirSync(OUT, { recursive: true });
writeJson("colleges.json", colleges);
writeJson("seats.json", seats);
writeJson("cutoffs.json", cutoffs);
writeJson("states.json", states);
writeJson("meta.json", meta);

console.log("Built src/data");
console.log(`  Colleges: ${colleges.length} (${meta.ugCollegeCount} with UG seats)`);
console.log(`  States:   ${states.length}`);
console.log(`  Seats:    ${seats.length} rows (${ugSeats} UG seats), ${report.zeroSeatRows} zero-seat rows skipped`);
console.log(`  Cutoffs:  ${cutoffs.length} rows across ${meta.collegesWithCutoffs} colleges`);
console.log("  Cutoff rows dropped:", report.droppedCutoffs);
console.log("Now run: npm run data:check");
