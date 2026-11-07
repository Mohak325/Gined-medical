import type { ConfidenceLevel } from "@/lib/medical/confidence";

const config: Record<
  ConfidenceLevel,
  { label: string; className: string }
> = {
  safe: {
    label: "Safe",
    className: "bg-[var(--safe-bg)] text-[var(--safe-ink)] border-safe/20",
  },
  moderate: {
    label: "Moderate",
    className: "bg-[var(--moderate-bg)] text-[var(--moderate-ink)] border-moderate/30",
  },
  ambitious: {
    label: "Ambitious",
    className: "bg-[var(--ambitious-bg)] text-[var(--ambitious-ink)] border-ambitious/20",
  },
  longshot: {
    label: "Longshot",
    className: "bg-paper-dim text-text-muted border-hairline",
  },
};

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

/**
 * ConfidenceBadge — Owns confidence→colour mapping exclusively.
 * No other component maps confidence to colour.
 * Design Guidelines v2 §3.1.2
 */
export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const { label, className } = config[level];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-[var(--radius-sm)] border text-micro font-semibold ${className}`}
    >
      {label}
    </span>
  );
}
