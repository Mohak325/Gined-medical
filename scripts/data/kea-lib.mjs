/**
 * How Karnataka's counselling labels translate to the site's labels.
 * Meanings come from KEA's UGNEET 2026 information bulletin and seat matrix.
 * See docs/data-guide.md.
 *
 * KEA's course code holds the college and seat type: M001MG is college M001, government seat.
 */
const SEAT_TYPES = { G: "government", P: "private", N: "nri", Q: "others" };

// Seats with their own eligibility rules, such as NCC, defence, minority and St John's.
const SPECIAL_GOVERNMENT = new Set(["PHM", "PH", "D", "DK", "XD", "SPO", "S-G", "NCC", "JK", "CAP", "AGL"]);
const SPECIAL_PRIVATE = /^(MA|MC|ME|MEH|MK|MM|MMH|MU|RC\d)$/;

// A base group plus a sub-quota: G general, R rural, K Kannada medium, H Hyderabad-Karnataka
// region, or a combination. S1 to S4 are the Scheduled Caste groups added in 2026.
const GOVERNMENT = /^(GM|1|2A|2B|3A|3B|SC|ST|S[1-4])(G|R|K|H|RH|KH)?$/;

export function parseCourseCode(code) {
  const match = String(code).match(/^(M\d{3})M([GPNQ])$/);
  if (!match) throw new Error(`Unexpected KEA course code "${code}".`);
  return { college: match[1], seatType: SEAT_TYPES[match[2]] };
}

/** Returns the site's quota and category for a KEA seat. An unknown code stops the build. */
export function mapSeat(seatType, code) {
  if (seatType === "government") {
    if (SPECIAL_GOVERNMENT.has(code)) return { quota: "special", category: "state_only" };
    if (GOVERNMENT.test(code)) {
      // Only the plain groups have a true match in the site's own categories. Calling 2A "OBC"
      // would hide that Karnataka fills each backward-class group separately.
      const category = { GM: "general", SCG: "sc", STG: "st" }[code] ?? "state_only";
      return { quota: "state", category };
    }
  }
  if (seatType === "private") {
    if (["GMP", "GMPH", "OPN"].includes(code)) return { quota: "state", category: "state_only" };
    if (SPECIAL_PRIVATE.test(code)) return { quota: "special", category: "state_only" };
  }
  if (seatType === "nri" && code === "NRI") return { quota: "nri", category: "state_only" };
  if (seatType === "others" && code === "OTH") return { quota: "management", category: "state_only" };
  throw new Error(`Unknown KEA seat: ${seatType} ${code}. Find out who it's for, then add it to kea-lib.mjs.`);
}

/**
 * Is this row a new allotment in this round? KEA also lists students who only kept an earlier
 * seat. 2025 Round 1 has no status column, because every row in it is new.
 */
const NEW = /^(allot|upgraded|newly)/i;
const KEPT = /^(not upgraded|round-\d+ reported|reproted|reported)/i;

export function isNewAllotment(status) {
  if (status === "" || NEW.test(status)) return true;
  if (KEPT.test(status)) return false;
  throw new Error(`Unknown KEA status "${status}". Decide whether it's a new seat, then add it to kea-lib.mjs.`);
}
