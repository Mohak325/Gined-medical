/**
 * Trend calculation — PRD v2 §M7, Design §10.6
 *
 * CRITICAL: The rank semantics are inverted from what's intuitive.
 * A FALLING closing rank number means the cutoff got HARDER (fewer ranks admitted).
 * A RISING closing rank number means it got EASIER (more ranks admitted).
 *
 * This module is the SINGLE source of truth for this logic.
 * The client renders it; it never derives it.
 */

export const TREND_THRESHOLD = 0.05; // ±5%

export type TrendState = "tightened" | "stable" | "eased" | "new";

export interface TrendResult {
  state: TrendState;
  deltaPct: number;
  comparedYears: [number, number] | null;
}

/**
 * Compute the trend state between two years of closing rank data.
 *
 * @param currentYearRank Closing rank for the more recent year
 * @param previousYearRank Closing rank for the earlier year
 * @param currentYear The more recent year
 * @param previousYear The earlier year
 *
 * IMPORTANT: A falling rank number = tightened (harder).
 * If rank went from 15000 to 12000, that's a -20% change → TIGHTENED.
 * If rank went from 12000 to 15000, that's a +25% change → EASED.
 */
export function computeTrend(
  currentYearRank: number | null,
  previousYearRank: number | null,
  currentYear: number,
  previousYear: number
): TrendResult {
  if (currentYearRank == null || previousYearRank == null || previousYearRank === 0) {
    return { state: "new", deltaPct: 0, comparedYears: null };
  }

  const deltaPct = (currentYearRank - previousYearRank) / previousYearRank;

  // Negative delta = rank fell = harder to get in = tightened
  if (deltaPct <= -TREND_THRESHOLD) {
    return {
      state: "tightened",
      deltaPct: Math.round(deltaPct * 1000) / 10, // one decimal
      comparedYears: [currentYear, previousYear],
    };
  }

  // Positive delta = rank rose = easier to get in = eased
  if (deltaPct >= TREND_THRESHOLD) {
    return {
      state: "eased",
      deltaPct: Math.round(deltaPct * 1000) / 10,
      comparedYears: [currentYear, previousYear],
    };
  }

  return {
    state: "stable",
    deltaPct: Math.round(deltaPct * 1000) / 10,
    comparedYears: [currentYear, previousYear],
  };
}

/**
 * Get the display properties for a trend state.
 */
export function getTrendDisplay(state: TrendState): {
  label: string;
  colorVar: string;
  arrow: "↓" | "→" | "↑" | "—";
} {
  switch (state) {
    case "tightened":
      return { label: "Tightened", colorVar: "--trend-tightened", arrow: "↓" };
    case "stable":
      return { label: "Stable", colorVar: "--trend-stable", arrow: "→" };
    case "eased":
      return { label: "Eased", colorVar: "--trend-eased", arrow: "↑" };
    case "new":
      return { label: "New / no history", colorVar: "--no-data", arrow: "—" };
  }
}
