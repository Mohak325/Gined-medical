/**
 * Confidence model — PRD v2 §M4.3
 *
 * Single source of truth for confidence label calculation.
 * These constants are tuneable without touching component code.
 *
 * IMPORTANT: In production, confidence is computed server-side.
 * This module is used for the client-side mock and for the
 * confidence explainer dialog.
 */

/* ── Model constants ── */
export const CONFIDENCE_THRESHOLDS = {
  safe: 0.85,       // R ≤ 0.85·C → Safe
  moderate: 1.10,   // 0.85·C < R ≤ 1.10·C → Moderate
  ambitious: 1.35,  // 1.10·C < R ≤ 1.35·C → Ambitious
  // R > 1.35·C → excluded by default (longshot)
} as const;

/* ── Blending weights for reference closing rank ── */
export const BLENDING_WEIGHTS = {
  threeYear: [0.5, 0.3, 0.2] as const,  // most recent first
  twoYear: [0.65, 0.35] as const,
  oneYear: [1.0] as const,
} as const;

/* ── Volatility threshold ── */
export const VOLATILITY_THRESHOLD = 0.25; // >25% spread across years

export type ConfidenceLevel = "safe" | "moderate" | "ambitious" | "longshot";

/**
 * Compute the blended reference closing rank from historical data.
 * @param closingRanks Most recent year first: [2025, 2024, 2023]
 */
export function computeBlendedRank(closingRanks: number[]): number {
  const n = closingRanks.length;
  if (n === 0) return 0;

  const weights =
    n >= 3
      ? BLENDING_WEIGHTS.threeYear
      : n === 2
        ? BLENDING_WEIGHTS.twoYear
        : BLENDING_WEIGHTS.oneYear;

  let blended = 0;
  for (let i = 0; i < Math.min(n, weights.length); i++) {
    blended += closingRanks[i] * weights[i];
  }
  return Math.round(blended);
}

/**
 * Determine the confidence label for a student's rank against a reference.
 * Lower rank number = better.
 *
 * @param studentRank The student's NEET rank
 * @param referenceClosingRank The blended reference closing rank (C)
 */
export function computeConfidence(
  studentRank: number,
  referenceClosingRank: number
): ConfidenceLevel {
  if (referenceClosingRank <= 0) return "longshot";

  const ratio = studentRank / referenceClosingRank;

  if (ratio <= CONFIDENCE_THRESHOLDS.safe) return "safe";
  if (ratio <= CONFIDENCE_THRESHOLDS.moderate) return "moderate";
  if (ratio <= CONFIDENCE_THRESHOLDS.ambitious) return "ambitious";
  return "longshot";
}

/**
 * Check if cutoff data is volatile (>25% spread across years).
 */
export function isVolatile(closingRanks: number[]): boolean {
  if (closingRanks.length < 2) return false;
  const min = Math.min(...closingRanks);
  const max = Math.max(...closingRanks);
  if (min === 0) return true;
  return (max - min) / min > VOLATILITY_THRESHOLD;
}
