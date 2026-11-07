/**
 * Checks the built data in src/data. Run with: npm run data:check
 *
 *   ERROR    the data is wrong. The command fails, so don't publish it.
 *   WARNING  the data is usable but has a known gap. Fix it when you can.
 *
 * When you find a new kind of data bug, add a check here so it can't come back.
 */
import fs from "node:fs";
import { readCsv } from "./mcc-lib.mjs";
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

const photos = colleges.map((c) => c.photo?.page).filter(Boolean);
expectNone(photos.filter((url, i) => photos.indexOf(url) !== i), "A photo used for more than one college");
const photoLinks = colleges.flatMap((c) => (c.photo ? [c.photo.thumb ?? c.photo.src ?? ""] : []));
expectNone(photoLinks.filter((url) => !url.startsWith("https://upload.wikimedia.org/")), "A photo not served from Wikimedia");
expectNone(
  colleges.filter((c) => c.photo && (!c.photo.license || !c.photo.page)).map((c) => c.id),
  "A photo without its licence or source page"
);

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

// Maharashtra's count and last ranks, as reported by neet2seat.
{
  const mh = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/mh-report.json"), "utf8"));
  const file = mh.files["MH-2026-r1"];
  expectEqual("Maharashtra 2026 Round 1 candidates listed", file.seen, 31047);
  expectEqual("Maharashtra 2026 Round 1 students allotted", file.written, 10509);
  if (file.rejected > 0 || file.serialGaps > 0) errors.push("MH-2026-r1: rows could not be read, or serial numbers skip");
  const lastOpen = (type) => Math.max(0, ...cutoffs
    .filter((c) => c.state === "MH" && c.round === 1 && c.stateCategory === "OPEN" && colleges.find((x) => x.id === c.collegeId)?.type === type)
    .map((c) => c.closingRank));
  console.log(`Maharashtra last Open rank: government ${lastOpen("Government")}, private ${lastOpen("Private")}`);
  expectEqual("Maharashtra last Open government rank, per neet2seat", lastOpen("Government"), 47413);
  expectEqual("Maharashtra last Open private rank, per neet2seat", lastOpen("Private"), 114441);
}

// Punjab's counts and closing All India ranks, as reported by neet2seat and Careers360.
{
  const pb = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/pb-report.json"), "utf8"));
  expectEqual("Punjab 2026 Round 1 students listed, per Careers360", pb.files["PB-2026-r1"].seen, 2410);
  const table = {
    ug_in044g1: [12064, 15207, 18092], // Patiala
    ug_pb003g1: [24548, 27209, 33860], // Amritsar
    ug_pb001g1: [24071, 27191, 34876], // Mohali
    ug_pb002g1: [27199, 31197, 36672], // ESIC Ludhiana
    ug_pb004g1: [30897, 34317, 46909], // Faridkot
  };
  for (const [collegeId, closes] of Object.entries(table)) {
    closes.forEach((closing, index) => {
      const row = cutoffs.find((c) => c.state === "PB" && c.collegeId === collegeId && c.stateCategory === "OPEN" && c.round === index + 1);
      expectEqual(`Punjab ${collegeId} Open Round ${index + 1}, per neet2seat`, row?.closingRank, closing);
    });
  }
}

