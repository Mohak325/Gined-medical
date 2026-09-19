"use client";

import { useMemo } from "react";
import type { CutoffEntry } from "@/lib/medical/mockData";
import { formatRank } from "@/lib/medical/format";

interface CutoffTrendChartProps {
  cutoffs: CutoffEntry[];
  category: string;
  quota: string;
}

export default function CutoffTrendChart({ cutoffs, category, quota }: CutoffTrendChartProps) {
  // Filter for the specific category and quota
  const relevant = useMemo(() => {
    return cutoffs
      .filter((c) => c.category === category && c.quota === quota && c.round === 1)
      .sort((a, b) => a.year - b.year);
  }, [cutoffs, category, quota]);

  if (relevant.length < 2) {
    return (
      <div className="bg-paper border border-hairline rounded-[var(--radius-md)] p-8 text-center text-text-muted">
        Not enough historical data to show a trend.
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const padding = 40;
  const contentW = width - padding * 2;
  const contentH = height - padding * 2;

  const ranks = relevant.map(r => r.closingRank);
  const minRank = Math.min(...ranks);
  const maxRank = Math.max(...ranks);
  const range = maxRank - minRank || 1;

  const points = relevant.map((entry, i) => {
    const x = padding + (i / (relevant.length - 1)) * contentW;
    // Lower rank number is "harder" and typically represented higher up on traditional rank charts.
    // So smaller rank = smaller Y.
    const y = padding + ((entry.closingRank - minRank) / range) * contentH;
    return { x, y, ...entry };
  });

  return (
    <div className="bg-paper border border-hairline rounded-[var(--radius-md)] p-6 overflow-x-auto">
      <h3 className="text-h4 mb-6 text-text-main">Closing Rank Trend (Round 1)</h3>
      <div className="min-w-[400px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Axes */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--border)" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--border)" />

          {/* Line */}
          <polyline
            fill="none"
            stroke="var(--gold)"
            strokeWidth="3"
            points={points.map(p => `${p.x},${p.y}`).join(" ")}
          />

          {/* Points & Labels */}
          {points.map((p, i) => (
            <g key={p.year}>
              <circle cx={p.x} cy={p.y} r="5" fill="var(--paper-bright)" stroke="var(--gold)" strokeWidth="2" />
              <text x={p.x} y={height - padding + 20} textAnchor="middle" className="text-micro fill-text-muted">
                {p.year}
              </text>
              <text x={p.x} y={p.y - 12} textAnchor="middle" className="text-micro font-semibold fill-text-main">
                {formatRank(p.closingRank)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
