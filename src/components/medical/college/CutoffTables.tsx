import { Plus } from "lucide-react";
import meta from "@/data/meta.json";
import { formatRank } from "@/lib/medical/format";
import type { QuotaTable } from "@/lib/medical/collegeCutoffs";

function Table({ table }: { table: QuotaTable }) {
  const years = meta.cutoffYears.filter((y) => table.rows.some((r) => r.years[y]?.round1 || r.years[y]?.allRounds));
  const hasAll = (y: number) => table.rows.some((r) => r.years[y]?.allRounds);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-small">
        <thead>
          <tr className="text-left text-text-muted">
            <th scope="col" rowSpan={2} className="py-2 pr-4 font-semibold align-bottom">{table.quota === "state" ? "Seat" : "Category"}</th>
            {years.map((y) => (
              <th key={y} scope="colgroup" colSpan={hasAll(y) ? 2 : 1} className="pt-2 px-3 font-semibold text-ink text-right border-l border-hairline">{y}</th>
            ))}
          </tr>
          <tr className="text-right text-micro font-normal tracking-normal text-text-muted border-b border-hairline">
            {years.flatMap((y) => [
              <th key={`${y}-r1`} scope="col" className="pb-2 px-3 font-normal border-l border-hairline">Round 1</th>,
              ...(hasAll(y) ? [<th key={`${y}-all`} scope="col" className="pb-2 px-3 font-normal">All rounds</th>] : []),
            ])}
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {table.rows.map((row) => (
            <tr key={row.key} className="transition-colors hover:bg-gold/[0.06]">
              <th scope="row" className="py-3 pr-4 pl-2 text-left font-medium text-ink">{row.label}</th>
              {years.flatMap((y) => [
                <td key={`${y}-r1`} className="py-3 px-3 text-right tabular-nums font-semibold text-ink border-l border-hairline">{formatRank(row.years[y]?.round1)}</td>,
                ...(hasAll(y) ? [<td key={`${y}-all`} className="py-3 px-3 text-right tabular-nums text-text-muted">{formatRank(row.years[y]?.allRounds)}</td>] : []),
              ])}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** MBBS closing ranks by quota: All India open, the others folded so long state tables don't swamp the page. */
export default function CutoffTables({ tables }: { tables: QuotaTable[] }) {
  if (tables.length === 0) {
    return (
      <p className="rounded-[24px] surface-premium p-6 md:p-7 text-body text-text-muted">
        We don&apos;t hold MBBS closing ranks for this college yet. A counsellor can tell you how it filled in recent rounds.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {tables.map((table, i) => (
        <details key={table.quota} open={i === 0} className="group rounded-[24px] surface-premium overflow-hidden">
          <summary className="flex items-center justify-between gap-4 px-5 md:px-7 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <span>
              <span className="block font-[family-name:var(--font-instrument)] text-[1.6rem] leading-none text-ink">{table.label}</span>
              <span className="block mt-1.5 text-small font-normal text-text-muted">
                {table.rows.length} {table.quota === "state" ? "seat types" : "categories"}
                {table.stateRank && " · state ranks"}
              </span>
            </span>
            <span className="w-10 h-10 shrink-0 rounded-full bg-ink text-gold flex items-center justify-center transition-transform duration-500 group-open:rotate-45" aria-hidden>
              <Plus className="w-4 h-4" />
            </span>
          </summary>
          <div className="px-3 md:px-5 pb-5">
            <Table table={table} />
          </div>
        </details>
      ))}
      <p className="text-micro font-normal tracking-normal text-text-muted pt-1">
        Closing rank = the last rank that got a seat. &quot;All rounds&quot; includes later and stray rounds, where the source published them.
      </p>
    </div>
  );
}