// Madhya Pradesh publishes its own closing ranks each round. Ours are calculated from the student lists.
{
  const mp = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/mp-report.json"), "utf8"));
  for (const [name, file] of Object.entries(mp.files)) {
    if (file.serialGaps > 0) errors.push(`${name}: serial numbers skip`);
    const groups = new Map();
    for (const row of readCsv(path.join(ROOT, `data/extracted/states/${name}.csv`))) {
      if (row.course !== "MBBS" || row.remark === "NOT UPGRADED") continue;
      const key = `${row.college}|${row.category}`;
      const group = groups.get(key) ?? { closing: 0, allotted: 0 };
      group.closing = Math.max(group.closing, Number(row.rank));
      group.allotted++;
      groups.set(key, group);
    }
    const official = new Map();
    for (const row of file.summary) {
      const key = `${row.college}|${row.seat}`;
      const group = official.get(key) ?? { closing: 0, allotted: 0 };
      group.closing = Math.max(group.closing, row.closing);
      group.allotted += row.allotted;
      official.set(key, group);
    }
    let same = 0;
    const differ = [];
    for (const [key, group] of official) {
      const ours = groups.get(key);
      if (ours?.closing === group.closing && ours.allotted === group.allotted) same++;
      else differ.push(`${key}: official ${group.closing}/${group.allotted}, ours ${ours?.closing}/${ours?.allotted}`);
    }
    console.log(`Madhya Pradesh's own closing ranks, ${name}: ${same} of ${official.size} match, and we have ${groups.size} groups`);
    if (differ.length > 0) errors.push(`${name}: ${differ.length} official closing ranks differ. ${differ.slice(0, 5).join("; ")}`);
  }
}

// Tamil Nadu's closing ranks by community, as reported by neet2seat. Its Open figures aren't compared:
// the lists show each student's community and not the seat, so ours is the last OC student's rank.
{
  const tn = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/tn-report.json"), "utf8"));
  for (const [name, file] of Object.entries(tn.files)) {
    if (file.serialGaps > 0) errors.push(`${name}: serial numbers skip`);
  }
  const table = {
    ug_in071g1: { BC: [3, 277], BCM: [2, 349], MBC: [3, 319], SC: [2, 1258], SCA: [2, 2604], ST: [3, 3103] }, // Madras
    ug_in087g1: { BC: [3, 521], BCM: [2, 445], MBC: [3, 623], SC: [3, 2088], SCA: [2, 4307], ST: [3, 6358] }, // Stanley
    ug_in067g1: { BC: [3, 966], BCM: [3, 1279], MBC: [3, 751], SC: [3, 3705], SCA: [2, 4749], ST: [1, 2945] }, // Kilpauk
  };
  for (const [collegeId, codes] of Object.entries(table)) {
    for (const [code, [round, closing]] of Object.entries(codes)) {
      const row = cutoffs.find((c) => c.state === "TN" && c.collegeId === collegeId && c.stateCategory === code && c.round === round && c.seatType === "government");
      expectEqual(`Tamil Nadu ${collegeId} ${code} Round ${round}, per neet2seat`, row?.closingRank, closing);
    }
  }
}

// Kerala's own Phase 1 last rank table. PT, PI and CC seats are skipped, because the table gives their
// category rank. Seat codes we don't offer are skipped too.
{
  const kl = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/kl-report.json"), "utf8"));
  const ids = JSON.parse(fs.readFileSync(path.join(ROOT, "data/curated/state-colleges.json"), "utf8")).KL;
  const offered = ["SM", "EW", "EZ", "MU", "BH", "LA", "DV", "VK", "KN", "BX", "KU", "SC", "ST"];
  let same = 0;
  let total = 0;
  for (const [key, official] of Object.entries(kl.lastRankPhase1)) {
    const [college, code] = key.split("|");
    if (!offered.includes(code)) continue;
    total++;
    const row = cutoffs.filter((c) => c.state === "KL" && c.collegeId === ids[`${college}-`] && c.stateCategory === code && c.round === 1);
    if (Math.max(0, ...row.map((c) => c.closingRank)) === official) same++;
    else errors.push(`Kerala Phase 1 ${key}: official ${official}`);
  }
  console.log(`Kerala's own Phase 1 last ranks: ${same} of ${total} match`);
}

// A state's own rank must never be presented as an All India rank.
{
  const stateRankStates = ["TN", "KL"];
  const unmarked = cutoffs.filter((c) => stateRankStates.includes(c.state) && c.rankType !== "state");
  if (unmarked.length > 0) errors.push(`${unmarked.length} Tamil Nadu or Kerala rows aren't marked as state ranks`);
  const general = cutoffs.filter((c) => c.rankType === "state" && c.category !== "state_only");
  if (general.length > 0) errors.push(`${general.length} state-rank rows could be mixed with All India rows`);
}

