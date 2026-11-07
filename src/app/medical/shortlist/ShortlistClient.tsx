"use client";

import { useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { ArrowDown, ArrowUp, Bookmark, Copy, GripVertical, Printer, Trash2, X } from "lucide-react";
import { computeConfidence, type ConfidenceLevel } from "@/lib/medical/confidence";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import { useShortlist, shortlistText } from "@/lib/medical/shortlist";
import { useKeyed } from "@/lib/medical/useKeyed";
import { bookingHref } from "@/lib/medical/booking";
import ConfidenceBadge from "@/components/medical/shared/ConfidenceBadge";
import EmptyState from "@/components/medical/shared/EmptyState";
import Cta from "@/components/ui/Cta";
import TweenNumber from "@/components/motion/TweenNumber";
import { LABEL_COPY } from "@/content/labels";
import { getShortlistDetails } from "./actions";

const RAIL: Record<ConfidenceLevel, string> = { safe: "bg-safe", moderate: "bg-moderate", ambitious: "bg-ambitious", longshot: "bg-no-data" };
const SPREAD = ["safe", "moderate", "ambitious", "longshot"] as const;
const SPREAD_TONE = { safe: "bg-safe", moderate: "bg-moderate", ambitious: "bg-ambitious", longshot: "bg-white/25" } as const;
const pillClass =
  "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full surface-premium text-small font-semibold text-ink transition-transform duration-300 hover:-translate-y-0.5 active:scale-95";

/**
 * Runs a change to the list inside a view transition, so the rows glide to their new places.
 * The page-level fade is switched off for this one, and nothing animates with reduced motion.
 */
function withGlide(change: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } };
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    change();
    return;
  }
  document.documentElement.classList.add("vt-list");
  const transition = doc.startViewTransition(() => flushSync(change));
  transition.finished.finally(() => document.documentElement.classList.remove("vt-list"));
}

