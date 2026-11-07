"use client";

import { useState, type CSSProperties } from "react";
import { ChevronDown } from "lucide-react";
import { computeConfidence, type ConfidenceLevel } from "@/lib/medical/confidence";
import { formatRank, parseIndianNumber } from "@/lib/medical/format";
import { bookingHref } from "@/lib/medical/booking";
import ConfidenceBadge from "@/components/medical/shared/ConfidenceBadge";
import Cta from "@/components/ui/Cta";

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

const fieldClass =
  "w-full appearance-none px-4 py-3 bg-white/[0.06] border border-white/15 rounded-2xl text-body text-text-on-dark placeholder:text-text-on-dark/45 focus:outline-none focus:border-gold transition-colors [&_option]:bg-paper-bright [&_option]:text-ink";
const DOT: Record<ConfidenceLevel, string> = { safe: "bg-safe", moderate: "bg-moderate", ambitious: "bg-ambitious", longshot: "bg-no-data" };

/** Where the rank sits against Round 1 and Rounds 1 to 3, on one line from rank 1 (left). */
function Gauge({ rank, round1, mainRounds, level }: { rank: number; round1: number; mainRounds?: number; level: ConfidenceLevel }) {
  const later = mainRounds && mainRounds > round1 ? mainRounds : undefined;
  const max = Math.max(rank, round1, later ?? 0) * 1.12;
  const share = (n: number) => Math.min(1, n / max);
  return (
    <div className="mt-5" aria-hidden>
      <div className="relative h-2">
        <div className="absolute inset-0 rounded-full bg-white/10 overflow-hidden">
          {later && <span className="bar-fill bg-gold/55" style={{ "--s": share(later) } as CSSProperties} />}
          <span className="bar-fill bg-white/35" style={{ "--s": share(round1) } as CSSProperties} />
        </div>
        <span className="bar-dot" style={{ "--s": share(rank) } as CSSProperties}>
          <span className={`absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full ring-[3px] ring-ink ${DOT[level]}`} />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-micro font-normal tracking-normal text-text-on-dark/70">
        <span className="inline-flex items-center gap-1.5"><span className={`w-2 h-2 rounded-full ${DOT[level]}`} />You</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded-full bg-white/35" />Round 1</span>
        {later && <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-1.5 rounded-full bg-gold/70" />Rounds 1–3</span>}
      </div>
    </div>
  );
}

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
    <div data-reveal="up" className="relative overflow-hidden rounded-[28px] bg-ink text-text-on-dark p-6 md:p-7 grain">
      <div aria-hidden className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative z-[2]">
        <p className="text-eyebrow text-gold">Check yourself</p>
        <h2 className="font-[family-name:var(--font-instrument)] text-[2rem] leading-none mt-3">Your chances here</h2>
        <p className="text-small text-text-on-dark/70 mt-2">Compared with {collegeName}&apos;s {option.year} Round 1 closing rank.</p>

        <div className="grid gap-3 mt-6">
          <div>
            <label htmlFor="ch-rank" className="block text-small font-semibold text-text-on-dark/85 mb-1.5">{option.stateRank ? "Your state rank" : "Your NEET rank"}</label>
            <input
              id="ch-rank"
              inputMode="numeric"
              placeholder="e.g. 12,500"
              value={rankText}
              onChange={(e) => setRankText(e.target.value.replace(/[^\d,]/g, ""))}
              className={`${fieldClass} tabular-nums font-[family-name:var(--font-instrument)] !text-[1.75rem] !py-2.5`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ch-quota" className="block text-small font-semibold text-text-on-dark/85 mb-1.5">Quota</label>
              <div className="relative">
                <select
                  id="ch-quota"
                  value={quota}
                  onChange={(e) => {
                    setQuota(e.target.value);
                    setCategory(options.find((o) => o.quota === e.target.value)?.category ?? "general");
                  }}
                  className={`${fieldClass} pr-9 text-small`}
                >
                  {quotas.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-on-dark/60" aria-hidden />
              </div>
            </div>
            <div>
              <label htmlFor="ch-category" className="block text-small font-semibold text-text-on-dark/85 mb-1.5">Category</label>
              <div className="relative">
                <select id="ch-category" value={option.category} onChange={(e) => setCategory(e.target.value)} className={`${fieldClass} pr-9 text-small`}>
                  {categories.map((o) => (
                    <option key={o.category} value={o.category}>{o.categoryLabel}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-on-dark/60" aria-hidden />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl surface-ink-glass p-4" aria-live="polite">
          {level && rank ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <ConfidenceBadge level={level} />
                {laterRounds && <span className="text-micro font-semibold text-gold">Reached in Round 2 or 3</span>}
              </div>
              <p className="text-small text-text-on-dark/75 mt-3">
                Round 1 closed at <strong className="text-text-on-dark tabular-nums">{formatRank(option.round1)}</strong>
                {option.mainRounds && option.mainRounds > option.round1 ? (
                  <>
                    {" "}and Rounds 1–3 reached <strong className="text-text-on-dark tabular-nums">{formatRank(option.mainRounds)}</strong>
                  </>
                ) : null}
                . Your rank is {formatRank(rank)}.
              </p>
              <Gauge rank={rank} round1={option.round1} mainRounds={option.mainRounds} level={level} />
            </>
          ) : (
            <p className="text-small text-text-on-dark/75">
              Round 1 closed at <strong className="text-text-on-dark tabular-nums">{formatRank(option.round1)}</strong> for {option.categoryLabel}. Enter your rank to see where you stand.
            </p>
          )}
        </div>

        <Cta
          href={bookingHref({ source: "college-chances", rank: rank ?? undefined, quota, category: option.quota === "state" ? undefined : option.category })}
          variant="gold"
          className="mt-5 w-full"
        >
          Talk through this college
        </Cta>
        <p className="text-micro font-normal tracking-normal text-text-on-dark/60 mt-3">A guide from past closing ranks, not a guarantee.</p>
      </div>
    </div>
  );
}
