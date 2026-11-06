"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import meta from "@/data/meta.json";
import { PG_ENABLED } from "@/lib/medical/TrackProvider";
import { CalculatorQuerySchema } from "@/lib/medical/schemas";
import { getColleges, getCutoffs } from "@/lib/medical/api";
import { INDIA_STATES, type College, type CutoffEntry } from "@/lib/medical/mockData";
import { computeConfidence, type ConfidenceLevel } from "@/lib/medical/confidence";
import { allRoundsIndex, allRoundsYear, seatGroupKey, type AllRoundsClosing } from "@/lib/medical/rounds";

import ResultsSummaryBar from "@/components/medical/results/ResultsSummaryBar";
import ResultsList from "@/components/medical/results/ResultsList";
import EmptyState from "@/components/medical/shared/EmptyState";
import { SearchX } from "lucide-react";

export default function ResultsClient() {
  const searchParams = useSearchParams();
  
  // State
  const [colleges, setColleges] = useState<College[]>([]);
  const [cutoffs, setCutoffs] = useState<CutoffEntry[]>([]);
  // Every round of the latest year that has later rounds, for the "all rounds" closing rank.
  const [allRounds, setAllRounds] = useState<Map<string, AllRoundsClosing>>(new Map());
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("confidence_desc");
  const [showLongshots, setShowLongshots] = useState(false);

  // Parse Query
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = CalculatorQuerySchema.safeParse(rawParams);
  const query = parsed.success ? parsed.data : CalculatorQuerySchema.parse({});

  // State counselling uses each state's own seat codes, and we only hold some states.
  const isState = query.quota === "state";
  const stateHasData = isState && !!query.state && meta.stateCutoffs.includes(query.state);
  const stateOptions = meta.stateOptions as Record<string, { code: string; label: string }[]>;
  const defaultStateCode = query.state ? stateOptions[query.state]?.[0]?.code ?? "GM" : "GM";
  const stateCategory = stateHasData ? (query.stateCategory ?? defaultStateCode) : undefined;
  const stateName = query.state ? INDIA_STATES.find((s) => s.code === query.state)?.name : undefined;
  const usesStateRank = isState && !!query.state && query.state in meta.stateRanks;
  const isPg = query.track === "pg";
  // PG: one specialty, or every specialty when none is chosen.
  const specialty = isPg && query.course && query.course !== "all" ? query.course : undefined;

  useEffect(() => {
    let mounted = true;
    if (!query.rank) {
      setLoading(false);
      return;
    }

    if (isState && !stateHasData) {
      setCutoffs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      getColleges({ 
        track: query.track, 
        state: query.state,
        type: query.type
      }),
      getCutoffs({
        track: query.track,
        quota: query.quota,
        ...(isState ? { state: query.state, stateCategory } : { category: query.category }),
        ...(isPg ? (specialty ? { specialty } : {}) : { course: "MBBS" }),
        round: 1, // Only consider round 1 for initial prediction
        year: meta.cutoffYear
      }),
      getCutoffs({
        track: query.track,
        quota: query.quota,
        ...(isState ? { state: query.state, stateCategory } : { category: query.category }),
        ...(isPg ? (specialty ? { specialty } : {}) : { course: "MBBS" }),
        year: allRoundsYear(query.track)
      })
    ]).then(([collegesData, cutoffsData, allRoundsData]) => {
      if (mounted) {
        setColleges(collegesData);
        setCutoffs(cutoffsData);
        setAllRounds(allRoundsIndex(allRoundsData));
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [query.rank, query.track, query.state, query.type, query.quota, query.category, isState, stateHasData, stateCategory, isPg, specialty]);

  // Compute Results
  const allResults = useMemo(() => {
    if (!query.rank) return [];

    // One result per college and course: the first cutoff found for each, as before.
    const byId = new Map(colleges.map((college) => [college.id, college]));
    const seen = new Set<string>();
    const computed: { college: College; cutoff: CutoffEntry; confidence: ConfidenceLevel; allRounds?: AllRoundsClosing }[] = [];
    for (const cutoff of cutoffs) {
      const college = byId.get(cutoff.collegeId);
      const key = `${cutoff.collegeId}|${cutoff.course}`;
      if (!college || seen.has(key)) continue;
      seen.add(key);
      computed.push({
        college, cutoff, confidence: computeConfidence(query.rank!, cutoff.closingRank),
        allRounds: allRounds.get(seatGroupKey({ ...cutoff, year: allRoundsYear(cutoff.track) })),
      });
    }

    // Sort
    computed.sort((a, b) => {
      if (sortBy === "confidence_desc") {
        const order = { safe: 0, moderate: 1, ambitious: 2, longshot: 3 };
        const confDiff = order[a.confidence] - order[b.confidence];
        if (confDiff !== 0) return confDiff;
        // Tie-breaker: sort by rank ascending within same confidence bucket
        return a.cutoff.closingRank - b.cutoff.closingRank;
      }
      if (sortBy === "cutoff_asc") {
        return a.cutoff.closingRank - b.cutoff.closingRank;
      }
      if (sortBy === "cutoff_desc") {
        return b.cutoff.closingRank - a.cutoff.closingRank;
      }
      return a.cutoff.closingRank - b.cutoff.closingRank;
    });

    return computed;

  }, [colleges, cutoffs, allRounds, query.rank, sortBy]);

  const results = useMemo(
    () => (showLongshots ? allResults : allResults.filter(r => r.confidence !== "longshot")),
    [allResults, showLongshots]
  );

  // Breakdown
  const breakdown = useMemo(() => {
    const counts: Record<ConfidenceLevel, number> = { safe: 0, moderate: 0, ambitious: 0, longshot: 0 };
    allResults.forEach(r => { counts[r.confidence]++; });
    return counts;
  }, [allResults]);

  if (isPg && (!PG_ENABLED || isState)) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title={PG_ENABLED ? "PG state quota isn't covered yet" : "PG predictions are coming soon"}
        description={PG_ENABLED
          ? "Our PG closing ranks come from MCC's All India counselling. Try the All India, deemed or central university quota, or check your state counselling portal."
          : "We don't have PG cutoff data yet. You can still browse the PG courses each college offers in the directory."}
        actions={[{ label: "Browse All Colleges", href: "/medical/colleges" }]}
      />
    );
  }

  if (!query.rank) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title="No rank entered"
        description="Please enter your NEET rank above to see your chances."
        actions={[{ label: "Back to Home", href: "/medical" }]}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (allResults.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title={isState && !stateHasData ? "We don't have this state's cutoffs yet" : "No matches found"}
        description={isState && !stateHasData
          ? `We haven't collected this state's counselling results yet, so this doesn't mean no seats exist for you. So far we hold ${meta.stateCutoffs.map((code) => INDIA_STATES.find((s) => s.code === code)?.name ?? code).join(", ")}. Try the All India Quota, or check your state counselling portal.`
          : isState
            ? `No seats were allotted under ${stateName} code ${stateCategory} in ${meta.cutoffYear} Round 1. Try a different category.`
            : "We couldn't find any colleges matching your criteria. Try a different quota or category."}
        actions={[{ label: "Browse All Colleges", href: "/medical/colleges" }]}
      />
    );
  }

  return (
    <div>
      <ResultsSummaryBar 
        total={results.length}
        unitLabel={isPg && !specialty ? "Options Found" : "Colleges Found"}
        breakdown={breakdown}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showLongshots={showLongshots}
        onToggleLongshots={() => setShowLongshots(!showLongshots)}
      />

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-[var(--radius-lg)] p-6 mb-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div>
            <h3 className="text-body font-bold text-text-main mb-1">Your Summary</h3>
            <p className="text-small text-text-muted leading-relaxed">
              Based on {meta.cutoffYear} Round 1 closing ranks, your {usesStateRank ? `${stateName} state rank` : "rank"} of <strong className="text-text-main">{query.rank.toLocaleString("en-IN")}</strong> is labelled Safe for <strong>{breakdown.safe}</strong> {isPg ? "college and specialty options" : "colleges"}. These labels are indicative, not guarantees.
              {` Later rounds fill seats that free up, so they reach further down the list. Where we have them, each card also shows how far the ${isPg ? allRoundsYear("pg") : allRoundsYear("ug")} counselling reached across all its rounds.`}
              {breakdown.moderate > 0 && ` Another ${breakdown.moderate} are Moderate.`}
              {breakdown.ambitious > 0 && ` Consider keeping a few of the ${breakdown.ambitious} Ambitious options in your list, as cutoffs change between years and rounds.`}
              {stateCategory && ` These are ${stateName} counselling results for seat code ${stateCategory} only. You may qualify for other codes too, so check your eligibility with the state's counselling authority.`}
              {usesStateRank && ` These closing ranks are ${stateName}'s own, so compare them with your state rank and not your All India rank.`}
              {isPg && ` These are MCC's All India NEET PG results${specialty ? ` for ${specialty}` : ", across every specialty"}. DNB seats in hospitals aren't included.`}
              {query.state === "UP" && ` Uttar Pradesh only publishes who holds each seat now, so a student who got a seat and later moved on isn't counted. Its closing ranks can be slightly lower than the ones announced.`}
              {query.state === "TN" && ` Tamil Nadu's lists show each student's community and not the seat they took, so each figure is the last-ranked student of that community who got a seat.`}
            </p>
          </div>
        </div>
      </div>

      <ResultsList results={results} userRank={query.rank} />
    </div>
  );
}