// Uttar Pradesh's Round 1 closing ranks, as reported by Sartha from the Round 1 lists. Our source shows
// only the students still holding a seat, so ours can be lower where a student later moved, never higher.
{
  const sartha = {
    ug_in068g1: [3001, 3706, 4583, 36962], ug_up019g1: [4857, 4742, 5903, 50624], ug_up022g1: [6517, 6345, 7724, 62039],
    ug_up024g1: [8210, 7864, 11109, 73984], ug_up039g1: [8473, 8722, 10486, 79984], ug_up036g1: [8802, 8608, 10705, 68834],
    ug_up045g1: [10558, 9602, 12428, 82993], ug_up013g1: [10731, 9440, 12356, 84282], ug_up037g1: [11559, 11291, 13156, 90632],
    ug_up020g1: [11690, 8419, 13606, 86917], ug_up052g1: [12940, 12558, 13833, 94691], ug_in013g1: [13138, 11726, 14703, 98914],
    ug_up049g1: [13560, 12213, 14559, 114145], ug_up018g1: [13901, 13730, 14635, 117441], ug_up044g1: [14592, 14093, 16052, 124312],
    ug_up025g1: [14906, 15427, 15468, 105373], ug_up043g1: [15280, 15623, 16625, 130067], ug_up035g1: [16353, 16529, 17536, 118487],
    ug_up023g1: [16429, 16063, 17157, 128803], ug_up026g1: [16793, 17569, 17597, 130707],
  };
  const codes = ["UR", "UR-F", "BC", "SC"];
  let same = 0;
  let total = 0;
  for (const [collegeId, values] of Object.entries(sartha)) {
    values.forEach((value, index) => {
      const row = cutoffs.find((c) => c.state === "UP" && c.collegeId === collegeId && c.round === 1 && c.stateCategory === codes[index] && c.seatType === "government");
      total++;
      if (row?.closingRank === value) same++;
      // A missing row means every student given that seat in Round 1 later moved on.
      else if (row && row.closingRank > value) errors.push(`Uttar Pradesh ${collegeId} ${codes[index]} Round 1: Sartha ${value}, ours ${row?.closingRank}`);
    });
  }
  console.log(`Uttar Pradesh Round 1 closing ranks matching Sartha: ${same} of ${total}, and none higher`);
  const sarthaPrivate = { ug_up022p3: 126441, ug_up009p3: 148511, ug_in099p3: 173935, ug_up024p3: 203481, ug_up021g1: 352479 };
  for (const [collegeId, value] of Object.entries(sarthaPrivate)) {
    const row = cutoffs.find((c) => c.state === "UP" && c.collegeId === collegeId && c.round === 1 && c.stateCategory === "UR" && c.seatType === "private");
    if (!row || row.closingRank > value) errors.push(`Uttar Pradesh private ${collegeId} Round 1: Sartha ${value}, ours ${row?.closingRank}`);
  }
  if (same < total * 0.7) errors.push(`Uttar Pradesh: only ${same} of ${total} closing ranks match Sartha`);
}

// West Bengal's Round 1 counts and median closing ranks for government colleges, as reported by neet2seat.
{
  const wb = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/wb-report.json"), "utf8"));
  expectEqual("West Bengal 2026 Round 1 seats allotted, per neet2seat", wb["WB-2026-r1"].rows, 6422);
  expectEqual("West Bengal 2026 Round 1 MBBS seats allotted, per neet2seat", wb["WB-2026-r1"].mbbs, 5833);
  for (const [name, file] of Object.entries(wb)) {
    if (file.unread > 0 || file.badRank > 0) errors.push(`${name}: rows could not be read`);
  }
  const medians = { UR: 36975, OBC: 44526, EWS: 117197, SC: 142062, ST: 475677 };
  for (const [code, value] of Object.entries(medians)) {
    const ranks = cutoffs.filter((c) => c.state === "WB" && c.round === 1 && c.stateCategory === code && c.seatType === "government")
      .map((c) => c.closingRank).sort((a, b) => a - b);
    expectEqual(`West Bengal Round 1 median ${code} closing rank in government colleges, per neet2seat`, ranks[Math.floor((ranks.length - 1) / 2)], value);
  }
}

