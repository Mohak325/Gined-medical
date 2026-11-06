/**
 * Matches the college names in MCC's results to the college ids used on the site.
 *
 * MCC and NMC spell colleges differently ("Govt Medical college Shivpuri" against
 * "Government Medical College, Shivpuri"), and MCC changes spellings between years, so
 * this is the riskiest step: a wrong match shows a student another college's cutoffs.
 *
 * Usage: node scripts/data/mcc-match.mjs        (UG, MBBS rows)
 *        node scripts/data/mcc-match.mjs pg     (PG, MD/MS/diploma rows)
 *
 *   Input:  data/extracted/mcc/*.csv  or  data/extracted/mcc-pg/*.csv
 *           data/curated/mcc-college-overrides.json   decisions made by a person, shared by UG and PG
 *   Output: data/curated/mcc-college-crosswalk.json   every name and its match (PG: mcc-pg-college-crosswalk.json)
 *           data/curated/mcc-matches-to-review.json   names nobody has decided yet (PG: mcc-pg-matches-to-review.json)
 *
 * PG reuses every UG match first, because MCC often spells a college the same way in both.
 * DNB quota rows are skipped: DNB seats are in hospitals the site doesn't list.
 *
 * An override wins over everything. Its "id" is null when the college isn't on the site.
 * docs/data-guide.md explains how to work through the review list.
 */
import fs from "node:fs";
import path from "node:path";
import { readCsv, squash } from "./mcc-lib.mjs";

const PG = process.argv[2] === "pg";
const ROOT = path.resolve(import.meta.dirname, "../..");
const CURATED = path.join(ROOT, "data/curated");
const dir = path.join(ROOT, PG ? "data/extracted/mcc-pg" : "data/extracted/mcc");
const OUT = PG ? "mcc-pg-" : "mcc-";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const details = Object.values(readJson(path.join(ROOT, "data/raw/nexdoc/colleges_details.json")));
const seats = readJson(path.join(ROOT, "src/data/seats.json"));
const built = new Map(readJson(path.join(ROOT, "src/data/colleges.json")).map((c) => [c.id, c]));
const mbbsIds = new Set(
  seats.filter((s) => (PG ? s.track === "pg" : s.track === "ug" && s.course === "MBBS")).map((s) => s.collegeId),
);
const ugCrosswalk = PG ? readJson(path.join(CURATED, "mcc-college-crosswalk.json")) : {};
// A rule marked "track": "pg" was decided for PG names only, so UG ignores it.
const overrides = readJson(path.join(CURATED, "mcc-college-overrides.json")).filter((rule) => PG || rule.track !== "pg").map((rule) => ({
  ...rule,
  regex: new RegExp(rule.pattern, "i"),
}));

const SPELLINGS = {
  govt: "government", gov: "government", goverment: "government", gmc: "government medical college",
  med: "medical", medl: "medical", medcial: "medical", medial: "medical", mc: "medical college",
  coll: "college", collage: "college", clg: "college", inst: "institute", instt: "institute",
  institue: "institute", institutes: "institute", sci: "sciences", scie: "sciences", scien: "sciences",
  sce: "sciences", science: "sciences", res: "research", hos: "hospital", hosp: "hospital",
  hospt: "hospital", hopt: "hospital", host: "hospital", hospitals: "hospital",
  aiims: "all india institute medical sciences",
  bengaluru: "bangalore", banglore: "bangalore", mangaluru: "mangalore", kolkatta: "kolkata",
  pondicherry: "puducherry", dr: "", uni: "university",
};
const STOP = new Set(["of", "and", "the", "for", "at", "", "in", "a"]);

const tokens = (text) =>
  String(text)
    .toLowerCase()
    .replace(/\./g, "")
    .split(/[^a-z0-9]+/)
    .flatMap((word) => (SPELLINGS[word] ?? word).split(" "))
    .filter((word) => !STOP.has(word) && !/^\d+$/.test(word));

const candidates = details
  .filter((c) => mbbsIds.has(c.college_id))
  .map((c) => ({
    id: c.college_id,
    name: c.college_name,
    squashed: squash(c.college_name),
    tokens: new Set(tokens(c.college_name)),
    pin: String(c.pincode ?? "").replace(/\s/g, ""),
  }));

