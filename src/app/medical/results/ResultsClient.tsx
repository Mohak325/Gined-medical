"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useKeyed } from "@/lib/medical/useKeyed";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchX, MessageCircle, RotateCcw, ChevronDown } from "lucide-react";
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
import Cta from "@/components/ui/Cta";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import TweenNumber from "@/components/motion/TweenNumber";
import { LABEL_COPY } from "@/content/labels";

const PAGE_SIZE = 25;
const QUOTA_NAMES: Record<FinderQuery["quota"], string> = { aiq: "All India", state: "State quota", deemed: "Deemed", central: "Central" };
const CATEGORY_NAMES: Record<string, string> = { general: "General", obc: "OBC-NCL", sc: "SC", st: "ST", ews: "EWS" };
// The spread bar, in the order the labels run.
const SPREAD = ["safe", "moderate", "ambitious", "longshot"] as const;
const SPREAD_TONE = { safe: "bg-safe", moderate: "bg-moderate", ambitious: "bg-ambitious", longshot: "bg-white/25" } as const;

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
        icon={<SearchX />}
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
        icon={<SearchX />}
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

  const reachable = breakdown.safe + breakdown.moderate + breakdown.ambitious;
  const total = reachable + breakdown.longshot;
  const minRank = Math.max(1, Math.round(rank * 0.5));
  const maxRank = Math.round(rank * 2);
  const fill = ((effectiveRank! - minRank) / (maxRank - minRank)) * 100;
  const searchedFor = isState
    ? `${stateName ?? "State"} quota${stateCategory ? ` · ${stateCategory}` : ""}`
    : `${QUOTA_NAMES[query.quota]} · ${CATEGORY_NAMES[query.category] ?? query.category}`;

  return (
    <div>
      {/* What was searched, and every quota at once */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-10">
        <div data-reveal="up">
          <h2 className="text-eyebrow text-gold-deep mb-3">Results for</h2>
          <p className="font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3.25rem] leading-none text-ink">
            {usesStateRank ? "State rank" : "Rank"} <span className="tabular-nums">{formatRank(rank)}</span>
          </p>
          <p className="text-small text-text-muted mt-3">
            NEET {query.track.toUpperCase()} · {searchedFor}
            {specialty ? ` · ${specialty}` : ""}
          </p>
        </div>

        <nav aria-label="Quota" className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto" data-reveal="up" style={{ "--delay": "120ms" } as CSSProperties}>
          <div className="inline-flex gap-1 p-1.5 rounded-full surface-premium">
            {quotaTabs.map((q) => {
              const c = counts?.[q];
              const options = c ? c.safe + c.moderate + c.ambitious : undefined;
              const active = q === query.quota;
              const needsState = q === "state" && !query.state;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => switchQuota(q)}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-small font-semibold transition-[background-color,color,box-shadow] duration-300 ${
                    active ? "bg-ink text-text-on-dark shadow-[0_8px_20px_-8px_rgba(8,26,36,0.7)]" : "text-ink hover:bg-ink/[0.05]"
                  }`}
                >
                  {QUOTA_NAMES[q]}
                  <span className={`ml-2 tabular-nums font-normal ${active ? "text-gold" : "text-text-muted"}`}>
                    {needsState ? "pick a state" : options !== undefined ? `${options} option${options === 1 ? "" : "s"}` : counts ? "no data" : "…"}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {isState && !stateHasData ? (
        <EmptyState
          icon={<SearchX />}
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
        <div className="grid gap-8 lg:grid-cols-12" aria-busy="true" aria-label="Loading colleges">
          <div className="lg:col-span-8 space-y-4">
            <div className="skeleton h-72 rounded-[28px]" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-44 rounded-[24px]" />
            ))}
          </div>
          <div className="hidden lg:block lg:col-span-4 skeleton h-96 rounded-[28px]" />
        </div>
      ) : labelled.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title="No matches found"
          description={
            isState
              ? `No seats were allotted under ${stateName} code ${stateCategory} in ${meta.cutoffYear} Round 1. Try a different category.`
              : "We couldn't find any colleges for this quota and category. Try a different quota or category."
          }
          actions={[{ label: "Ask a counsellor", href: booking }]}
        />
      ) : (
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 min-w-0">
            {/* At a glance: the what-if slider drives the counts and the spread below it */}
            <section aria-labelledby="glance-title" data-reveal="up" className="relative overflow-hidden rounded-[28px] bg-ink text-text-on-dark p-6 sm:p-8 md:p-10 mb-8 grain">
              <div aria-hidden className="absolute -right-24 -top-24 w-[26rem] h-[26rem] rounded-full bg-gold/15 blur-3xl" />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:44px_44px]"
              />

              <div className="relative z-[2]">
                <div className="flex flex-wrap items-center justify-between gap-4 min-h-8">
                  <h2 id="glance-title" className="text-eyebrow text-gold">At a glance</h2>
                  {isWhatIf && (
                    <button
                      type="button"
                      onClick={() => setWhatIf({})}
                      className="inline-flex items-center gap-1.5 rounded-full surface-ink-glass px-3 py-1.5 text-small text-text-on-dark/85 hover:text-text-on-dark"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden /> Back to {formatRank(rank)}
                    </button>
                  )}
                </div>

                <label htmlFor="what-if" className="block mt-4">
                  <span className="block text-small text-text-on-dark/75">What if my {usesStateRank ? "state rank" : "rank"} were</span>
                  <span className="block font-[family-name:var(--font-instrument)] text-[3.5rem] md:text-[4.5rem] leading-none tabular-nums mt-1">
                    {formatRank(effectiveRank!)}
                    <span className="text-gold">?</span>
                  </span>
                </label>
                <input
                  id="what-if"
                  type="range"
                  min={minRank}
                  max={maxRank}
                  step={Math.max(1, Math.round(rank / 200))}
                  value={effectiveRank}
                  onChange={(e) => setWhatIf({ base: rank, value: Number(e.target.value) })}
                  className="range-premium mt-5"
                  style={{ "--fill": `${fill}%` } as CSSProperties}
                />
                <div className="flex justify-between gap-4 text-micro font-normal tracking-normal text-text-on-dark/70 mt-1 tabular-nums">
                  <span>{formatRank(minRank)}</span>
                  <span className="hidden sm:inline">Drag to try a better or worse rank</span>
                  <span>{formatRank(maxRank)}</span>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <dl className="grid grid-cols-3 gap-4">
                    {LABEL_COPY.map((label) => (
                      <div key={label.level}>
                        <dt className="flex items-center gap-2 text-small text-text-on-dark/80">
                          <span className={`w-2.5 h-2.5 rounded-full ${label.tone} shadow-[0_0_12px_currentColor]`} aria-hidden />
                          {label.name}
                        </dt>
                        <dd data-count={label.level} className="font-[family-name:var(--font-instrument)] text-[2.75rem] md:text-[3.5rem] leading-none tabular-nums mt-2">
                          <TweenNumber value={breakdown[label.level]} />
                        </dd>
                      </div>
                    ))}
                  </dl>

                  {/* How every option for this quota splits across the labels */}
                  <div className="mt-7">
                    <div className="relative h-2.5 rounded-full bg-white/10 overflow-hidden" aria-hidden>
                      {SPREAD.map((level, i) => {
                        const before = SPREAD.slice(0, i).reduce((sum, l) => sum + breakdown[l], 0);
                        return (
                          <span
                            key={level}
                            className={`bar-fill ${SPREAD_TONE[level]}`}
                            style={{ "--o": total ? before / total : 0, "--s": total ? breakdown[level] / total : 0, "--bar-delay": `${200 + i * 90}ms` } as CSSProperties}
                          />
                        );
                      })}
                    </div>
                    <p className="text-micro font-normal tracking-normal text-text-on-dark/70 mt-3">
                      {reachable.toLocaleString("en-IN")} of {total.toLocaleString("en-IN")} options are within reach. The other {breakdown.longshot.toLocaleString("en-IN")} are long shots, where this rank is more than 35% past the closing rank.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <label className="inline-flex items-center gap-3 text-small text-ink cursor-pointer select-none">
                <input type="checkbox" checked={showLongshots} onChange={(e) => setShowLongshots(e.target.checked)} className="peer sr-only" />
                <span
                  aria-hidden
                  className="relative w-10 h-6 rounded-full bg-ink/15 transition-colors duration-300 peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold after:absolute after:top-1 after:left-1 after:w-4 after:h-4 after:rounded-full after:bg-paper-bright after:shadow-sm after:transition-transform after:duration-300 peer-checked:after:translate-x-4"
                />
                Show long shots ({breakdown.longshot})
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as FinderSort)}
                  aria-label="Sort"
                  className="appearance-none pl-4 pr-10 py-2.5 rounded-full surface-premium text-small font-semibold text-ink cursor-pointer focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <option value="confidence_desc">Best match first</option>
                  <option value="cutoff_asc">Hardest to get first</option>
                  <option value="cutoff_desc">Easiest to get first</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" aria-hidden />
              </div>
            </div>

            <div className="space-y-4">
              {shown.slice(0, visible).map((row, i) => (
                <CollegeResultCard key={`${row.college.id}|${row.cutoff.course}`} row={row} rank={effectiveRank!} delay={Math.min(i % PAGE_SIZE, 4) * 70} />
              ))}
            </div>
            <ShowMoreButton shown={Math.min(visible, shown.length)} total={shown.length} noun={isPg && !specialty ? "options" : "colleges"} onClick={() => setPaging({ key: rowsKey, n: visible + PAGE_SIZE })} />
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div
                data-reveal="up"
                style={{ "--delay": "150ms" } as CSSProperties}
                className="relative overflow-hidden rounded-[28px] bg-ink-deep text-text-on-dark min-h-[26rem] flex flex-col justify-end p-6 md:p-7"
              >
                <Photo name="grandLibrary" overlay="tile" decorative sizes="(min-width: 1024px) 30vw, 100vw" />
                <div className="relative z-[2]">
                  <p className="text-eyebrow text-gold">Free tool, expert eyes</p>
                  <SplitWords text="Get this list checked by a counsellor." className="font-[family-name:var(--font-instrument)] text-[2rem] leading-[1.05] mt-3" />
                  <p className="text-small text-text-on-dark/80 mt-3">
                    We&apos;ll turn these {reachable} options into a choice-filling order that can upgrade in later rounds.
                  </p>
                  <div className="mt-6 flex flex-col gap-2.5">
                    <Cta href={booking} variant="gold" className="w-full">
                      Book a session
                    </Cta>
                    <Cta
                      href={whatsappHref(`Hi Gined, my NEET ${query.track.toUpperCase()} rank is ${rank} (${QUOTA_NAMES[query.quota]}). Can you check my college list?`)}
                      variant="glass"
                      external
                      className="w-full"
                    >
                      <span className="inline-flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" aria-hidden /> Ask on WhatsApp
                      </span>
                    </Cta>
                  </div>
                </div>
              </div>

              <div data-reveal="up" style={{ "--delay": "250ms" } as CSSProperties} className="surface-premium rounded-[28px] p-6 md:p-7 text-small text-text-muted">
                <h2 className="font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none text-ink">How to read this</h2>
                <ul className="mt-5 space-y-3">
                  {LABEL_COPY.map((label) => (
                    <li key={label.level} className="flex gap-3">
                      <span className={`mt-1.5 w-2.5 h-2.5 shrink-0 rounded-full ${label.tone}`} aria-hidden />
                      <span>
                        <span className="font-semibold text-ink">{label.name}.</span> {label.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 pt-5 border-t border-hairline space-y-3">
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
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
