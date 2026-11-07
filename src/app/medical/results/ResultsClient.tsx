"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, ArrowUpRight, MessageCircle, RotateCcw } from "lucide-react";
import meta from "@/data/meta.json";
import { PG_ENABLED } from "@/lib/medical/TrackProvider";
import { CalculatorQuerySchema } from "@/lib/medical/schemas";
import { getFinderRows, getQuotaCounts } from "@/lib/medical/api";
import { INDIA_STATES } from "@/lib/medical/mockData";
import { countLabels, labelAll, type FinderQuery, type FinderRow, type FinderSort, type LabelCounts } from "@/lib/medical/finder";
import { allRoundsYear } from "@/lib/medical/rounds";
import { bookingHref, whatsappHref } from "@/lib/medical/booking";
import { formatRank } from "@/lib/medical/format";
import CollegeResultCard from "@/components/medical/results/CollegeResultCard";
import EmptyState from "@/components/medical/shared/EmptyState";
import ShowMoreButton from "@/components/medical/shared/ShowMoreButton";

const PAGE_SIZE = 25;
const QUOTA_NAMES: Record<FinderQuery["quota"], string> = { aiq: "All India", state: "State quota", deemed: "Deemed", central: "Central" };
const TILE_TONES = {
  safe: "text-safe",
  moderate: "text-moderate",
  ambitious: "text-ambitious",
} as const;