function score(text, candidate, pins) {
  const words = new Set(tokens(text));
  let hit = 0;
  for (const word of candidate.tokens) if (words.has(word)) hit++;
  const containment = hit / candidate.tokens.size;
  const pinMatch = Boolean(candidate.pin) && pins.includes(candidate.pin);
  return { containment, pinMatch, value: containment * 10 + hit * 0.25 + (pinMatch ? 4 : 0) };
}

/* Collect each MBBS institute name, and how many students it covers. */
const institutes = new Map();
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".csv"))) {
  for (const row of readCsv(path.join(dir, file))) {
    if (PG ? /DNB/i.test(row.quota) : row.course !== "MBBS") continue;
    const key = squash(row.institute);
    // Rounds space the same name differently, so every spelling is kept for the overrides.
    const entry = institutes.get(key) ?? { text: row.institute, texts: new Set(), students: 0 };
    entry.texts.add(row.institute);
    entry.students++;
    institutes.set(key, entry);
  }
}

const crosswalk = {};
const review = [];
const tally = { override: 0, notOnSite: 0, ug: 0, exact: 0, "pin+name": 0, review: 0 };

for (const [key, entry] of [...institutes].sort((a, b) => a[1].text.localeCompare(b[1].text))) {
  const short = entry.text.slice(0, 110);
  const rule = overrides.find((candidate) => [...entry.texts].some((text) => candidate.regex.test(text)));
  if (rule) {
    if (rule.id && !built.has(rule.id)) throw new Error(`Override "${rule.pattern}" names unknown college ${rule.id}`);
    crosswalk[key] = { id: rule.id, how: "override", mcc: short, site: rule.id ? built.get(rule.id).name : null };
    tally[rule.id ? "override" : "notOnSite"]++;
    continue;
  }
  if (key in ugCrosswalk) {
    const { id } = ugCrosswalk[key];
    crosswalk[key] = { id, how: "ug", mcc: short, site: id ? built.get(id).name : null };
    tally[id ? "ug" : "notOnSite"]++;
    continue;
  }
  const pins = entry.text.match(/\b\d{6}\b/g) ?? [];
  const ranked = candidates
    .map((candidate) => ({ candidate, ...score(entry.text, candidate, pins) }))
    .sort((a, b) => b.value - a.value);
  const [best, next] = ranked;

  // A full college name at the very start is strong evidence. The longest wins, so
  // "College, Surat" beats "College". A different PIN code means it's a different college.
  const prefix = candidates
    .filter((c) => key.startsWith(c.squashed))
    .sort((a, b) => b.squashed.length - a.squashed.length)[0];
  const pinConflict = prefix && prefix.pin && pins.length > 0 && !pins.includes(prefix.pin);

  let match = null;
  if (prefix && !pinConflict) match = { id: prefix.id, how: "exact" };
  else if (best.pinMatch && best.containment >= 0.6 && (!next.pinMatch || best.value - next.value >= 1)) {
    match = { id: best.candidate.id, how: "pin+name" };
  }

  if (match) {
    crosswalk[key] = { ...match, mcc: short, site: built.get(match.id).name };
    tally[match.how]++;
  } else {
    tally.review++;
    review.push({
      mcc: entry.text.slice(0, 170),
      students: entry.students,
      options: ranked.slice(0, 3).map((r) => `${r.candidate.id} | ${r.candidate.name} | ${r.candidate.pin}${r.pinMatch ? " | PIN" : ""}`),
    });
  }
}

fs.writeFileSync(path.join(CURATED, `${OUT}college-crosswalk.json`), JSON.stringify(crosswalk, null, 1) + "\n");
fs.writeFileSync(path.join(CURATED, `${OUT}matches-to-review.json`), JSON.stringify(review, null, 1) + "\n");
console.log("Institute names:", institutes.size, tally);
console.log(`To review: ${review.length}, covering ${review.reduce((sum, r) => sum + r.students, 0)} allotments`);
