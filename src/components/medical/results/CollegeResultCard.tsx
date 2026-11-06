"use client";

import Link from "next/link";
import { type College, type CutoffEntry } from "@/lib/medical/mockData";
import { type ConfidenceLevel } from "@/lib/medical/confidence";
import { type AllRoundsClosing } from "@/lib/medical/rounds";
import { formatRank } from "@/lib/medical/format";
import ConfidenceBadge from "@/components/medical/shared/ConfidenceBadge";
import ProvenanceLabel from "@/components/medical/shared/ProvenanceLabel";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import { MapPin, Building2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cardHover, duration, easing } from "@/lib/motion/tokens";

interface CollegeResultCardProps {
  college: College;
  cutoff: CutoffEntry;
  confidence: ConfidenceLevel;
  userRank: number;
  index: number;
  isVolatile?: boolean;
  /** How far the latest full counselling reached across all its rounds, where we have later rounds. */
  allRounds?: AllRoundsClosing;
  /** Round 1 closed before the student's rank, but Round 2 or 3 reached it. */
  laterRounds?: boolean;
}

export default function CollegeResultCard({ college, cutoff, confidence, userRank, index, isVolatile, allRounds, laterRounds }: CollegeResultCardProps) {
  const gap = cutoff.closingRank - userRank;
  const isPositive = gap >= 0;
  
  // Calculate percentage of rank relative to closing rank for a mini visualization bar
  // We clamp it between 10% and 100% just for visual purposes
  const ratio = Math.max(0.1, Math.min(1, userRank / (cutoff.closingRank || 1)));

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: duration.slow, 
        ease: easing.out,
        delay: Math.min(index * 0.05, 0.3) // Staggered entry, capped at 0.3s
      }}
      whileHover={cardHover.whileHover}
      className="bg-paper-bright border border-hairline rounded-[var(--radius-lg)] p-6 sm:p-8 flex flex-col sm:flex-row gap-8 shadow-card hover:border-gold/30 hover:shadow-[0_8px_32px_rgba(201,162,75,0.08)] transition-all group overflow-hidden relative"
    >
      {/* Decorative gradient flare on hover */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="flex-grow z-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <ConfidenceBadge level={confidence} />
          {laterRounds && allRounds && (
            <span
              className="text-micro text-gold-deep bg-gold/10 border border-gold/20 px-2 py-1 font-semibold rounded-[var(--radius-sm)]"
              title={`Round 1 closed before your rank, but ${allRounds.year} counselling reached it in Round 2 or 3`}
            >
              Reached in {allRounds.year !== cutoff.year ? `${allRounds.year} ` : ""}Round 2 or 3
            </span>
          )}
          {isVolatile && (
            <span className="inline-flex items-center gap-1 text-micro text-ambitious bg-ambitious/10 px-2 py-1 rounded-[var(--radius-sm)]" title="Cutoffs have fluctuated >25% recently">
              <AlertCircle className="w-3.5 h-3.5" /> Volatile
            </span>
          )}
          <span className="text-micro text-gold px-2.5 py-1 bg-gold/10 border border-gold/20 font-bold uppercase tracking-wider rounded-[var(--radius-sm)]">
            {college.type}
          </span>
          {college.nirfRanking && (
            <span className="text-micro text-text-muted px-2.5 py-1 bg-paper-dim font-medium uppercase tracking-wider rounded-[var(--radius-sm)] border border-hairline/50">
              NIRF #{college.nirfRanking}
            </span>
          )}
        </div>

        <Link
          href={`/medical/college/${college.id}`}
          className="inline-flex items-center gap-2 text-h3 font-bold text-text-main hover:text-gold transition-colors mb-3 group/title"
        >
          {college.name}
          <ArrowRight className="w-5 h-5 text-gold opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all" />
        </Link>
        
        {cutoff.track === "pg" && (
          <p className="text-body font-semibold text-gold-deep mb-2">{cutoff.course}</p>
        )}
        <div className="flex flex-wrap gap-4 text-small text-text-muted mb-6">
          <p className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gold/70" />
            {college.city}, {college.state}
          </p>
          {college.established > 0 && (
            <span className="flex items-center gap-1.5 border-l border-hairline pl-4">
              <Building2 className="w-4 h-4 text-gold/70" /> Est. {college.established}
            </span>
          )}
        </div>

        {/* Rank Gap Visualizer */}
        <div className="bg-paper-dim border border-hairline/50 rounded-[var(--radius-md)] p-4 max-w-sm relative overflow-hidden">
          <div className="flex justify-between items-end mb-2 relative z-10">
            <div className="text-micro uppercase text-text-muted tracking-wider font-semibold">Rank Gap</div>
            <div className={`text-small font-bold ${isPositive ? 'text-safe' : 'text-ambitious'}`}>
              {isPositive ? '+' : ''}{formatRank(gap)} ranks
            </div>
          </div>
          
          <div className="h-1.5 w-full bg-paper rounded-full overflow-hidden relative z-10 flex">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${ratio * 100}%` }}
              transition={{ duration: 1, delay: 0.2 + (index * 0.05) }}
              className={`h-full rounded-full ${isPositive ? 'bg-safe' : 'bg-ambitious'}`}
            />
          </div>
        </div>

      </div>

      <div className="sm:w-56 shrink-0 flex flex-col justify-between sm:text-right border-t sm:border-t-0 sm:border-l border-hairline pt-6 sm:pt-0 sm:pl-8 z-10">
        <div>
          <div className="text-micro text-text-muted font-semibold tracking-wider uppercase mb-1">{cutoff.rankType === "state" ? "Previous Closing State Rank" : "Previous Closing Rank"}</div>
          <div className="text-[32px] leading-tight font-bold tabular-nums text-text-main mb-2">
            {formatRank(cutoff.closingRank)}
          </div>
          <div className="flex sm:justify-end">
            <ProvenanceLabel quota={cutoff.state ? `${cutoff.state} ${cutoff.stateCategory}` : cutoff.quota.toUpperCase()} year={cutoff.year} round={`Round ${cutoff.round}`} />
          </div>
          {allRounds && allRounds.closingRank > cutoff.closingRank && (
            <div className="mt-4 pt-3 border-t border-hairline/60" title="The furthest rank that got this seat in any round of that year, including the stray round">
              <div className="text-micro text-text-muted font-semibold tracking-wider uppercase mb-0.5">{allRounds.year} All Rounds</div>
              <div className="text-body font-bold tabular-nums text-text-main">{formatRank(allRounds.closingRank)}</div>
            </div>
          )}
        </div>

        <div className="mt-8">
          <AddToCompareButton collegeId={college.id} collegeName={college.name} />
        </div>
      </div>
    </motion.div>
  );
}
