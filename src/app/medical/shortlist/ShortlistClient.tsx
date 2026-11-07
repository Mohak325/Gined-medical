"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpRight, Bookmark, Copy, GripVertical, Printer, Trash2, X } from "lucide-react";
import { computeConfidence, type ConfidenceLevel } from "@/lib/medical/confidence";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import { useShortlist, shortlistText } from "@/lib/medical/shortlist";
import { useKeyed } from "@/lib/medical/useKeyed";
import { bookingHref } from "@/lib/medical/booking";
import ConfidenceBadge from "@/components/medical/shared/ConfidenceBadge";
import EmptyState from "@/components/medical/shared/EmptyState";
import { getShortlistDetails } from "./actions";

const TONES: Record<Exclude<ConfidenceLevel, "longshot">, string> = { safe: "text-safe", moderate: "text-gold-deep", ambitious: "text-ambitious" };

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
        icon={<Bookmark className="w-12 h-12" />}
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
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-8 min-w-0">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-5 print:hidden">
          <div>
            <label htmlFor="sl-rank" className="block text-small font-semibold text-ink mb-1.5">Your rank</label>
            <input
              id="sl-rank"
              inputMode="numeric"
              placeholder="e.g. 12,500"
              value={rankText}
              onChange={(e) => setRankText(e.target.value.replace(/[^\d,]/g, ""))}
              className="w-40 px-3 py-2.5 bg-paper-bright border border-border-strong rounded-[var(--radius-sm)] tabular-nums focus:outline-none focus:border-ink"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline bg-paper-bright text-small font-semibold hover:border-border-strong">
              <Printer className="w-4 h-4" aria-hidden /> Print or save PDF
            </button>
            <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-hairline bg-paper-bright text-small font-semibold hover:border-border-strong">
              <Copy className="w-4 h-4" aria-hidden /> {copied ? "Copied" : "Copy list"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Remove every college from your shortlist?")) clear();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-small font-semibold text-text-muted hover:text-ambitious"
            >
              <Trash2 className="w-4 h-4" aria-hidden /> Clear
            </button>
          </div>
        </div>

        <p className="hidden print:block text-small mb-4">Rank: {rank ? formatRank(rank) : "not entered"} · Printed from gined.in</p>

        <ol className="space-y-2">
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
                  if (dragging !== null && dragging !== i) move(dragging, i);
                  setDragging(null);
                }}
                onDragEnd={() => setDragging(null)}
                className={`flex items-center gap-3 rounded-[var(--radius-md)] border bg-paper-bright p-3 sm:p-4 break-inside-avoid ${dragging === i ? "border-gold opacity-60" : "border-hairline"}`}
              >
                <GripVertical className="w-4 h-4 text-text-muted shrink-0 cursor-grab print:hidden" aria-hidden />
                <span className="w-7 text-right text-h4 text-ink tabular-nums shrink-0">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <Link href={`/medical/college/${entry.id}`} className="text-small sm:text-body font-semibold text-ink hover:text-gold-deep">{entry.name}</Link>
                  <p className="text-micro font-normal tracking-normal text-text-muted mt-0.5">
                    {c ? `${c.type} · ${c.city}, ${c.state}` : ""}
                    {c?.feeMin ? ` · fee from ${formatCurrencyShort(c.feeMin)}` : ""}
                    {entry.closing ? ` · closed at ${formatRank(entry.closing)}${entry.basis ? ` (${entry.basis})` : ""}` : ""}
                  </p>
                </div>
                {level && <span className="shrink-0"><ConfidenceBadge level={level} /></span>}
                <div className="flex items-center gap-0.5 shrink-0 print:hidden">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${entry.name} up`} className="p-1.5 rounded-full text-text-muted hover:text-ink hover:bg-ink/[0.05] disabled:opacity-30">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === entries.length - 1} aria-label={`Move ${entry.name} down`} className="p-1.5 rounded-full text-text-muted hover:text-ink hover:bg-ink/[0.05] disabled:opacity-30">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => remove(entry.id)} aria-label={`Remove ${entry.name}`} className="p-1.5 rounded-full text-text-muted hover:text-ambitious hover:bg-ambitious/5">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-micro font-normal tracking-normal text-text-muted print:hidden">Drag to reorder, or use the arrows. Your list stays in this browser only.</p>
      </div>

      <aside className="lg:col-span-4 print:hidden">
        <div className="lg:sticky lg:top-24 space-y-4">
          <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6">
            <h2 className="text-h4 text-ink">Your mix</h2>
            {rank ? (
              <>
                <dl className="grid grid-cols-3 gap-3 mt-4">
                  {(["safe", "moderate", "ambitious"] as const).map((level) => (
                    <div key={level} className="flex flex-col-reverse justify-end">
                      <dt className="text-small text-text-muted capitalize">{level}</dt>
                      <dd className={`text-h1 tabular-nums ${TONES[level]}`}>{counts[level]}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-small text-text-muted mt-4">
                  {counts.longshot > 0 && `${counts.longshot} are long shots. `}
                  {entries.length - labelled > 0 && `${entries.length - labelled} have no closing rank to compare. `}
                  A list that can still upgrade usually puts the colleges you want most first, and keeps enough Safe options lower down.
                </p>
              </>
            ) : (
              <p className="text-small text-text-muted mt-2">Enter your rank to see how many of these are Safe, Moderate or Ambitious.</p>
            )}
          </div>

          <div className={`rounded-[var(--radius-lg)] p-6 ${needsReview ? "bg-ink text-text-on-dark" : "border border-hairline bg-paper-bright"}`}>
            <h2 className={`text-h1 ${needsReview ? "" : "text-ink"}`}>Review my choice list.</h2>
            <p className={`text-small mt-2 ${needsReview ? "text-text-on-dark/70" : "text-text-muted"}`}>
              {needsReview
                ? "Long lists and lists heavy on Ambitious colleges are where order matters most. A counsellor can check yours before choice filling closes."
                : "Send this list to a counsellor and plan the order together."}
            </p>
            <Link
              href={bookingHref({ source: "shortlist", rank })}
              className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 px-5 py-3 rounded-full font-semibold text-small ${needsReview ? "bg-gold text-ink hover:bg-gold/90" : "bg-ink text-text-on-dark hover:bg-ink-soft"}`}
            >
              Send my list to a counsellor <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
