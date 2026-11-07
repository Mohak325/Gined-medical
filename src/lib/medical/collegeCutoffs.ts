/**
 * A college's MBBS closing ranks arranged for its page: one row per quota and category (or the
 * state's own seat code), with Round 1 and all-rounds closing ranks for each year we hold.
 */
import meta from "@/data/meta.json";
import type { CutoffEntry } from "./mockData";
import type { ChanceOption } from "@/components/medical/college/ChancesHere";

export const QUOTA_LABELS: Record<string, string> = { aiq: "All India", state: "State quota", deemed: "Deemed", central: "Central" };
const CATEGORY_ORDER = ["general", "ews", "obc", "sc", "st"];
const CATEGORY_NAMES: Record<string, string> = { general: "General", ews: "EWS", obc: "OBC", sc: "SC", st: "ST" };

function categoryLabel(c: CutoffEntry): string {
  if (c.quota === "state" && c.stateCategory) {
    const options = (meta.stateOptions as Record<string, { code: string; label: string }[]>)[c.state ?? ""] ?? [];
    return options.find((o) => o.code === c.stateCategory)?.label ?? c.stateCategory;
  }
  const [base, pwd] = c.category.split("_");
  return `${CATEGORY_NAMES[base] ?? base}${pwd ? " (PwD)" : ""}`;
}

const rowKey = (c: CutoffEntry) => (c.quota === "state" && c.stateCategory ? `s:${c.stateCategory}` : c.category);
const sortValue = (c: CutoffEntry) => {
  const [base, pwd] = c.category.split("_");
  const i = CATEGORY_ORDER.indexOf(base);
  return (i === -1 ? 50 : i) * 2 + (pwd ? 1 : 0);
};

export interface CutoffRow {
  key: string;
  label: string;
  years: Record<number, { round1?: number; allRounds?: number; mainRounds?: number }>;
}

export interface QuotaTable {
  quota: string;
  label: string;
  stateRank: boolean;
  rows: CutoffRow[];
}

const laterRounds = new Set(meta.laterRounds);

export function mbbsCutoffTables(cutoffs: CutoffEntry[]): QuotaTable[] {
  const tables = new Map<string, QuotaTable & { order: Map<string, number> }>();
  for (const c of cutoffs) {
    if (c.track !== "ug" || c.course !== "MBBS" || !(c.quota in QUOTA_LABELS)) continue;
    const table: QuotaTable & { order: Map<string, number> } =
      tables.get(c.quota) ?? { quota: c.quota, label: QUOTA_LABELS[c.quota], stateRank: false, rows: [], order: new Map() };
    if (c.rankType === "state") table.stateRank = true;
    const key = rowKey(c);
    let row = table.rows.find((r) => r.key === key);
    if (!row) {
      row = { key, label: categoryLabel(c), years: {} };
      table.rows.push(row);
      table.order.set(key, sortValue(c));
    }
    const year = (row.years[c.year] ??= {});
    if (c.round === 1) year.round1 = Math.max(year.round1 ?? 0, c.closingRank);
    // "All rounds" only for years whose source published rounds after Round 1.
    if (laterRounds.has(`ug|${c.year}|${c.quota === "state" ? c.state : c.quota}`)) {
      year.allRounds = Math.max(year.allRounds ?? 0, c.closingRank);
      if (c.round <= 3) year.mainRounds = Math.max(year.mainRounds ?? 0, c.closingRank);
    }
    tables.set(c.quota, table);
  }
  return ["aiq", "state", "deemed", "central"]
    .map((q) => tables.get(q))
    .filter((t): t is QuotaTable & { order: Map<string, number> } => !!t)
    .map(({ order, ...table }) => ({ ...table, rows: table.rows.sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0) || a.label.localeCompare(b.label)) }));
}

/** The latest year's Round 1 closing rank per quota and category, for "Your chances here". */
export function chanceOptions(tables: QuotaTable[]): ChanceOption[] {
  const options: ChanceOption[] = [];
  for (const table of tables) {
    for (const row of table.rows) {
      const year = Math.max(...Object.keys(row.years).map(Number).filter((y) => row.years[y].round1));
      if (!Number.isFinite(year)) continue;
      const data = row.years[year];
      options.push({
        quota: table.quota,
        quotaLabel: table.label,
        category: row.key,
        categoryLabel: row.label,
        year,
        round1: data.round1!,
        mainRounds: data.mainRounds,
        stateRank: table.stateRank,
      });
    }
  }
  return options;
}
