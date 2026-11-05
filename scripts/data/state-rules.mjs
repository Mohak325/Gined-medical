/**
 * How each state's counselling labels translate to the site's labels.
 * Karnataka has its own files (kea-lib.mjs). Every other state lives here.
 *
 * Only list a seat code under "options" once its meaning is confirmed in the state's own
 * documents. Those are what students can pick in the predictor. Anything else stays "special",
 * so it's kept in the data without being offered as a prediction.
 *
 * map(row) returns { code, seatType, quota, category }, or null if the row isn't a seat
 * allotted in this round. An unknown label should throw, so that a new label gets looked at.
 */
const SITE_CATEGORY = { UR: "general", SC: "sc", ST: "st", EWS: "ews", OBC: "obc" };
const squash = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

// Andhra Pradesh has three regions, ten or so categories, and general or female seats.
const AP_REGIONS = { UR: "Unreserved", AU: "AU region", SVU: "SVU region" };
const AP_CATEGORIES = { OC: "OC", EWS: "EWS", BCA: "BC-A", BCB: "BC-B", BCC: "BC-C", BCD: "BC-D", BCE: "BC-E", SC1: "SC group 1", SC2: "SC group 2", SC3: "SC group 3", ST: "ST", MINORITY: "Minority" };
const AP_OPTIONS = Object.entries(AP_REGIONS).flatMap(([region, regionLabel]) =>
  Object.entries(AP_CATEGORIES).flatMap(([category, categoryLabel]) => [
    { code: `${region}-${category}-G`, label: `${regionLabel}, ${categoryLabel}` },
    { code: `${region}-${category}-F`, label: `${regionLabel}, ${categoryLabel}, female seat` },
  ])
);

// Telangana's categories, each with general and female seats.
const TG_CATEGORIES = { OPEN: "Open", EWS: "EWS", BCA: "BC-A", BCB: "BC-B", BCC: "BC-C", BCD: "BC-D", BCE: "BC-E", SC1: "SC group 1", SC2: "SC group 2", SC3: "SC group 3", ST: "ST", MIN: "Minority" };
const TG_OPTIONS = Object.entries(TG_CATEGORIES).flatMap(([code, label]) => [
  { code: `${code}-G`, label },
  { code: `${code}-F`, label: `${label}, female seat` },
]);

