import Link from "next/link";
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

/**
 * Where the student's rank sits against Round 1's closing rank and how far all rounds reached,
 * on one line from rank 1 (left) to a little past the furthest of the three.
 */
function ReachBar({ row, rank }: { row: LabelledRow; rank: number }) {
  const r1 = row.cutoff.closingRank;
  const all = row.allRounds && row.allRounds.closingRank > r1 ? row.allRounds.closingRank : undefined;
  const max = Math.max(rank, r1, all ?? 0) * 1.12;
  const pos = (n: number) => `${Math.min(100, (n / max) * 100)}%`;

  return (
    <div>
      <div className="relative h-2 rounded-full bg-paper-dim">
        <div className="absolute inset-y-0 left-0 rounded-full bg-ink/15" style={{ width: pos(r1) }} />
        {all && <div className="absolute inset-y-0 rounded-r-full bg-gold/35" style={{ left: pos(r1), width: `calc(${pos(all)} - ${pos(r1)})` }} />}
        <span
          className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-2 ring-paper-bright ${DOT[row.confidence]}`}
          style={{ left: pos(rank) }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-micro font-normal tracking-normal text-text-muted">
        <span className="inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${DOT[row.confidence]}`} aria-hidden />Your rank {formatRank(rank)}</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded-full bg-ink/25" aria-hidden />Round 1 reached</span>
        {all && <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded-full bg-gold/60" aria-hidden />Later rounds reached</span>}
      </div>
    </div>
  );
}

export default function CollegeResultCard({ row, rank }: { row: LabelledRow; rank: number }) {
  const { college, cutoff, allRounds } = row;
  const showAll = allRounds && allRounds.closingRank > cutoff.closingRank;
  const quotaLabel = cutoff.state ? `${cutoff.state} ${cutoff.stateCategory ?? ""}`.trim() : cutoff.quota.toUpperCase();

  return (
    <article className="group rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-5 sm:p-6 transition-colors hover:border-border-strong">
      <div className="flex flex-col sm:flex-row gap-5 sm:gap-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <ConfidenceBadge level={row.confidence} />
            {row.laterRounds && allRounds && (
              <span
                className="text-micro font-semibold text-gold-deep bg-gold/10 border border-gold/25 px-2 py-0.5 rounded-full"
                title={`Round 1 closed before your rank, but ${allRounds.year} counselling reached it in Round 2 or 3`}
              >
                Reached in {allRounds.year !== cutoff.year ? `${allRounds.year} ` : ""}Round 2 or 3
              </span>
            )}
            <span className="text-micro font-semibold text-text-muted bg-paper-dim px-2 py-0.5 rounded-full">{college.type}</span>
          </div>

          <Link href={`/medical/college/${college.id}`} className="inline-flex items-start gap-1.5 text-h4 text-ink hover:text-gold-deep transition-colors">
            <span>{college.name}</span>
            <ArrowUpRight className="w-4 h-4 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />
          </Link>
          {cutoff.track === "pg" && <p className="text-small font-semibold text-gold-deep mt-1">{cutoff.course}</p>}
          <p className="flex items-center gap-1.5 text-small text-text-muted mt-1.5">
            <MapPin className="w-3.5 h-3.5" aria-hidden />
            {college.city}, {college.state}
            {college.established > 0 && <span className="text-text-muted/80">· Est. {college.established}</span>}
          </p>

          <div className="mt-5">
            <ReachBar row={row} rank={rank} />
          </div>
        </div>

        <div className="sm:w-48 shrink-0 flex sm:flex-col justify-between gap-4 sm:text-right border-t sm:border-t-0 sm:border-l border-hairline pt-4 sm:pt-0 sm:pl-6">
          <dl className="space-y-3">
            <div>
              <dt className="text-micro font-normal tracking-normal text-text-muted">
                {cutoff.rankType === "state" ? "Closing state rank" : "Closing rank"}, {cutoff.year} R{cutoff.round}
              </dt>
              <dd className="text-h2 text-ink tabular-nums">{formatRank(cutoff.closingRank)}</dd>
            </div>
            {showAll && (
              <div title="The furthest rank that got this seat in any round of that year, including the stray round">
                <dt className="text-micro font-normal tracking-normal text-text-muted">{allRounds.year} all rounds</dt>
                <dd className="text-body font-semibold text-ink tabular-nums">{formatRank(allRounds.closingRank)}</dd>
              </div>
            )}
            <dd className="text-micro font-normal tracking-normal text-text-muted">{quotaLabel}</dd>
          </dl>
          <div className="self-end sm:self-auto flex sm:flex-col items-end gap-2">
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
    </article>
  );
}
