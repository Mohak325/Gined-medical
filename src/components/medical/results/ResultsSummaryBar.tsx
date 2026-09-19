"use client";

import { useMemo } from "react";
import { type ConfidenceLevel } from "@/lib/medical/confidence";
import { SlidersHorizontal, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ResultsSummaryBarProps {
  total: number;
  breakdown: Record<ConfidenceLevel, number>;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showLongshots: boolean;
  onToggleLongshots: () => void;
}

export default function ResultsSummaryBar({
  total,
  breakdown,
  sortBy,
  onSortChange,
  showLongshots,
  onToggleLongshots
}: ResultsSummaryBarProps) {
  
  // Calculate distribution for the visual bar
  const totalInView = total;
  const safePct = totalInView ? (breakdown.safe / totalInView) * 100 : 0;
  const modPct = totalInView ? (breakdown.moderate / totalInView) * 100 : 0;
  const ambPct = totalInView ? (breakdown.ambitious / totalInView) * 100 : 0;
  const longPct = totalInView && showLongshots ? (breakdown.longshot / totalInView) * 100 : 0;

  return (
    <div className="sticky top-[var(--h-nav)] z-[var(--z-sticky)] bg-paper/85 backdrop-blur-xl border-b border-hairline py-6 px-6 md:px-12 flex flex-col gap-5 -mx-6 md:-mx-12 mb-10 shadow-sm transition-all duration-300">
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Stats */}
        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[32px] font-bold text-text-main leading-none tabular-nums tracking-tight">
              {total}
            </span>
            <span className="text-micro font-semibold uppercase tracking-widest text-text-muted mt-1">
              Colleges Found
            </span>
          </div>
          
          <div className="h-10 w-px bg-hairline hidden sm:block" />
          
          <div className="hidden sm:flex items-center gap-3">
            {[
              { label: "Safe", count: breakdown.safe, color: "var(--safe-fg)", bg: "var(--safe-bg)" },
              { label: "Moderate", count: breakdown.moderate, color: "var(--moderate-fg)", bg: "var(--moderate-bg)" },
              { label: "Ambitious", count: breakdown.ambitious, color: "var(--ambitious-fg)", bg: "var(--ambitious-bg)" },
            ].map(tier => tier.count > 0 && (
              <div key={tier.label} className="flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color }} />
                  <span className="text-micro font-semibold text-text-main">{tier.count}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-text-muted">{tier.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          
          {/* Custom Toggle Switch */}
          <button 
            onClick={onToggleLongshots}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className={`w-10 h-6 rounded-full p-1 transition-colors duration-300 ${showLongshots ? 'bg-gold' : 'bg-paper-dim border border-hairline'}`}>
              <motion.div 
                layout
                className={`w-4 h-4 rounded-full shadow-sm ${showLongshots ? 'bg-ink' : 'bg-text-muted'}`}
                animate={{ x: showLongshots ? 16 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </div>
            <span className="text-small font-medium text-text-muted group-hover:text-text-main transition-colors flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Longshots
              <span className="bg-paper-dim px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] ml-1">{breakdown.longshot}</span>
            </span>
          </button>

          <div className="h-6 w-px bg-hairline" />

          {/* Sort Dropdown */}
          <div className="relative flex items-center gap-2 bg-paper-bright border border-hairline rounded-[var(--radius-md)] px-3 py-2 hover:border-gold/30 transition-colors">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <select 
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-small font-semibold text-text-main focus:outline-none cursor-pointer appearance-none pr-4"
            >
              <option value="confidence_desc">Best Match First</option>
              <option value="cutoff_asc">Highest Cutoff First</option>
              <option value="cutoff_desc">Lowest Cutoff First</option>
              <option value="fees_asc">Lowest Fees First</option>
            </select>
          </div>
        </div>

      </div>

      {/* Distribution Visualizer Bar */}
      <div className="w-full h-2 flex rounded-full overflow-hidden bg-paper-dim border border-hairline/50">
        <motion.div initial={{ width: 0 }} animate={{ width: `${safePct}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-safe" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${modPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.1 }} className="h-full bg-moderate" />
        <motion.div initial={{ width: 0 }} animate={{ width: `${ambPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }} className="h-full bg-ambitious" />
        {showLongshots && (
          <motion.div initial={{ width: 0 }} animate={{ width: `${longPct}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="h-full bg-ink-light" />
        )}
      </div>

    </div>
  );
}
