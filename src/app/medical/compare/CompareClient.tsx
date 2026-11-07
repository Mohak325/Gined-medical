"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Columns3, Plus, Sparkles } from "lucide-react";
import type { CollegeSummary } from "@/lib/medical/collegeSummary";
import { useCompare, COMPARE_MAX } from "@/lib/medical/CompareProvider";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import CollegeImage from "@/components/medical/shared/CollegeImage";
import EmptyState from "@/components/medical/shared/EmptyState";

type Row = {
  label: string;
  value: (c: CollegeSummary) => string;
  /** Which college is best on this row, if "best" means something here. */
  best?: (list: CollegeSummary[]) => string | undefined;
  /** Show the value large, as a headline figure. */
  figure?: boolean;
};

const pick = (list: CollegeSummary[], score: (c: CollegeSummary) => number | undefined, lowest: boolean) => {
  const scored = list.map((c) => [c.id, score(c)] as const).filter((x): x is readonly [string, number] => x[1] !== undefined && x[1] > 0);
  if (scored.length < 2) return undefined;
  scored.sort((a, b) => (lowest ? a[1] - b[1] : b[1] - a[1]));
  return scored[0][1] === scored[1][1] ? undefined : scored[0][0];
};

const ROWS: Row[] = [
  { label: "All India close, General (R1)", value: (c) => formatRank(c.aiqClose), best: (l) => pick(l, (c) => c.aiqClose, false), figure: true },
  { label: "MBBS seats", value: (c) => (c.mbbsSeats ? String(c.mbbsSeats) : "—"), best: (l) => pick(l, (c) => c.mbbsSeats, false), figure: true },
  { label: "Yearly fee, lowest", value: (c) => formatCurrencyShort(c.feeMin), best: (l) => pick(l, (c) => c.feeMin, true), figure: true },
  { label: "Yearly fee, highest", value: (c) => formatCurrencyShort(c.feeMax) },
  { label: "Government quota fee", value: (c) => formatCurrencyShort(c.feeGovt), best: (l) => pick(l, (c) => c.feeGovt, true) },
  { label: "PG seats", value: (c) => (c.pgSeats ? String(c.pgSeats) : "—") },
  { label: "Type", value: (c) => c.type },
  { label: "Location", value: (c) => `${c.city}, ${c.state}` },
  { label: "Established", value: (c) => (c.established ? String(c.established) : "—") },
  { label: "NMC status", value: (c) => c.nmcStatus ?? "—" },
  { label: "University", value: (c) => c.university ?? "—" },
];

const BEST_NOTE: Record<string, string> = {
  "MBBS seats": "Most seats",
  "All India close, General (R1)": "Easiest to get",
  "Yearly fee, lowest": "Cheapest",
  "Government quota fee": "Cheapest",
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
        icon={<Columns3 />}
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
  const openSlots = Math.max(0, COMPARE_MAX - colleges.length);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6" data-reveal="up">
        <div>
          <p className="font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3rem] leading-none text-ink tabular-nums">
            {colleges.length} <span className="text-text-muted">/ {COMPARE_MAX}</span>
          </p>
          <div className="mt-3 flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: COMPARE_MAX }, (_, i) => (
              <span key={i} className={`h-1.5 w-8 rounded-full transition-colors duration-500 ${i < colleges.length ? "bg-gold" : "bg-ink/10"}`} />
            ))}
          </div>
          <p className="text-small text-text-muted mt-2">colleges in this comparison</p>
        </div>
        <label className="inline-flex items-center gap-3 text-small text-ink cursor-pointer select-none">
          <input type="checkbox" checked={onlyDifferences} onChange={(e) => setOnlyDifferences(e.target.checked)} className="peer sr-only" />
          <span
            aria-hidden
            className="relative w-10 h-6 rounded-full bg-ink/15 transition-colors duration-300 peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:bg-paper-bright after:shadow-sm after:transition-transform after:duration-300 peer-checked:after:translate-x-4"
          />
          Only show differences
        </label>
      </div>

      <div data-reveal="up" className="overflow-x-auto rounded-[28px] surface-premium">
        <table className="w-full min-w-[600px] sm:min-w-[680px] text-small table-fixed">
          <thead>
            <tr>
              <th scope="col" className="w-32 sm:w-44 md:w-52 p-4 sm:p-5 text-left align-bottom text-eyebrow text-text-muted sticky left-0 z-10 bg-paper-bright">
                Compare
              </th>
              {colleges.map((c, i) => (
                <th key={c.id} scope="col" className="p-4 md:p-5 text-left align-top font-normal border-l border-hairline">
                  <div className="group" data-reveal="up" style={{ "--delay": `${i * 90}ms` } as CSSProperties}>
                    <Link href={`/medical/college/${c.id}`} className="block relative h-24 rounded-[18px] overflow-hidden" tabIndex={-1} aria-hidden>
                      <span className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                        <CollegeImage college={c} sizes="240px" />
                      </span>
                    </Link>
                    <Link
                      href={`/medical/college/${c.id}`}
                      className="block mt-4 font-[family-name:var(--font-instrument)] text-[1.3rem] leading-[1.15] text-ink hover:text-gold-deep transition-colors line-clamp-3"
                    >
                      {c.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleRemove(c.id)}
                      aria-label={`Remove ${c.name}`}
                      className="mt-3 inline-flex items-center gap-1 rounded-full border border-hairline px-2.5 py-1 text-micro font-semibold text-text-muted hover:border-ambitious/40 hover:text-[var(--ambitious-ink)] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" aria-hidden /> Remove
                    </button>
                  </div>
                </th>
              ))}
              {openSlots > 0 && (
                <th scope="col" className="p-4 md:p-5 align-top font-normal border-l border-hairline">
                  <Link
                    href="/medical/colleges"
                    className="group flex h-24 flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-ink/15 text-small font-semibold text-text-muted hover:border-gold hover:text-ink transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full bg-ink text-gold flex items-center justify-center transition-transform duration-500 group-hover:rotate-90" aria-hidden>
                      <Plus className="w-4 h-4" />
                    </span>
                    Add a college
                  </Link>
                  <p className="mt-4 text-micro font-normal tracking-normal text-text-muted">
                    {openSlots} more slot{openSlots === 1 ? "" : "s"}
                  </p>
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {rows.map((row) => {
              const best = row.best?.(colleges);
              return (
                <tr key={row.label} className="transition-colors hover:bg-gold/[0.04]">
                  <th scope="row" className="p-4 sm:p-5 text-left text-micro sm:text-small font-medium text-text-muted sticky left-0 z-10 bg-paper-bright">
                    {row.label}
                  </th>
                  {colleges.map((c) => (
                    <td key={c.id} className={`p-4 md:p-5 border-l border-hairline tabular-nums align-top ${best === c.id ? "bg-[var(--safe-bg)]" : ""}`}>
                      <span className={`block text-ink ${row.figure ? "font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none" : ""}`}>{row.value(c)}</span>
                      {best === c.id && (
                        <span className="mt-2 flex items-center gap-1 text-micro font-semibold text-[var(--safe-ink)]">
                          <Sparkles className="w-3 h-3" aria-hidden />
                          {BEST_NOTE[row.label]}
                        </span>
                      )}
                    </td>
                  ))}
                  {openSlots > 0 && <td className="border-l border-hairline" />}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-micro font-normal tracking-normal text-text-muted">Fees are official published MBBS fees per year; &quot;—&quot; means none has been published.</p>
    </div>
  );
}
