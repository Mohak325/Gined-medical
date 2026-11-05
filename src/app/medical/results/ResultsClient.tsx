"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import meta from "@/data/meta.json";
import { PG_ENABLED } from "@/lib/medical/TrackProvider";
import { CalculatorQuerySchema } from "@/lib/medical/schemas";
import { getColleges, getCutoffs } from "@/lib/medical/api";
import { type College, type CutoffEntry } from "@/lib/medical/mockData";
import { computeConfidence, type ConfidenceLevel } from "@/lib/medical/confidence";

import ResultsSummaryBar from "@/components/medical/results/ResultsSummaryBar";
import ResultsList from "@/components/medical/results/ResultsList";
import EmptyState from "@/components/medical/shared/EmptyState";
import { SearchX } from "lucide-react";

export default function ResultsClient() {
  const searchParams = useSearchParams();
  
  // State
  const [colleges, setColleges] = useState<College[]>([]);
  const [cutoffs, setCutoffs] = useState<CutoffEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("confidence_desc");
  const [showLongshots, setShowLongshots] = useState(false);

  // Parse Query
  const rawParams = Object.fromEntries(searchParams.entries());
  const parsed = CalculatorQuerySchema.safeParse(rawParams);
  const query = parsed.success ? parsed.data : CalculatorQuerySchema.parse({});

  useEffect(() => {
    let mounted = true;
    if (!query.rank) {
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
        category: query.category,
        course: "MBBS",
        round: 1, // Only consider round 1 for initial prediction
        year: meta.cutoffYear
      })
    ]).then(([collegesData, cutoffsData]) => {
      if (mounted) {
        setColleges(collegesData);
        setCutoffs(cutoffsData);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [query.rank, query.track, query.state, query.type, query.quota, query.category]);

  // Compute Results
  const allResults = useMemo(() => {
    if (!query.rank) return [];

    const computed = colleges.map(college => {
      const cutoff = cutoffs.find(c => c.collegeId === college.id);

      if (!cutoff) return null;

      const confidence = computeConfidence(query.rank!, cutoff.closingRank);
      return { college, cutoff, confidence };
    }).filter(Boolean) as { college: College; cutoff: CutoffEntry; confidence: ConfidenceLevel }[];

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

  }, [colleges, cutoffs, query.rank, sortBy]);

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

  if (query.track === "pg" && !PG_ENABLED) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title="PG predictions are coming soon"
        description="We don't have PG cutoff data yet. You can still browse the PG courses each college offers in the directory."
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
        title={query.quota === "state" ? "State-quota cutoffs aren't available yet" : "No matches found"}
        description={query.quota === "state"
          ? "We haven't collected state counselling results yet, so this doesn't mean no seats exist for you. Try the All India Quota, or check your state counselling portal."
          : "We couldn't find any colleges matching your criteria. Try a different quota or category."}
        actions={[{ label: "Browse All Colleges", href: "/medical/colleges" }]}
      />
    );
  }

  return (
    <div>
      <ResultsSummaryBar 
        total={results.length}
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
              Based on {meta.cutoffYear} Round 1 closing ranks, your rank of <strong className="text-text-main">{query.rank.toLocaleString("en-IN")}</strong> is labelled Safe for <strong>{breakdown.safe}</strong> colleges. These labels are indicative, not guarantees.
              {breakdown.moderate > 0 && ` Another ${breakdown.moderate} are Moderate.`}
              {breakdown.ambitious > 0 && ` Consider keeping a few of the ${breakdown.ambitious} Ambitious options in your list, as cutoffs change between years and rounds.`}
            </p>
          </div>
        </div>
      </div>

      <ResultsList results={results} userRank={query.rank} />
    </div>
  );
}
