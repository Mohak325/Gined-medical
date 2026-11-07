"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Columns3 } from "lucide-react";
import type { CollegeSummary } from "@/lib/medical/collegeSummary";
import { useCompare } from "@/lib/medical/CompareProvider";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import CollegeCover from "@/components/medical/shared/CollegeCover";
import EmptyState from "@/components/medical/shared/EmptyState";

type Row = {
  label: string;
  value: (c: CollegeSummary) => string;
  /** Which college is best on this row, if "best" means something here. */
  best?: (list: CollegeSummary[]) => string | undefined;
};

const pick = (list: CollegeSummary[], score: (c: CollegeSummary) => number | undefined, lowest: boolean) => {
  const scored = list.map((c) => [c.id, score(c)] as const).filter((x): x is readonly [string, number] => x[1] !== undefined && x[1] > 0);
  if (scored.length < 2) return undefined;
  scored.sort((a, b) => (lowest ? a[1] - b[1] : b[1] - a[1]));
  return scored[0][1] === scored[1][1] ? undefined : scored[0][0];
};

const ROWS: Row[] = [
  { label: "Type", value: (c) => c.type },
  { label: "Location", value: (c) => `${c.city}, ${c.state}` },
  { label: "Established", value: (c) => (c.established ? String(c.established) : "—") },
  { label: "MBBS seats", value: (c) => (c.mbbsSeats ? String(c.mbbsSeats) : "—"), best: (l) => pick(l, (c) => c.mbbsSeats, false) },
  { label: "PG seats", value: (c) => (c.pgSeats ? String(c.pgSeats) : "—") },
  { label: "All India close, General (R1)", value: (c) => formatRank(c.aiqClose), best: (l) => pick(l, (c) => c.aiqClose, false) },
  { label: "Yearly fee, lowest", value: (c) => formatCurrencyShort(c.feeMin), best: (l) => pick(l, (c) => c.feeMin, true) },
  { label: "Yearly fee, highest", value: (c) => formatCurrencyShort(c.feeMax) },
  { label: "Government quota fee", value: (c) => formatCurrencyShort(c.feeGovt), best: (l) => pick(l, (c) => c.feeGovt, true) },
  { label: "NMC status", value: (c) => c.nmcStatus ?? "—" },
  { label: "University", value: (c) => c.university ?? "—" },
];

const BEST_NOTE: Record<string, string> = {
  "MBBS seats": "most seats",
  "All India close, General (R1)": "easiest to get",
  "Yearly fee, lowest": "cheapest",
  "Government quota fee": "cheapest",
};

export default function CompareClient({ colleges }: { colleges: CollegeSummary[] }) {
  const router = useRouter();
  const { ids: trayIds, remove } = useCompare();
  const [onlyDifferences, setOnlyDifferences] = useState(false);

  // The nav link has no ids in its address, so open the tray's colleges instead.
  useEffect(() => {
    if (colleges.length === 0 && trayIds.length > 0) router.replace(`/medical/compare?ids=${trayIds.join(",")}`);
  }, [colleges.length, trayIds, router]);

  if (colleges.length === 0) {
    return (
      <EmptyState
        icon={<Columns3 className="w-12 h-12" />}
        title="No colleges to compare yet"
        description="Use the Compare button on any college in the directory, on a college page or in your finder results."
        actions={[{ label: "Browse colleges", href: "/medical/colleges" }]}
      />
    );
  }

  const handleRemove = (id: string) => {
    remove(id);
    const remaining = colleges.map((c) => c.id).filter((i) => i !== id);
    router.replace(remaining.length ? `/medical/compare?ids=${remaining.join(",")}` : "/medical/compare");
  };

  const rows = ROWS.filter((row) => !onlyDifferences || new Set(colleges.map(row.value)).size > 1);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-small text-text-muted">{colleges.length} of 4 colleges</p>
        <label className="inline-flex items-center gap-2 text-small text-ink cursor-pointer">
          <input type="checkbox" checked={onlyDifferences} onChange={(e) => setOnlyDifferences(e.target.checked)} className="accent-[var(--ink)]" />
          Only show differences
        </label>
      </div>

      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-hairline bg-paper-bright">
        <table className="w-full min-w-[640px] text-small table-fixed">
          <thead>
            <tr>
              <th scope="col" className="w-48 p-4 text-left align-bottom text-text-muted font-semibold">Compare</th>
              {colleges.map((c) => (
                <th key={c.id} scope="col" className="p-4 text-left align-top font-normal border-l border-hairline">
                  <CollegeCover id={c.id} type={c.type} stateCode={c.stateCode} showLabel={false} className="w-full h-20 rounded-[var(--radius-md)]" />
                  <Link href={`/medical/college/${c.id}`} className="block mt-3 text-small font-semibold text-ink hover:text-gold-deep line-clamp-2">{c.name}</Link>
                  <button type="button" onClick={() => handleRemove(c.id)} className="mt-2 inline-flex items-center gap-1 text-micro text-text-muted hover:text-ambitious">
                    <X className="w-3.5 h-3.5" aria-hidden /> Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row) => {
              const best = row.best?.(colleges);
              return (
                <tr key={row.label}>
                  <th scope="row" className="p-4 text-left font-medium text-text-muted">{row.label}</th>
                  {colleges.map((c) => (
                    <td key={c.id} className={`p-4 border-l border-hairline tabular-nums ${best === c.id ? "bg-safe/[0.07]" : ""}`}>
                      <span className="text-ink">{row.value(c)}</span>
                      {best === c.id && <span className="block text-micro font-semibold text-safe mt-0.5">{BEST_NOTE[row.label]}</span>}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-micro font-normal tracking-normal text-text-muted">Fees are official published MBBS fees per year; &quot;—&quot; means none has been published.</p>
    </div>
  );
}