// Odisha's Round 1 counts, as reported by neet2seat from the same list.
{
  const rows = readCsv(path.join(ROOT, "data/extracted/states/OR-2026-r1.csv"));
  const count = (test) => rows.filter(test).length;
  expectEqual("Odisha Round 1 home state allotments, per neet2seat", count((r) => r.quota === "HS"), 1694);
  expectEqual("Odisha Round 1 government school allotments, per neet2seat", count((r) => r.quota === "SGS"), 290);
  expectEqual("Odisha Round 1 NRI allotments, per neet2seat", count((r) => r.quota === "NR"), 18);
  const open = rows.filter((r) => r.course === "MBBS" && r.category === "OPNO" && !/^(HITECH|DRIEMS)/i.test(r.college)).map((r) => Number(r.rank));
  expectEqual("Odisha Round 1 open government MBBS allotments, per neet2seat", open.length, 648);
  expectEqual("Odisha Round 1 deepest open government MBBS rank, per neet2seat", Math.max(...open), 95204);
}

// Uttarakhand's Round 1 counts, as reported by neet2seat.
{
  const uk = JSON.parse(fs.readFileSync(path.join(ROOT, "data/extracted/states/uk-report.json"), "utf8"));
  expectEqual("Uttarakhand 2026 Round 1 seats allotted, per neet2seat", uk["UK-2026-r1"].written, 1245);
  expectEqual("Uttarakhand 2026 Round 1 MBBS seats allotted, per neet2seat", uk["UK-2026-r1"].mbbs, 1057);
  for (const [name, file] of Object.entries(uk)) {
    if (file.badRank > 0) errors.push(`${name}: ranks could not be read`);
  }
}