export const STATES = {
  BR: {
    name: "Bihar",
    authority: "BCECEB (Bihar Combined Entrance Competitive Examination Board)",
    isMbbs: (row) => squash(row.course) === "mbbs",
    options: [
      { code: "UR", label: "Unreserved (UR)" }, { code: "UR-F", label: "Unreserved, female seat" },
      { code: "EWS", label: "EWS" }, { code: "EWS-F", label: "EWS, female seat" },
      { code: "BC", label: "Backward Class (BC)" }, { code: "BC-F", label: "Backward Class, female seat" },
      { code: "EBC", label: "Extremely Backward Class (EBC)" }, { code: "EBC-F", label: "Extremely Backward Class, female seat" },
      { code: "SC", label: "SC" }, { code: "SC-F", label: "SC, female seat" },
      { code: "ST", label: "ST" }, { code: "ST-F", label: "ST, female seat" },
    ],
    map(row) {
      const base = row.category.trim();
      if (base === "NRI") return { code: "NRI", seatType: "nri", quota: "nri", category: "state_only" };
      // DQ is the disability quota. RCG, MM, SM and WQ have rules we haven't confirmed.
      if (["DQ", "RCG", "MM", "SM", "WQ"].includes(base)) return { code: base, seatType: "others", quota: "special", category: "state_only" };
      if (!["UR", "EWS", "BC", "EBC", "SC", "ST"].includes(base)) throw new Error(`Unknown Bihar category "${base}".`);
      const female = /female/i.test(row.seat);
      return {
        code: female ? `${base}-F` : base,
        seatType: "government",
        quota: "state",
        category: female ? "state_only" : (SITE_CATEGORY[base] ?? "state_only"),
      };
    },
  },

  AP: {
    name: "Andhra Pradesh",
    authority: "Dr. NTR University of Health Sciences",
    isMbbs: (row) => row.course === "MBBS",
    options: [
      ...AP_OPTIONS,
      { code: "CA-SF", label: "Self-finance seats in government colleges (CA-SF)" },
      { code: "MGMT-B1", label: "Management quota, category B1" },
      { code: "MGMT-B2", label: "Management quota, category B2" },
    ],
    map(row, source) {
      // Later lists repeat earlier phases' students, each marked with the phase of their seat.
      const wanted = source.round === 4 ? "Stray" : `Phase-${source.round}`;
      if (row.phase !== wanted) return null;
      const parts = row.category.split(/\s*-\s*/).filter(Boolean);
      if (source.quota === "MQ") {
        const code = row.category.replace(/\s+/g, "").replace(/-L$/, "");
        if (code === "B1" || code === "B2") return { code: `MGMT-${code}`, seatType: "others", quota: "state", category: "state_only" };
        if (code === "CA-SF") return { code, seatType: "others", quota: "state", category: "state_only" };
        if (code === "C" || code === "CA-NRI") return { code, seatType: "nri", quota: "nri", category: "state_only" };
        throw new Error(`Unknown Andhra Pradesh management seat "${row.category}".`);
      }
      // MRC marks a meritorious reserved student in a reserved seat, so it stays with that category.
      const flags = parts.filter((part) => part === "MRC");
      const rest = parts.filter((part) => part !== "MRC");
      const [region, category] = rest;
      if (category === "ANGLO") return { code: rest.join("-"), seatType: "government", quota: "special", category: "state_only" };
      if (!(region in AP_REGIONS) || !(category in AP_CATEGORIES)) throw new Error(`Unknown Andhra Pradesh seat "${row.category}".`);
      const gender = rest[rest.length - 1] === "F" || rest.includes("F") ? "F" : "G";
      // PH, CAP, NCC, sports and similar seats have their own eligibility rules.
      const special = rest.filter((part) => ![region, category, "G", "F"].includes(part));
      void flags;
      if (special.length > 0) return { code: rest.join("-"), seatType: "government", quota: "special", category: "state_only" };
      const code = `${region}-${category}-${gender}`;
      return { code, seatType: "government", quota: "state", category: code === "UR-OC-G" ? "general" : "state_only" };
    },
  },

  TG: {
    name: "Telangana",
    authority: "KNRUHS (Kaloji Narayana Rao University of Health Sciences)",
    isMbbs: (row) => row.course === "MBBS",
    options: [
      ...TG_OPTIONS,
      { code: "MGMT-LOCAL", label: "Management quota, category B, local" },
      { code: "MGMT-OPEN", label: "Management quota, category B, unreserved" },
    ],
    map(row, source) {
      // Each seat tag ends in its phase. Later lists repeat earlier phases' seats.
      const parts = row.category.split("-");
      const phase = parts.pop();
      if (phase !== `P${source.round}`) return null;
      if (source.quota === "MQ") {
        const [kind, area] = parts;
        if (kind === "NRI") return { code: "NRI", seatType: "nri", quota: "nri", category: "state_only" };
        if (kind !== "CTB" || !["LOC", "UNR"].includes(area)) throw new Error(`Unknown Telangana management seat "${row.category}".`);
        return { code: area === "LOC" ? "MGMT-LOCAL" : "MGMT-OPEN", seatType: "others", quota: "state", category: "state_only" };
      }
      const [base, gender] = parts;
      if (!(base in TG_CATEGORIES) || !["GEN", "FEM"].includes(gender)) throw new Error(`Unknown Telangana seat "${row.category}".`);
      // MRC and MSM annotate the student's seat. Others, such as PHO, CAP and NCC, have their own rules.
      const special = parts.slice(2).filter((part) => !["MRC", "MSM"].includes(part));
      if (special.length > 0) return { code: parts.join("-"), seatType: "government", quota: "special", category: "state_only" };
      const code = `${base}-${gender === "FEM" ? "F" : "G"}`;
      const site = { "OPEN-G": "general", "ST-G": "st", "EWS-G": "ews" }[code] ?? "state_only";
      return { code, seatType: "government", quota: "state", category: site };
    },
  },

  HR: {
    name: "Haryana",
    authority: "Department of Medical Education and Research, Haryana",
    isMbbs: (row) => squash(row.course) === "mbbs",
    options: [
      { code: "OPEN", label: "Open" }, { code: "EWS", label: "EWS" }, { code: "BCA", label: "BC-A" }, { code: "BCB", label: "BC-B" },
      { code: "OSC", label: "OSC" }, { code: "SCD", label: "SC Deprived" }, { code: "MINORITY", label: "Minority" }, { code: "MGMT", label: "Management quota seats" },
    ],
    map(row) {
      const label = row.category.replace(/\s+/g, " ").trim();
      if (/^NRI/i.test(label)) return { code: "NRI", seatType: "nri", quota: "nri", category: "state_only" };
      if (label === "MGT") return { code: "MGMT", seatType: "others", quota: "state", category: "state_only" };
      // Disability and ex-servicemen or freedom fighter seats have their own rules.
      if (/PWBD|ESM/.test(label)) return { code: label, seatType: "government", quota: "special", category: "state_only" };
      const found = { "OPEN CAT": ["OPEN", "general"], EWS: ["EWS", "ews"], BCA: ["BCA", "state_only"], BCB: ["BCB", "state_only"], OSC: ["OSC", "state_only"], "SC DEPRIVED": ["SCD", "state_only"], MINORITY: ["MINORITY", "state_only"] }[label];
      if (!found) throw new Error(`Unknown Haryana category "${label}".`);
      return { code: found[0], seatType: "government", quota: "state", category: found[1] };
    },
  },

  MH: {
    name: "Maharashtra",
    authority: "State Common Entrance Test Cell, Maharashtra",
    isMbbs: (row) => row.course === "MBBS",
    options: ["OPEN", "OBC", "SEBC", "EWS", "SC", "ST", "VJA", "NTB", "NTC", "NTD"].flatMap((code) => {
      const label = { OPEN: "Open", VJA: "VJ(A)", NTB: "NT(B)", NTC: "NT(C)", NTD: "NT(D)" }[code] ?? code;
      return code === "NOP" ? [] : [{ code, label }, { code: `${code}-W`, label: `${label}, women's quota` }];
    }).concat({ code: "MGMT", label: "Institute quota seats" }),
    map(row) {
      // A candidate's own category can run into the next column, as in "SEBCHA OPEN".
      const label = row.category.replace(/\s+/g, "").toUpperCase().replace(/^SEBC(?=HA|PWD|PEM|D[123]|ORP)/, "");
      // Institute quota, without a minority mark, is the management route.
      if (label === "I.Q.") return { code: "MGMT", seatType: "others", quota: "state", category: "state_only" };
      // Minority, defence, disability, hilly area, orphan and other seats have their own rules.
      // MKB isn't in the list's legend, so it isn't offered until its meaning is confirmed.
      if (/MINO|^D[123]|^PWD|^PEM|^HA|^ORP|^I\.Q\.|NRI|^MKB/.test(label)) return { code: label, seatType: "others", quota: "special", category: "state_only" };
      // EMD and EMR mark seats earmarked between categories. The seat stays in its category.
      const match = label.replace(/\((EMD|EMR)\)/g, "").replace(/^EM/, "").match(/^(OPEN|OBC|SEBC|EWS|SC|ST|VJA|NTB|NTC|NTD)(W|\(W\))?$/);
      if (!match) throw new Error(`Unknown Maharashtra category "${row.category}".`);
      const women = Boolean(match[2]);
      const site = { OPEN: "general", SC: "sc", ST: "st", EWS: "ews", OBC: "obc" }[match[1]];
      return { code: women ? `${match[1]}-W` : match[1], seatType: "government", quota: "state", category: women ? "state_only" : (site ?? "state_only") };
    },
  },

  GJ: {
    name: "Gujarat",
    authority: "ACPUGMEC (Admission Committee for Professional Undergraduate Medical Educational Courses)",
    // Gujarat lists colleges by short labels. Medical ones end in MED, plus these two.
    isMbbs: (row) => /MED$/.test(row.college) || ["NHL", "SMC"].includes(row.college),
    options: [
      { code: "OPEN", label: "Open" }, { code: "SEBC", label: "SEBC" }, { code: "EWS", label: "EWS" },
      { code: "SC", label: "SC" }, { code: "ST", label: "ST" }, { code: "MGMT", label: "Management quota seats" },
    ],
    map(row, source) {
      // Later lists repeat students who kept a seat from an earlier round.
      if (Number(row.admRound) !== source.round) return null;
      if (row.quota === "MQ") return { code: "MGMT", seatType: "others", quota: "state", category: "state_only" };
      if (row.quota === "NQ") return { code: "NRI", seatType: "nri", quota: "nri", category: "state_only" };
      if (row.quota === "LQ") return { code: "LOCAL", seatType: "others", quota: "special", category: "state_only" };
      if (row.quota !== "GQ") throw new Error(`Unknown Gujarat quota "${row.quota}".`);
      if (/PH$/.test(row.category)) return { code: row.category, seatType: "government", quota: "special", category: "state_only" };
      const found = { OP: ["OPEN", "general"], SE: ["SEBC", "state_only"], EW: ["EWS", "ews"], SC: ["SC", "sc"], ST: ["ST", "st"] }[row.category];
      if (!found) throw new Error(`Unknown Gujarat category "${row.category}".`);
      return { code: found[0], seatType: "government", quota: "state", category: found[1] };
    },
  },

  RJ: {
    name: "Rajasthan",
    authority: "NEET UG Admission / Counselling Board, SMS Medical College, Jaipur",
    isMbbs: (row) => squash(row.course) === "mbbs",
    options: [
      { code: "UR", label: "Unreserved (UR)" }, { code: "UR-F", label: "Unreserved, female seat" },
      { code: "OBC", label: "OBC-NCL" }, { code: "OBC-F", label: "OBC-NCL, female seat" },
      { code: "MBC", label: "MBC-NCL" }, { code: "MBC-F", label: "MBC-NCL, female seat" },
      { code: "EWS", label: "EWS" }, { code: "EWS-F", label: "EWS, female seat" },
      { code: "SC", label: "SC" }, { code: "SC-F", label: "SC, female seat" },
      { code: "ST", label: "ST" }, { code: "ST-F", label: "ST, female seat" },
      { code: "STA", label: "ST-STA" }, { code: "STA-F", label: "ST-STA, female seat" },
      { code: "MGMT", label: "Management quota seats" },
    ],
    map(row) {
      // The seat type is in brackets after the college's name.
      const seat = row.college.match(/\((General|Government|Management|NRI)\)\s*$/i)?.[1]?.toLowerCase();
      if (!seat) throw new Error(`No seat type on Rajasthan college "${row.college}".`);
      if (seat === "nri") return { code: "NRI", seatType: "nri", quota: "nri", category: "state_only" };
      if (seat === "management") return { code: "MGMT", seatType: "others", quota: "state", category: "state_only" };
      const match = row.category.trim().match(/^(UR|OB|MB|EB|SC|ST|SA)(B|G)$/);
      if (!match) throw new Error(`Unknown Rajasthan category "${row.category}".`);
      const base = { UR: "UR", OB: "OBC", MB: "MBC", EB: "EWS", SC: "SC", ST: "ST", SA: "STA" }[match[1]];
      // The bulletin sets aside 25% of each category for women. "G" appears to mark those seats.
      const female = match[2] === "G";
      return {
        code: female ? `${base}-F` : base,
        seatType: seat === "government" ? "government" : "private",
        quota: "state",
        category: female ? "state_only" : (SITE_CATEGORY[base] ?? "state_only"),
      };
    },
  },

  CG: {
    name: "Chhattisgarh",
    authority: "Directorate of Medical Education, Chhattisgarh",
    isMbbs: (row) => squash(row.course) === "mbbs",
    options: [
      { code: "UR-NC", label: "Unreserved (UR-NC)" }, { code: "UR-F", label: "Unreserved, female seat" },
      { code: "OBC-NC", label: "OBC (OBC-NC)" }, { code: "OBC-F", label: "OBC, female seat" },
      { code: "SC-NC", label: "SC (SC-NC)" }, { code: "SC-F", label: "SC, female seat" },
      { code: "ST-NC", label: "ST (ST-NC)" }, { code: "ST-F", label: "ST, female seat" },
      { code: "EWS-NC", label: "EWS (EWS-NC)" },
      { code: "MGMT", label: "Management quota seats" },
    ],
    map(row) {
      // Unfilled seats can convert between quotas, as in "Mgmt (Converted UR)".
      const quota = row.quota.replace(/\s+/g, " ").trim();
      if (/^Mgmt/i.test(quota)) return { code: "MGMT", seatType: "others", quota: "state", category: "state_only" };
      if (/^NRI/i.test(quota)) return { code: "NRI", seatType: "nri", quota: "nri", category: "state_only" };
      if (/^Minority/i.test(quota)) return { code: "MINORITY", seatType: "others", quota: "special", category: "state_only" };
      if (!/^GQ/i.test(quota)) throw new Error(`Unknown Chhattisgarh quota "${quota}".`);
      // Round 1 writes UR-F, and later rounds write "UR- Female". Make them the same code.
      const label = row.category.replace(/\s+/g, "").replace(/-Female$/i, "-F").replace(/^SpecialST/i, "SST");
      const match = label.match(/^(UR|OBC|SC|ST|EWS)-(NC|F)$/);
      if (match) {
        return {
          code: label,
          seatType: "government",
          quota: "state",
          category: match[2] === "NC" ? (SITE_CATEGORY[match[1]] ?? "state_only") : "state_only",
        };
      }
      if (/^(UR|OBC|SC|ST|EWS)-(PH|EX|FF)$/.test(label) || /^SST-(NC|F)$/.test(label)) {
        return { code: label, seatType: "government", quota: "special", category: "state_only" };
      }
      throw new Error(`Unknown Chhattisgarh category "${row.category}".`);
    },
  },
};
