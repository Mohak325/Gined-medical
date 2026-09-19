"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CalculatorQuerySchema } from "@/lib/medical/schemas";
import { getColleges } from "@/lib/medical/api";
import { type College, type CutoffEntry, MOCK_CUTOFFS } from "@/lib/medical/mockData";
import { computeConfidence, type ConfidenceLevel } from "@/lib/medical/confidence";

import ResultsSummaryBar from "@/components/medical/results/ResultsSummaryBar";
import ResultsList from "@/components/medical/results/ResultsList";
import EmptyState from "@/components/medical/shared/EmptyState";
import { SearchX } from "lucide-react";

export default function ResultsClient() {
  const searchParams = useSearchParams();
  
  // State
  const [colleges, setColleges] = useState<College[]>([]);
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
    getColleges({ 
      track: query.track, 
      state: query.state,
      type: query.type
    }).then((data) => {
      if (mounted) {
        setColleges(data);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [query.rank, query.track, query.state, query.type]);

  // Compute Results
  const results = useMemo(() => {
    if (!query.rank) return [];

    const computed = colleges.map(college => {
      // Find relevant cutoffs for this college + query constraints
      // Taking Round 1 of the most recent year in the mock data (2025)
      const cutoff = MOCK_CUTOFFS.find(c => 
        c.collegeId === college.id &&
        c.track === query.track &&
        c.quota === query.quota &&
        c.category === query.category &&
        c.round === 1 &&
        c.year === 2025
      );

      if (!cutoff) return null;

      const confidence = computeConfidence(query.rank!, cutoff.closingRank);
      return { college, cutoff, confidence };
    }).filter(Boolean) as { college: College; cutoff: CutoffEntry; confidence: ConfidenceLevel }[];

    // Filter Longshots
    let filtered = computed;
    if (!showLongshots) {
      filtered = computed.filter(r => r.confidence !== "longshot");
    }

    // Sort
    filtered.sort((a, b) => {
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
      // fees_asc requires course lookup (omitted for brevity, default to rank)
      return a.cutoff.closingRank - b.cutoff.closingRank;
    });

    return filtered;

  }, [colleges, query, showLongshots, sortBy]);

  // Breakdown
  const breakdown = useMemo(() => {
    const counts: Record<ConfidenceLevel, number> = { safe: 0, moderate: 0, ambitious: 0, longshot: 0 };
    results.forEach(r => { counts[r.confidence]++; });
    return counts;
  }, [results]);

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

  if (results.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="w-12 h-12" />}
        title="No matches found"
        description="We couldn't find any colleges matching your criteria. Try adjusting your quota, category, or checking the 'Show Longshots' option."
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

      {/* AI Insight Card */}
      <div className="bg-gradient-to-br from-gold/10 to-transparent border border-gold/20 rounded-[var(--radius-lg)] p-6 mb-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0 border border-gold/30">
            <span className="text-gold-deep font-bold text-small">AI</span>
          </div>
          <div>
            <h3 className="text-body font-bold text-text-main mb-1">Counselling Insight</h3>
            <p className="text-small text-text-muted leading-relaxed">
              Based on historical seat allocation data, your rank of <strong className="text-text-main">{query.rank.toLocaleString("en-IN")}</strong> falls securely within the closing ranks of <strong>{breakdown.safe}</strong> colleges. 
              {breakdown.moderate > 0 && ` You have a competitive edge in ${breakdown.moderate} moderate options.`}
              {breakdown.ambitious > 0 && ` We recommend keeping a few of the ${breakdown.ambitious} ambitious options in your priority list as cutoffs can fluctuate during stray vacancy rounds.`}
            </p>
          </div>
        </div>
      </div>

      <ResultsList results={results} userRank={query.rank} />
    </div>
  );
}