// Official fees: every row names a real college, a known seat type and a plausible yearly amount.
{
  const fees = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/fees.json"), "utf8"));
  const ids = new Set(colleges.map((c) => c.id));
  for (const fee of fees) {
    const where = `${fee.collegeId} ${fee.seatType} ${fee.year}`;
    if (!ids.has(fee.collegeId)) errors.push(`Fee for unknown college: ${where}`);
    if (!["government", "private", "management", "nri"].includes(fee.seatType)) errors.push(`Fee with unknown seat type: ${where}`);
    // Government seats can cost a few thousand rupees a year. No MBBS seat costs over a crore a year.
    if (!(fee.annualFee >= 1000 && fee.annualFee <= 10000000)) errors.push(`Implausible fee ${fee.annualFee}: ${where}`);
    if (!fee.source || !fee.year) errors.push(`Fee without a source or year: ${where}`);
  }
  console.log(`Official fees: ${fees.length} rows across ${new Set(fees.map((f) => f.collegeId)).size} colleges`);
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

/* ── NEET PG ──────────────────────────────────────────────────────────── */

// Published 2026 Round 1 All India closing ranks, which MCC doesn't summarise itself:
// by category from Careers360 (medicine.careers360.com/articles/mcc-neet-pg-counselling-2026-round-1-cutoff-out),
// by branch for Open seats from hireguideeducation.org/alerts/mcc-neet-pg-2026-round-1-final-result-cutoff-reporting-analysis.
{
  const pg = cutoffs.filter((c) => c.track === "pg");
  const r1 = pg.filter((c) => c.year === 2026 && c.round === 1 && c.quota === "aiq");
  const highest = (rows) => Math.max(...rows.map((c) => c.closingRank));
  const published = [
    ["general", null, 127533], ["ews", null, 132185], ["obc", null, 149301], ["sc", null, 159338], ["st", null, 159693],
    ["general", "MD - General Medicine", 4703], ["general", "MD - Radio Diagnosis", 3058],
  ];
  let same = 0;
  for (const [category, course, rank] of published) {
    const ours = highest(r1.filter((c) => c.category === category && (!course || c.course === course)));
    if (ours === rank) same++;
    else errors.push(`NEET PG 2026 Round 1 ${category} ${course ?? "all courses"}: published ${rank}, ours ${ours}`);
  }
  console.log(`NEET PG 2026 Round 1 published closing ranks matched: ${same} of ${published.length}`);

  // Published allotment totals for each PG result, against the rows read from MCC's PDFs.
  // 2025 Round 2: 20,787 allotted (hellomentor.in), 9,667 of them All India.
  // 2025 Round 3: 10,084 fresh allotments and 8,589 upgrades (Careers360 news, 6 Feb 2026).
  // 2026 Round 1: 28,723 allotted (hireguideeducation.org). Last ranks are MCC's own last row.
  const pgDir = path.join(ROOT, "data/extracted/mcc-pg");
  const totals = [
    ["2025-r2", (rows) => rows.length, 20787],
    ["2025-r2", (rows) => rows.filter((r) => r.quota === "All India").length, 9667],
    ["2025-r3", (rows) => rows.filter((r) => /^fresh/i.test(r.remarks)).length, 10084],
    ["2025-r3", (rows) => rows.filter((r) => /^upgraded/i.test(r.remarks)).length, 8589],
    ["2026-r1", (rows) => rows.length, 28723],
  ];
  let totalsSame = 0;
  const pgRows = {};
  for (const [file, count, expected] of totals) {
    pgRows[file] ??= readCsv(path.join(pgDir, `${file}.csv`));
    const ours = count(pgRows[file]);
    if (ours === expected) totalsSame++;
    else errors.push(`NEET PG ${file}: published total ${expected}, rows read ${ours}`);
  }
  console.log(`NEET PG published allotment totals matched: ${totalsSame} of ${totals.length}`);

  // Each PG cutoff should sit on a course the college lists. A few don't, because NMC's seat list is older.
  const listed = new Set(seats.filter((s) => s.track === "pg").map((s) => `${s.collegeId}|${s.course}`));
  const unlisted = pg.filter((c) => !listed.has(`${c.collegeId}|${c.course}`));
  if (unlisted.length > pg.length * 0.02) errors.push(`PG cutoffs on a course the college doesn't list: ${unlisted.length} of ${pg.length}`);
  console.log(`NEET PG cutoffs: ${pg.length} rows across ${new Set(pg.map((c) => c.collegeId)).size} colleges, ${unlisted.length} on a course the college doesn't list`);
}

/* ── Known gaps: these don't stop a build, but stay visible ──────────── */

expectNone(colleges.filter((c) => c.city === c.state).map(label), "City is just the state name", warnings);
expectNone(colleges.filter((c) => !c.established).map(label), "Colleges with no founding year", warnings);
expectNone(colleges.filter((c) => !c.university).map(label), "Colleges with no university", warnings);
expectNone(colleges.filter((c) => !c.website).map(label), "Colleges with no website", warnings);

const withCutoffs = new Set(cutoffs.filter((c) => c.track === "ug").map((c) => c.collegeId));
const ugColleges = colleges.filter((c) => c.ugSeats > 0);
const missing = ugColleges.filter((c) => !withCutoffs.has(c.id));
warnings.push(`UG colleges with no cutoffs: ${missing.length} of ${ugColleges.length}`);
warnings.push(`State-quota cutoffs cover only: ${meta.stateCutoffs.join(", ")} (${cutoffs.filter((c) => c.quota === "state").length} rows)`);
warnings.push("PG cutoffs cover MCC's All India rounds only (2025 Rounds 1 to 3 and stray, 2026 Round 1), with no state quota or DNB");

/* ── Report ──────────────────────────────────────────────────────────── */

for (const warning of warnings) console.log(`WARNING  ${warning}`);
for (const error of errors) console.log(`ERROR    ${error}`);

if (errors.length > 0) {
  console.log(`\nFailed with ${errors.length} error(s). Do not publish this data.`);
  process.exit(1);
}
console.log(`\nPassed, with ${warnings.length} warning(s).`);
