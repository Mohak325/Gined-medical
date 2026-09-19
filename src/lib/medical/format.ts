/**
 * Formatting utilities — PRD v2 §12.1
 *
 * Indian digit grouping: 12,847 and 1,24,500 — not 124,500.
 * Centralised so grouping is consistent across every result card,
 * table cell, trust bar figure, and comparison row.
 */

/**
 * Format a number with Indian digit grouping.
 * e.g. 1245000 → "12,45,000"
 *      12847   → "12,847"
 *      500     → "500"
 */
export function formatIndian(n: number | null | undefined): string {
  if (n == null) return "—";

  const str = Math.abs(Math.round(n)).toString();
  const sign = n < 0 ? "-" : "";

  if (str.length <= 3) return sign + str;

  // Last 3 digits get the first comma
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);

  // Remaining digits grouped in pairs
  const pairs = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");

  return sign + pairs + "," + last3;
}

/**
 * Format currency in INR.
 * e.g. 125000 → "₹1,25,000"
 *
 * For constrained contexts, use formatCurrencyShort:
 * e.g. 1250000 → "₹12.5 L"
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return "₹" + formatIndian(amount);
}

/**
 * Short currency format for constrained contexts.
 * e.g. 1250000 → "₹12.5 L"
 *      75000 → "₹75,000"
 */
export function formatCurrencyShort(amount: number | null | undefined): string {
  if (amount == null) return "—";
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    const formatted = lakhs % 1 === 0 ? lakhs.toString() : lakhs.toFixed(1);
    return `₹${formatted} L`;
  }
  return formatCurrency(amount);
}

/**
 * Format a rank — never abbreviated. 12,847 never 12.8k.
 */
export function formatRank(rank: number | null | undefined): string {
  return formatIndian(rank);
}

/**
 * Parse an Indian-grouped number string back to a number.
 * Handles pasted values with Indian grouping.
 * e.g. "1,24,500" → 124500
 *      "12,847" → 12847
 */
export function parseIndianNumber(str: string): number | null {
  const cleaned = str.replace(/[,\s]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}