export default function ShortlistClient() {
  const { entries, move, remove, clear, rank, rankText, setRankText } = useShortlist();
  const ids = entries.map((e) => e.id);
  const details = useKeyed(ids.length ? ids.join(",") : null, () => getShortlistDetails(ids));
  const byId = new Map((details ?? []).map((c) => [c.id, c]));
  const [dragging, setDragging] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Bookmark />}
        title="Your shortlist is empty"
        description="Save colleges from your College Finder results, the directory or any college page. They stay in this browser, in the order you choose."
        actions={[
          { label: "Check my chances", href: "/medical#finder" },
          { label: "Browse colleges", href: "/medical/colleges" },
        ]}
      />
    );
  }

  const labels = entries.map((e) => (rank && e.closing ? computeConfidence(rank, e.closing) : undefined));
  const counts = { safe: 0, moderate: 0, ambitious: 0, longshot: 0 } as Record<ConfidenceLevel, number>;
  labels.forEach((l) => l && counts[l]++);
  const labelled = labels.filter(Boolean).length;
  // Worth a counsellor's look: a long list, or one leaning on long odds.
  const needsReview = entries.length >= 10 || (labelled > 0 && (counts.ambitious + counts.longshot) / labelled > 0.5);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shortlistText(entries));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing else to do.
    }
  };

  return (
    <div className="grid gap-8 lg:gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8 min-w-0">
        <div data-reveal="up" className="flex flex-wrap items-end justify-between gap-4 mb-6 print:hidden">
          <div>
            <label htmlFor="sl-rank" className="block text-eyebrow text-text-muted mb-2">Your rank</label>
            <input
              id="sl-rank"
              inputMode="numeric"
              placeholder="e.g. 12,500"
              value={rankText}
              onChange={(e) => setRankText(e.target.value.replace(/[^\d,]/g, ""))}
              className="w-48 px-5 py-2.5 rounded-2xl surface-premium font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none text-ink tabular-nums placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()} className={pillClass}>
              <Printer className="w-4 h-4" aria-hidden /> Print or save PDF
            </button>
            <button type="button" onClick={copy} className={pillClass}>
              <Copy className="w-4 h-4" aria-hidden /> {copied ? "Copied" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remove every college from your shortlist?")) clear();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-small font-semibold text-text-muted hover:text-[var(--ambitious-ink)] transition-colors"
            >
              <Trash2 className="w-4 h-4" aria-hidden /> Clear
            </button>
          </div>
        </div>

        <p className="hidden print:block text-small mb-4">Rank: {rank ? formatRank(rank) : "not entered"} · Printed from gined.in</p>

        <ol className="space-y-3">
          {entries.map((entry, i) => {
            const c = byId.get(entry.id);
            const level = labels[i];
            return (
              <li
                key={entry.id}
                draggable
                onDragStart={() => setDragging(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragging !== null && dragging !== i) withGlide(() => move(dragging, i));
                  setDragging(null);
                }}
                onDragEnd={() => setDragging(null)}
                style={{ viewTransitionName: `sl-${entry.id}` } as CSSProperties}
                className={`group relative flex items-center gap-3 sm:gap-4 rounded-[22px] surface-premium pl-4 pr-3 sm:pl-5 sm:pr-4 py-4 break-inside-avoid transition-[box-shadow,opacity] duration-300 hover:shadow-[var(--shadow-lift)] print:shadow-none ${
                  dragging === i ? "opacity-50 ring-2 ring-gold" : ""
                }`}
              >
                {level && <span aria-hidden className={`absolute left-0 top-5 bottom-5 w-[3px] rounded-r-full ${RAIL[level]}`} />}
                <GripVertical className="w-4 h-4 text-text-muted shrink-0 cursor-grab opacity-50 group-hover:opacity-100 transition-opacity print:hidden" aria-hidden />
                <span className="w-9 text-right font-[family-name:var(--font-instrument)] text-[2rem] leading-none text-ink/80 tabular-nums shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/medical/college/${entry.id}`} className="font-[family-name:var(--font-instrument)] text-[1.25rem] sm:text-[1.4rem] leading-[1.15] text-ink hover:text-gold-deep transition-colors">
                    {entry.name}
                  </Link>
                  <p className="text-micro font-normal tracking-normal text-text-muted mt-1">
                    {c ? `${c.type} · ${c.city}, ${c.state}` : ""}
                    {c?.feeMin ? ` · fee from ${formatCurrencyShort(c.feeMin)}` : ""}
                    {entry.closing ? ` · closed at ${formatRank(entry.closing)}${entry.basis ? ` (${entry.basis})` : ""}` : ""}
                  </p>
                </div>
                {level && (
                  <span className="shrink-0 hidden sm:inline">
                    <ConfidenceBadge level={level} />
                  </span>
                )}
                <div className="flex items-center gap-0.5 shrink-0 print:hidden">
                  <button
                    type="button"
                    onClick={() => withGlide(() => move(i, i - 1))}
                    disabled={i === 0}
                    aria-label={`Move ${entry.name} up`}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-ink hover:bg-ink/[0.06] disabled:opacity-30 transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => withGlide(() => move(i, i + 1))}
                    disabled={i === entries.length - 1}
                    aria-label={`Move ${entry.name} down`}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-ink hover:bg-ink/[0.06] disabled:opacity-30 transition-colors"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => withGlide(() => remove(entry.id))}
                    aria-label={`Remove ${entry.name}`}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-[var(--ambitious-ink)] hover:bg-ambitious/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-micro font-normal tracking-normal text-text-muted print:hidden">Drag to reorder, or use the arrows. Your list stays in this browser only.</p>
      </div>

      <aside className="lg:col-span-4 print:hidden">
        <div className="lg:sticky lg:top-28 space-y-5">
          <section aria-labelledby="mix-title" data-reveal="up" className="relative overflow-hidden rounded-[28px] bg-ink text-text-on-dark p-6 md:p-7 grain">
            <div aria-hidden className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-gold/15 blur-3xl" />
            <div className="relative z-[2]">
              <p className="text-eyebrow text-gold">At a glance</p>
              <h2 id="mix-title" className="font-[family-name:var(--font-instrument)] text-[2rem] leading-none mt-3">Your mix</h2>
              {rank ? (
                <>
                  <dl className="grid grid-cols-3 gap-3 mt-6">
                    {LABEL_COPY.map((label) => (
                      <div key={label.level}>
                        <dt className="flex items-center gap-1.5 text-small text-text-on-dark/80">
                          <span className={`w-2 h-2 rounded-full ${label.tone}`} aria-hidden />
                          {label.name}
                        </dt>
                        <dd className="font-[family-name:var(--font-instrument)] text-[2.75rem] leading-none tabular-nums mt-2">
                          <TweenNumber value={counts[label.level]} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {labelled > 0 && (
                    <div className="relative mt-6 h-2 rounded-full bg-white/10 overflow-hidden" aria-hidden>
                      {SPREAD.map((level, i) => {
                        const before = SPREAD.slice(0, i).reduce((sum, l) => sum + counts[l], 0);
                        return <span key={level} className={`bar-fill ${SPREAD_TONE[level]}`} style={{ "--o": before / labelled, "--s": counts[level] / labelled } as CSSProperties} />;
                      })}
                    </div>
                  )}
                  <p className="text-small text-text-on-dark/75 mt-5">
                    {counts.longshot > 0 && `${counts.longshot} are long shots. `}
                    {entries.length - labelled > 0 && `${entries.length - labelled} have no closing rank to compare. `}A list that can still upgrade usually puts the colleges you want most first, and keeps enough Safe options lower down.
                  </p>
                </>
              ) : (
                <p className="text-small text-text-on-dark/75 mt-3">Enter your rank to see how many of these are Safe, Moderate or Ambitious.</p>
              )}
            </div>
          </section>

          <div
            data-reveal="up"
            style={{ "--delay": "120ms" } as CSSProperties}
            className={`rounded-[28px] p-6 md:p-7 ${needsReview ? "relative overflow-hidden bg-ink-deep text-text-on-dark grain" : "surface-premium"}`}
          >
            {needsReview && <div aria-hidden className="absolute -left-16 -bottom-20 w-64 h-64 rounded-full bg-gold/20 blur-3xl" />}
            <div className="relative z-[2]">
              <h2 className={`font-[family-name:var(--font-instrument)] text-[2rem] leading-[1.05] ${needsReview ? "" : "text-ink"}`}>Review my choice list.</h2>
              <p className={`text-small mt-3 ${needsReview ? "text-text-on-dark/75" : "text-text-muted"}`}>
                {needsReview
                  ? "Long lists and lists heavy on Ambitious colleges are where order matters most. A counsellor can check yours before choice filling closes."
                  : "Send this list to a counsellor and plan the order together."}
              </p>
              <Cta href={bookingHref({ source: "shortlist", rank })} variant={needsReview ? "gold" : "ink"} className="mt-6 w-full">
                Send my list to a counsellor
              </Cta>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
