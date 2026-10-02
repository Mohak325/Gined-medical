import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const readFile = (filename) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(projectRoot, filename), 'utf-8'));
  } catch (err) {
    console.error(`Error reading ${filename}:`, err.message);
    return [];
  }
};
const ensureDir = (dirPath) => { if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true }); };
const writeFile = (filename, data) => fs.writeFileSync(path.join(projectRoot, 'src', 'data', filename), JSON.stringify(data, null, 2), 'utf-8');

const rawColleges = readFile('nexdoc_colleges.json');
const rawCutoffs = readFile('nexdoc_cutoffs.json');
const rawUg = readFile('nexdoc_ug.json');

const stateCodeMap = {
  "andhra pradesh": "AP",
  "arunachal pradesh": "AR",
  "assam": "AS",
  "bihar": "BR",
  "chhattisgarh": "CG",
  "goa": "GA",
  "gujarat": "GJ",
  "haryana": "HR",
  "himachal pradesh": "HP",
  "jharkhand": "JH",
  "karnataka": "KA",
  "kerala": "KL",
  "madhya pradesh": "MP",
  "maharashtra": "MH",
  "manipur": "MN",
  "meghalaya": "ML",
  "mizoram": "MZ",
  "nagaland": "NL",
  "odisha": "OR",
  "punjab": "PB",
  "rajasthan": "RJ",
  "sikkim": "SK",
  "tamil nadu": "TN",
  "telangana": "TG",
  "tripura": "TR",
  "uttar pradesh": "UP",
  "uttarakhand": "UK",
  "west bengal": "WB",
  "andaman and nicobar islands": "AN",
  "andaman & nicobar islands": "AN",
  "chandigarh": "CH",
  "dadra and nagar haveli and daman and diu": "DH",
  "daman and diu": "DD",
  "delhi": "DL",
  "nct of delhi": "DL",
  "jammu and kashmir": "JK",
  "jammu & kashmir": "JK",
  "ladakh": "LA",
  "lakshadweep": "LD",
  "puducherry": "PY",
  "pondicherry": "PY"
};

const cleanString = (str) => {
  if (!str) return "";
  return str.replace(/[\uFFFD]/g, "").trim();
};

const normalizeName = (name) => {
  if (!name) return "";
  return name.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
};

// 1. Process Colleges
const colleges = [];
const statesSet = new Set();
const statesArray = [];
const nameToIdMap = new Map();
const normalizedNameToIdMap = new Map();

for (const raw of Object.values(rawColleges)) {
  const stateStr = cleanString(raw.state);
  const stateLower = stateStr.toLowerCase();
  const stateCode = stateCodeMap[stateLower] || "XX";
  
  if (stateStr && !statesSet.has(stateStr)) {
    statesSet.add(stateStr);
    statesArray.push({ code: stateCode, name: stateStr });
  }

  let type = "Private";
  const rawType = (raw.college_type || "").toLowerCase();
  const rawMgmt = (raw.management || "").toLowerCase();
  
  if (rawType.includes("government") || rawType.includes("govt") || rawMgmt.includes("government") || rawMgmt.includes("govt")) type = "Government";
  else if (rawType.includes("central") || rawType.includes("aiims") || rawType.includes("jipmer") || rawMgmt.includes("central")) type = "Central";
  else if (rawType.includes("deemed") || rawMgmt.includes("deemed")) type = "Deemed";

  const nmcRecognized = (raw.status || "").toLowerCase().includes("recognized");
  const established = parseInt(raw.year_of_inc, 10) || 0;

  const collegeName = cleanString(raw.college_name);

  const college = {
    id: String(raw.college_id),
    name: collegeName,
    city: cleanString(raw.city),
    state: stateStr,
    stateCode: stateCode,
    type: type,
    established: established,
    campusSize: "",
    hospitalBeds: 0,
    nmcRecognized: nmcRecognized,
    hero_image_url: null
  };
  
  colleges.push(college);
  
  nameToIdMap.set(collegeName, college.id);
  normalizedNameToIdMap.set(normalizeName(collegeName), college.id);
  if (raw.aliases && Array.isArray(raw.aliases)) {
    for (const alias of raw.aliases) {
      normalizedNameToIdMap.set(normalizeName(alias), college.id);
    }
  }
}

