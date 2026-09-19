import { getTrendDisplay, type TrendState } from "@/lib/medical/trend";

interface TrendIndicatorProps {
  state: TrendState;
  deltaPct?: number;
  showDelta?: boolean;
}

/**
 * TrendIndicator — Owns trend→colour+word mapping exclusively.
 * No other component derives trend display.
 *
 * CRITICAL: Falling closing rank = "Tightened" (harder to get in).
 * This is handled by trend.ts; this component just renders it.
 * Design Guidelines v2 §10.6
 */
export default function TrendIndicator({
  state,
  deltaPct,
  showDelta = true,
}: TrendIndicatorProps) {
  const { label, colorVar, arrow } = getTrendDisplay(state);

  return (
    <span
      className="inline-flex items-center gap-1 text-data font-medium"
      style={{ color: `var(${colorVar})` }}
    >
      <span className="text-sm">{arrow}</span>
      <span>{label}</span>
      {showDelta && deltaPct != null && state !== "new" && (
        <span className="text-micro opacity-70">
          ({deltaPct > 0 ? "+" : ""}
          {deltaPct}%)
        </span>
      )}
    </span>
  );
}
