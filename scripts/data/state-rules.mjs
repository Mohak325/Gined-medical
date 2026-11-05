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
