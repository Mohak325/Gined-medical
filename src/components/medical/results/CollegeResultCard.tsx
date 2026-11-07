import Link from "next/link";
import type { CSSProperties } from "react";
import { MapPin, ArrowUpRight } from "lucide-react";
import { formatRank } from "@/lib/medical/format";
import type { LabelledRow } from "@/lib/medical/finder";
import ConfidenceBadge from "@/components/medical/shared/ConfidenceBadge";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import SaveToShortlistButton from "@/components/medical/shared/SaveToShortlistButton";

const DOT: Record<LabelledRow["confidence"], string> = {
  safe: "bg-safe",
  moderate: "bg-moderate",
  ambitious: "bg-ambitious",
  longshot: "bg-no-data",
};

const GLOW: Record<LabelledRow["confidence"], string> = {
  safe: "rgba(31,122,92,0.14)",
  moderate: "rgba(201,162,75,0.18)",
  ambitious: "rgba(181,72,42,0.13)",
  longshot: "rgba(168,162,150,0.16)",
};

/**
 * Where the student's rank sits against Round 1's closing rank and how far all rounds reached,
 * on one line from rank 1 (left) to a little past the furthest of the three. The bars grow in
 * when the card first appears, and the marker glides as the what-if rank changes.
 */
function ReachBar({ row, rank }: { row: LabelledRow; rank: number }) {
  const r1 = row.cutoff.closingRank;
  const all = row.allRounds && row.allRounds.closingRank > r1 ? row.allRounds.closingRank : undefined;
  const max = Math.max(rank, r1, all ?? 0) * 1.12;
  const share = (n: number) => Math.min(1, n / max);

  return (
    <div>
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-ink/[0.07] overflow-hidden">
          {all && <span className="bar-fill bg-gold/45" style={{ "--s": share(all), "--bar-delay": "250ms" } as CSSProperties} />}
          <span className="bar-fill bg-ink/25" style={{ "--s": share(r1), "--bar-delay": "120ms" } as CSSProperties} />
        </div>
        <span className="bar-dot" style={{ "--s": share(rank) } as CSSProperties} aria-hidden>
          <span className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-[3px] ring-paper-bright shadow-[0_2px_8px_rgba(8,26,36,0.35)] ${DOT[row.confidence]}`} />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-micro font-normal tracking-normal text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${DOT[row.confidence]}`} aria-hidden />
          Your rank {formatRank(rank)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-1.5 rounded-full bg-ink/25" aria-hidden />
          Round 1 reached
        </span>
        {all && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-1.5 rounded-full bg-gold/60" aria-hidden />
            Later rounds reached
          </span>
        )}
      </div>
    </div>
  );
}

export default function CollegeResultCard({ row, rank, delay = 0 }: { row: LabelledRow; rank: number; delay?: number }) {
  const { college, cutoff, allRounds } = row;
  const showAll = allRounds && allRounds.closingRank > cutoff.closingRank;
  const quotaLabel = cutoff.state ? `${cutoff.state} ${cutoff.stateCategory ?? ""}`.trim() : cutoff.quota.toUpperCase();

  return (
    <article data-reveal="up" style={{ "--delay": `${delay}ms` } as CSSProperties}>
      <div
        data-spotlight=""
        style={{ "--spot": GLOW[row.confidence] } as CSSProperties}
        className="group relative surface-premium rounded-[24px] p-5 sm:p-7 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
      >
        <span aria-hidden className={`absolute left-0 top-7 bottom-7 w-[3px] rounded-r-full ${DOT[row.confidence]}`} />
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <ConfidenceBadge level={row.confidence} />
              {row.laterRounds && allRounds && (
                <span
                  className="text-micro font-semibold text-[var(--moderate-ink)] bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full"
                  title={`Round 1 closed before your rank, but ${allRounds.year} counselling reached it in Round 2 or 3`}
                >
                  Reached in {allRounds.year !== cutoff.year ? `${allRounds.year} ` : ""}Round 2 or 3
                </span>
              )}
              <span className="text-micro font-semibold text-text-muted bg-paper-dim/80 px-2 py-0.5 rounded-full">{college.type}</span>
            </div>

            <Link
              href={`/medical/college/${college.id}`}
              className="inline-flex items-start gap-2 font-[family-name:var(--font-instrument)] text-[1.5rem] md:text-[1.75rem] leading-[1.1] text-ink hover:text-gold-deep transition-colors"
            >
              <span>{college.name}</span>
              <span className="mt-1 w-7 h-7 shrink-0 rounded-full bg-ink text-gold flex items-center justify-center opacity-0 -translate-x-1 transition-[opacity,transform] duration-500 group-hover:opacity-100 group-hover:translate-x-0 group-hover:rotate-45" aria-hidden>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            {cutoff.track === "pg" && <p className="text-small font-semibold text-gold-deep mt-1">{cutoff.course}</p>}
            <p className="flex items-center gap-1.5 text-small text-text-muted mt-2">
              <MapPin className="w-3.5 h-3.5" aria-hidden />
              {college.city}, {college.state}
              {college.established > 0 && <span>· Est. {college.established}</span>}
            </p>

            <div className="mt-6">
              <ReachBar row={row} rank={rank} />
            </div>
          </div>

          <div className="sm:w-48 shrink-0 flex flex-wrap sm:flex-col sm:flex-nowrap items-end sm:items-stretch justify-between gap-4 sm:text-right border-t sm:border-t-0 sm:border-l border-hairline pt-5 sm:pt-0 sm:pl-7">
            <dl className="flex gap-6 sm:block sm:space-y-3">
              <div>
                <dt className="text-micro font-normal tracking-normal text-text-muted">
                  {cutoff.rankType === "state" ? "Closing state rank" : "Closing rank"}, {cutoff.year} R{cutoff.round}
                  <span className="sm:hidden"> · {quotaLabel}</span>
                </dt>
                <dd className="font-[family-name:var(--font-instrument)] text-[2.5rem] leading-none text-ink tabular-nums mt-1">{formatRank(cutoff.closingRank)}</dd>
              </div>
              {showAll && (
                <div title="The furthest rank that got this seat in any round of that year, including the stray round">
                  <dt className="text-micro font-normal tracking-normal text-text-muted">{allRounds.year} all rounds</dt>
                  <dd className="text-body font-semibold text-ink tabular-nums mt-1 sm:mt-0">{formatRank(allRounds.closingRank)}</dd>
                </div>
              )}
            </dl>
            <p className="hidden sm:block text-micro font-normal tracking-normal text-text-muted -mt-2">{quotaLabel}</p>
            <div className="ml-auto sm:ml-0 flex sm:flex-col items-end gap-2">
              <SaveToShortlistButton
                entry={{
                  id: college.id,
                  name: cutoff.track === "pg" ? `${college.name} (${cutoff.course})` : college.name,
                  closing: cutoff.closingRank,
                  basis: `${quotaLabel} · ${cutoff.year} R${cutoff.round}`,
                }}
              />
              <AddToCompareButton collegeId={college.id} collegeName={college.name} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
