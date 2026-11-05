/**
 * Shared helpers for reading the rows extracted from MCC's result PDFs.
 * See docs/data-guide.md for what each of these labels means.
 */
import fs from "node:fs";

/** Reads a CSV file into objects, following the quoting rules a spreadsheet uses. */
export function readCsv(file) {
  const text = fs.readFileSync(file, "utf8");
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n") { row.push(cell.replace(/\r$/, "")); rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [header, ...body] = rows;
  return body.map((values) => Object.fromEntries(header.map((key, i) => [key, values[i] ?? ""])));
}

/**
 * Table cells wrap, so the PDF gives "Employee s State" and "Self- Financed".
 * Removing every space and lowering the case gives one spelling for each label.
 */
export const squash = (value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * MCC quota label to the site's quota. "special" quotas have their own eligibility
 * rules, so they must not be mixed into a prediction for an ordinary student.
 * null means the row is deliberately left out. An unlisted label stops the build.
 */
const QUOTA_TABLE = [
  ["All India", "aiq", "AIQ"],
  ["Open Seat Quota", "aiq", "OPEN_SEAT"],
  ["Deemed/Paid Seats Quota", "deemed", "DEEMED"],
  ["Self-Financed Merit Seat", "deemed", "SELF_FINANCED"],
  ["Delhi University Quota", "central", "DU"],
  ["Aligarh Muslim University (AMU) Quota", "central", "AMU"],
  ["IP University Quota", "special", "IPU"],
  ["Employees State Insurance Scheme(ESI)", "special", "ESI"],
  ["Internal - Puducherry UT Domicile", "special", "PUDUCHERRY_INTERNAL"],
  ["Delhi NCR Children/Widows of Personnel of the Armed Forces (CW) DU Quota", "special", "CW_DU"],
  ["Delhi NCR Children/Widows of Personnel of the Armed Forces (CW) IP Quota", "special", "CW_IP"],
  ["Muslim Minority Quota", "special", "MUSLIM_MINORITY"],
  ["Muslim Quota", "special", "JAMIA_MUSLIM"],
  ["Muslim OBC Quota", "special", "JAMIA_MUSLIM_OBC"],
  ["Muslim ST Quota", "special", "JAMIA_MUSLIM_ST"],
  ["Muslim Women Quota", "special", "JAMIA_MUSLIM_WOMEN"],
  ["Jamia Internal Quota", "special", "JAMIA_INTERNAL"],
  ["Jain Minority Quota", "special", "JAIN_MINORITY"],
  ["(AMU) Self finance All India", "special", "AMU_SELF_FINANCE"],
  ["(AMU)Self finance internal", "special", "AMU_SELF_FINANCE_INTERNAL"],
  ["Non-Resident Indian", "nri", "NRI"],
  ["Non-Resident Indian(AMU)Quota", "nri", "NRI_AMU"],
  ["Non-Resident Indian(Jamia)Quota", "nri", "NRI_JAMIA"],
  ["Foreign Country Quota", null, "FOREIGN"],
  ["B.Sc Nursing All India", null, "NURSING"],
  ["B.Sc Nursing Delhi NCR", null, "NURSING"],
  ["B.Sc Nursing IP CW Quota", null, "NURSING"],
  ["B.Sc Nursing Delhi NCR CW Quota", null, "NURSING"],
  ["Employees State Insurance Scheme Nursing Quota (ESI-IP Quota Nursing)", null, "NURSING"],
];

const QUOTAS = new Map(QUOTA_TABLE.map(([label, quota, detail]) => [squash(label), { quota, detail }]));

export function mapQuota(label) {
  const found = QUOTAS.get(squash(label));
  if (!found) throw new Error(`Unknown MCC quota "${label}". Find out who it is for, then add it to QUOTA_TABLE.`);
  return found;
}

const CATEGORIES = {
  open: "general",
  obc: "obc",
  sc: "sc",
  st: "st",
  ews: "ews",
  openpwd: "general_pwd",
  obcpwd: "obc_pwd",
  scpwd: "sc_pwd",
  stpwd: "st_pwd",
  ewspwd: "ews_pwd",
};

export function mapCategory(label) {
  const found = CATEGORIES[squash(label)];
  if (!found) throw new Error(`Unknown MCC category "${label}". Add it to CATEGORIES.`);
  return found;
}

/**
 * Is this row a new allotment made in this round?
 *
 * A closing rank answers "how far down the list did this round's allotments reach?".
 * Students who merely kept an earlier seat don't answer that. MCC's 2026 lists include
 * them, marked "Retained", and its 2025 lists leave them out, so they are skipped here
 * and both years then mean the same thing.
 */
export const isNewAllotment = (row) => /^(allotted|fresh allotted|upgraded)/i.test(row.remarks);