/** Fetches by a key, and reports the data only while the key still matches (no setState inside effects). */
function useKeyed<T>(key: string | null, load: () => Promise<T>) {
  const [state, setState] = useState<{ key: string; data: T } | null>(null);
  useEffect(() => {
    if (!key) return;
    let live = true;
    load().then((data) => {
      if (live) setState({ key, data });
    });
    return () => {
      live = false;
    };
    // `load` is rebuilt each render; the key captures everything it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return state && state.key === key ? state.data : undefined;
}

export default function ResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const parsed = CalculatorQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  const query = parsed.success ? parsed.data : CalculatorQuerySchema.parse({});
  const rank = query.rank;

  // State counselling uses each state's own seat codes, and we only hold some states.
  const isState = query.quota === "state";
  const stateHasData = isState && !!query.state && meta.stateCutoffs.includes(query.state);
  const stateOptions = meta.stateOptions as Record<string, { code: string; label: string }[]>;
  const defaultStateCode = query.state ? stateOptions[query.state]?.[0]?.code ?? "GM" : "GM";
  const stateCategory = stateHasData ? (query.stateCategory ?? defaultStateCode) : undefined;
  const stateName = query.state ? INDIA_STATES.find((s) => s.code === query.state)?.name : undefined;
  const usesStateRank = isState && !!query.state && query.state in meta.stateRanks;
  const isPg = query.track === "pg";
  const specialty = isPg && query.course && query.course !== "all" ? query.course : undefined;
  const blocked = (isPg && (!PG_ENABLED || isState)) || (isState && !stateHasData);

  const finderQuery: FinderQuery = {
    track: query.track,
    quota: query.quota,
    ...(isState ? { state: query.state, stateCategory } : { category: query.category }),
    ...(specialty ? { specialty } : {}),
    type: query.type,
  };
  const rowsKey = rank && !blocked ? JSON.stringify(finderQuery) : null;
  const rows = useKeyed<FinderRow[]>(rowsKey, () => getFinderRows(finderQuery));

  const countsQuery = { track: query.track, category: query.category, state: query.state, stateCategory, specialty, type: query.type };
  const countsKey = rank && !(isPg && !PG_ENABLED) ? JSON.stringify([countsQuery, rank]) : null;
  const counts = useKeyed(countsKey, () => getQuotaCounts(countsQuery, rank!));

  // "What if" rank: starts at the entered rank and follows it when a new rank is submitted.
  const [whatIf, setWhatIf] = useState<{ base?: number; value?: number }>({});
  const effectiveRank = whatIf.base === rank && whatIf.value ? whatIf.value : rank;
  const isWhatIf = effectiveRank !== rank;

  const [sortBy, setSortBy] = useState<FinderSort>("confidence_desc");
  const [showLongshots, setShowLongshots] = useState(false);
  // How many cards show; starts again at one page whenever the search changes.
  const [paging, setPaging] = useState<{ key: string | null; n: number }>({ key: null, n: PAGE_SIZE });
  const visible = paging.key === rowsKey ? paging.n : PAGE_SIZE;

  const labelled = useMemo(() => (rows && effectiveRank ? labelAll(rows, effectiveRank, sortBy) : []), [rows, effectiveRank, sortBy]);
  const breakdown: LabelCounts = useMemo(() => countLabels(labelled), [labelled]);
  const shown = showLongshots ? labelled : labelled.filter((r) => r.confidence !== "longshot");
  const laterRoundsCount = labelled.filter((r) => r.laterRounds).length;

  const switchQuota = (quota: FinderQuery["quota"]) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("quota", quota);
    if (quota !== "state") next.delete("stateCategory");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  };

  if (isPg && (!PG_ENABLED || isState)) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title={PG_ENABLED ? "PG state quota isn't covered yet" : "PG predictions are coming soon"}
        description={
          PG_ENABLED
            ? "Our PG closing ranks come from MCC's All India counselling. Try the All India, deemed or central university quota, or check your state counselling portal."
            : "We don't have PG cutoff data yet. You can still browse the PG courses each college offers in the directory."
        }
        actions={[{ label: "Browse All Colleges", href: "/medical/colleges" }]}
      />
    );
  }

  if (!rank) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title="Enter your rank to start"
        description="Type your NEET rank in the finder above to see which colleges it can reach."
        actions={[{ label: "Back to Home", href: "/medical" }]}
      />
    );
  }

  const quotaTabs = (["aiq", "state", "deemed", "central"] as const).filter((q) => !(isPg && q === "state"));
  const booking = bookingHref({
    source: "finder-results",
    track: query.track,
    rank,
    quota: query.quota,
    category: isState ? undefined : query.category,
    state: query.state,
    stateCategory,
  });

  const notes = [
    stateCategory && `These are ${stateName} counselling results for seat code ${stateCategory} only. You may qualify for other codes too, so check your eligibility with the state's counselling authority.`,
    usesStateRank && `These closing ranks are ${stateName}'s own, so compare them with your state rank and not your All India rank.`,
    isPg && `These are MCC's All India NEET PG results${specialty ? ` for ${specialty}` : ", across every specialty"}. DNB seats in hospitals aren't included.`,
    query.state === "UP" && isState && "Uttar Pradesh only publishes who holds each seat now, so a student who got a seat and later moved on isn't counted. Its closing ranks can be slightly lower than the ones announced.",
    query.state === "TN" && isState && "Tamil Nadu's lists show each student's community and not the seat they took, so each figure is the last-ranked student of that community who got a seat.",
  ].filter(Boolean) as string[];

  return (
    <div>
      {/* Every quota at once */}
      <nav aria-label="Quota" className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        {quotaTabs.map((q) => {
          const c = counts?.[q];
          const reachable = c ? c.safe + c.moderate + c.ambitious : undefined;
          const active = q === query.quota;
          const needsState = q === "state" && !query.state;
          return (
            <button
              key={q}
              type="button"
              onClick={() => switchQuota(q)}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-small font-semibold transition-colors ${
                active ? "bg-ink border-ink text-text-on-dark" : "bg-paper-bright border-hairline text-ink hover:border-border-strong"
              }`}
            >
              {QUOTA_NAMES[q]}
              <span className={`ml-2 tabular-nums font-normal ${active ? "text-text-on-dark/70" : "text-text-muted"}`}>
                {needsState ? "pick a state" : reachable !== undefined ? `${reachable} option${reachable === 1 ? "" : "s"}` : counts ? "no data" : "…"}
              </span>
            </button>
          );
        })}
      </nav>

      {isState && !stateHasData ? (
        <EmptyState
          icon={<SearchX className="w-12 h-12" />}
          title={query.state ? "We don't have this state's cutoffs yet" : "Pick your counselling state"}
          description={
            query.state
              ? `We haven't collected this state's counselling results yet, so this doesn't mean no seats exist for you. So far we hold ${meta.stateCutoffs
                  .map((code) => INDIA_STATES.find((s) => s.code === code)?.name ?? code)
                  .join(", ")}. Try the All India Quota, or check your state counselling portal.`
              : "Choose State Quota and your state in the finder above to see state quota colleges."
          }
          actions={[{ label: "Ask a counsellor", href: booking }]}
        />
      ) : !rows ? (
        <div className="space-y-4" aria-busy="true" aria-label="Loading colleges">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-[var(--radius-lg)] border border-hairline bg-paper-bright animate-pulse" />
          ))}
        </div>
      ) : labelled.length === 0 ? (
        <EmptyState
          icon={<SearchX className="w-12 h-12" />}
          title="No matches found"
          description={
            isState
              ? `No seats were allotted under ${stateName} code ${stateCategory} in ${meta.cutoffYear} Round 1. Try a different category.`
              : "We couldn't find any colleges for this quota and category. Try a different quota or category."
          }
          actions={[{ label: "Ask a counsellor", href: booking }]}
        />
      ) : (
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 min-w-0">
            {/* Label tiles */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(["safe", "moderate", "ambitious"] as const).map((level) => (
                <div key={level} className="rounded-[var(--radius-md)] border border-hairline bg-paper-bright px-4 py-3">
                  <p className={`text-h1 tabular-nums ${TILE_TONES[level]}`}>{breakdown[level]}</p>
                  <p className="text-small text-text-muted capitalize">{level}</p>
                </div>
              ))}
            </div>

            {/* What-if slider */}
            <div className="rounded-[var(--radius-md)] border border-hairline bg-paper-bright p-4 mb-6">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <label htmlFor="what-if" className="text-small font-semibold text-ink">
                  What if my {usesStateRank ? "state rank" : "rank"} were <span className="tabular-nums text-gold-deep">{formatRank(effectiveRank!)}</span>?
                </label>
                {isWhatIf && (
                  <button
                    type="button"
                    onClick={() => setWhatIf({})}
                    className="inline-flex items-center gap-1 text-small text-text-muted hover:text-ink"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Back to {formatRank(rank)}
                  </button>
                )}
              </div>
              <input
                id="what-if"
                type="range"
                min={Math.max(1, Math.round(rank * 0.5))}
                max={Math.round(rank * 2)}
                step={Math.max(1, Math.round(rank / 200))}
                value={effectiveRank}
                onChange={(e) => setWhatIf({ base: rank, value: Number(e.target.value) })}
                className="w-full accent-[var(--ink)]"
              />
              <div className="flex justify-between text-micro font-normal tracking-normal text-text-muted mt-1 tabular-nums">
                <span>{formatRank(Math.max(1, Math.round(rank * 0.5)))}</span>
                <span>{formatRank(Math.round(rank * 2))}</span>
              </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <label className="inline-flex items-center gap-2 text-small text-text-muted cursor-pointer">
                <input type="checkbox" checked={showLongshots} onChange={(e) => setShowLongshots(e.target.checked)} className="accent-[var(--ink)]" />
                Show long shots ({breakdown.longshot})
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as FinderSort)}
                aria-label="Sort"
                className="px-3 py-2 bg-paper-bright border border-hairline rounded-full text-small"
              >
                <option value="confidence_desc">Best match first</option>
                <option value="cutoff_asc">Hardest to get first</option>
                <option value="cutoff_desc">Easiest to get first</option>
              </select>
            </div>

            <div className="space-y-3">
              {shown.slice(0, visible).map((row) => (
                <CollegeResultCard key={`${row.college.id}|${row.cutoff.course}`} row={row} rank={effectiveRank!} />
              ))}
            </div>
            <ShowMoreButton shown={Math.min(visible, shown.length)} total={shown.length} noun={isPg && !specialty ? "options" : "colleges"} onClick={() => setPaging({ key: rowsKey, n: visible + PAGE_SIZE })} />
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="rounded-[var(--radius-lg)] bg-ink text-text-on-dark p-6">
                <p className="text-eyebrow text-gold">Free tool, expert eyes</p>
                <h2 className="text-h1 mt-3">Get this list checked by a counsellor.</h2>
                <p className="text-small text-text-on-dark/70 mt-3">
                  We&apos;ll turn these {breakdown.safe + breakdown.moderate + breakdown.ambitious} options into a choice-filling order that can upgrade in later rounds.
                </p>
                <div className="mt-6 flex flex-col gap-2">
                  <Link href={booking} className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold text-ink font-semibold text-small rounded-full hover:bg-gold/90">
                    Book a session <ArrowUpRight className="w-4 h-4" aria-hidden />
                  </Link>
                  <a
                    href={whatsappHref(`Hi Gined, my NEET ${query.track.toUpperCase()} rank is ${rank} (${QUOTA_NAMES[query.quota]}). Can you check my college list?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-white/20 font-semibold text-small rounded-full hover:bg-white/5"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden /> Ask on WhatsApp
                  </a>
                </div>
              </div>

              <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 text-small text-text-muted space-y-3">
                <h3 className="text-h4 text-ink">How to read this</h3>
                <p>
                  Labels compare your rank with {meta.cutoffYear} Round 1 closing ranks. They are a guide, not a guarantee.
                  {laterRoundsCount > 0 &&
                    ` ${laterRoundsCount} options closed before your rank in Round 1 but reached it in Round 2 or 3 of ${allRoundsYear(query.track)}; those depend on others leaving, so stay in every round.`}
                </p>
                {notes.map((note) => (
                  <p key={note}>{note}</p>
                ))}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
