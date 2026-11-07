"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { computeConfidence } from "@/lib/medical/confidence";
import { formatRank, parseIndianNumber } from "@/lib/medical/format";
import { bookingHref } from "@/lib/medical/booking";
import ConfidenceBadge from "@/components/medical/shared/ConfidenceBadge";

/** One seat group's latest Round 1 closing rank, and how far Rounds 1 to 3 reached that year. */
export interface ChanceOption {
  quota: string;
  quotaLabel: string;
  category: string;
  categoryLabel: string;
  year: number;
  round1: number;
  mainRounds?: number;
  stateRank?: boolean;
}

const fieldClass = "w-full px-3 py-2.5 bg-paper border border-border-strong rounded-[var(--radius-sm)] text-body focus:outline-none focus:border-ink";

export default function ChancesHere({ collegeName, options }: { collegeName: string; options: ChanceOption[] }) {
  const quotas = [...new Map(options.map((o) => [o.quota, o.quotaLabel])).entries()];
  const [quota, setQuota] = useState(quotas[0]?.[0] ?? "aiq");
  const categories = options.filter((o) => o.quota === quota);
  const [category, setCategory] = useState(categories[0]?.category ?? "general");
  const [rankText, setRankText] = useState("");

  if (options.length === 0) return null;
  const option = categories.find((o) => o.category === category) ?? categories[0];
  const rank = parseIndianNumber(rankText);

  let level = rank ? computeConfidence(rank, option.round1) : undefined;
  // As in the College Finder: a seat Round 1 never reached but Round 2 or 3 did becomes Ambitious.
  const laterRounds = !!rank && !!option.mainRounds && rank > option.round1 && rank <= option.mainRounds;
  if (laterRounds && level === "longshot") level = "ambitious";

  return (
    <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6">
      <h2 className="text-h3 text-ink">Your chances here</h2>
      <p className="text-small text-text-muted mt-1">Compared with {collegeName}&apos;s {option.year} Round 1 closing rank.</p>

      <div className="grid gap-3 mt-5">
        <div>
          <label htmlFor="ch-rank" className="block text-small font-semibold text-ink mb-1.5">{option.stateRank ? "Your state rank" : "Your NEET rank"}</label>
          <input id="ch-rank" inputMode="numeric" placeholder="e.g. 12,500" value={rankText} onChange={(e) => setRankText(e.target.value.replace(/[^\d,]/g, ""))} className={`${fieldClass} tabular-nums`} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="ch-quota" className="block text-small font-semibold text-ink mb-1.5">Quota</label>
            <select
              id="ch-quota"
              value={quota}
              onChange={(e) => {
                setQuota(e.target.value);
                setCategory(options.find((o) => o.quota === e.target.value)?.category ?? "general");
              }}
              className={fieldClass}
            >
              {quotas.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ch-category" className="block text-small font-semibold text-ink mb-1.5">Category</label>
            <select id="ch-category" value={option.category} onChange={(e) => setCategory(e.target.value)} className={fieldClass}>
              {categories.map((o) => (
                <option key={o.category} value={o.category}>{o.categoryLabel}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[var(--radius-md)] bg-paper p-4 border border-hairline" aria-live="polite">
        {level && rank ? (
          <>
            <div className="flex items-center gap-2">
              <ConfidenceBadge level={level} />
              {laterRounds && <span className="text-micro font-semibold text-gold-deep">Reached in Round 2 or 3</span>}
            </div>
            <p className="text-small text-text-muted mt-2">
              Round 1 closed at <strong className="text-ink tabular-nums">{formatRank(option.round1)}</strong>
              {option.mainRounds && option.mainRounds > option.round1 ? (
                <> and Rounds 1–3 reached <strong className="text-ink tabular-nums">{formatRank(option.mainRounds)}</strong></>
              ) : null}
              . Your rank is {formatRank(rank)}.
            </p>
          </>
        ) : (
          <p className="text-small text-text-muted">
            Round 1 closed at <strong className="text-ink tabular-nums">{formatRank(option.round1)}</strong> for {option.categoryLabel}. Enter your rank to see where you stand.
          </p>
        )}
      </div>

      <Link
        href={bookingHref({ source: "college-chances", rank: rank ?? undefined, quota, category: option.quota === "state" ? undefined : option.category })}
        className="mt-5 inline-flex w-full items-center justify-center gap-1.5 px-5 py-3 bg-ink text-text-on-dark font-semibold text-small rounded-full hover:bg-ink-soft"
      >
        Talk through this college <ArrowUpRight className="w-4 h-4 text-gold" aria-hidden />
      </Link>
      <p className="text-micro font-normal tracking-normal text-text-muted mt-3">A guide from past closing ranks, not a guarantee.</p>
    </div>
  );
}