// 2. Process Cutoffs
const cutoffs = [];
let cutoffMatch = 0;
let cutoffUnmatch = 0;
let cutoffSkipped = 0;

for (const raw of rawCutoffs) {
  const normName = normalizeName(raw.college_name);
  let collegeId = nameToIdMap.get(raw.college_name) || normalizedNameToIdMap.get(normName);
  
  if (!collegeId) {
    for (const [key, val] of normalizedNameToIdMap.entries()) {
      if (key && (normName.includes(key) || key.includes(normName))) {
         collegeId = val;
         break;
      }
    }
  }

  if (!collegeId) {
    cutoffUnmatch++;
    continue;
  }
  cutoffMatch++;

  const course = cleanString(raw.course);
  
  let quotaStr = (raw.quota || "").toUpperCase();
  let quota = null;
  if (["AIQ", "OPEN_SEAT"].includes(quotaStr)) quota = "aiq";
  else if (["DEEMED"].includes(quotaStr)) quota = "deemed";
  else if (["DU", "AMU", "JIPMER", "CW_ARMED_FORCES"].includes(quotaStr)) quota = "central";
  else if (["STATE", "IPU", "ESI", "PUDUCHERRY_INTERNAL", "MUSLIM_MINORITY"].includes(quotaStr)) quota = "state";
  else {
    cutoffSkipped++;
    continue;
  }

  let catStr = (raw.category || "").toUpperCase();
  let category = null;
  if (catStr === "OPEN" || catStr === "UR") category = "general";
  else if (catStr === "OBC") category = "obc";
  else if (catStr === "SC") category = "sc";
  else if (catStr === "ST") category = "st";
  else if (catStr === "EWS") category = "ews";
  else {
    cutoffSkipped++;
    continue;
  }
  
  const processRound = (round, opRank, clRank) => {
    if (opRank !== null && opRank !== undefined && clRank !== null && clRank !== undefined) {
      cutoffs.push({
        collegeId: collegeId,
        track: "ug",
        course: course,
        quota: quota,
        category: category,
        round: round,
        year: 2024,
        openingRank: Number(opRank),
        closingRank: Number(clRank)
      });
    }
  };

  processRound(1, raw.r1_opening_rank, raw.r1_closing_rank);
  processRound(2, raw.r2_opening_rank, raw.r2_closing_rank);
  processRound(3, raw.r3_opening_rank, raw.r3_closing_rank);
}

// 3. Process Seats
const seats = [];
const coursesSet = new Set();
let seatsSkipped = 0;

for (const raw of rawUg) {
  const collegeId = String(raw.college_id);
  const course = cleanString(raw.course);
  if (course) coursesSet.add(course);
  
  let route = (raw.counseling_route || "").toUpperCase();
  let quota = "state";
  if (route === "AIQ") quota = "aiq";
  else if (route === "DEEMED") quota = "deemed";
  else if (route === "CENTRAL") quota = "central";
  
  const numSeats = Number(raw.seats);
  if (isNaN(numSeats) || numSeats <= 0) {
    seatsSkipped++;
    continue;
  }

  seats.push({
    collegeId: collegeId,
    track: "ug",
    course: course,
    quota: quota,
    category: "general",
    seats: numSeats
  });
}

const coursesArray = Array.from(coursesSet).map(c => ({ name: c }));

ensureDir(path.join(projectRoot, 'src', 'data'));
writeFile('colleges.json', colleges);
writeFile('cutoffs.json', cutoffs);
writeFile('seats.json', seats);
writeFile('courses.json', coursesArray);
writeFile('states.json', statesArray);

console.log(`--- Transformation Stats ---`);
console.log(`Colleges processed: ${colleges.length}`);
console.log(`Cutoff rows matched: ${cutoffMatch}, unmatched: ${cutoffUnmatch}, skipped due to category/quota: ${cutoffSkipped}`);
console.log(`Total cutoff entries generated: ${cutoffs.length}`);
console.log(`Total seat entries generated: ${seats.length}, skipped seats: ${seatsSkipped}`);
console.log(`Unique courses found: ${coursesArray.length}`);
console.log(`Unique states found: ${statesArray.length}`);
