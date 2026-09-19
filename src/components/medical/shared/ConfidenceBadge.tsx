import type { ConfidenceLevel } from "@/lib/medical/confidence";

const config: Record<
  ConfidenceLevel,
  { label: string; className: string }
> = {
  safe: {
    label: "Safe",
    className: "bg-[var(--safe-bg)] text-safe border-safe/20",
  },
  moderate: {
    label: "Moderate",
    className: "bg-[var(--moderate-bg)] text-moderate border-moderate/20",
  },
  ambitious: {
    label: "Ambitious",
    className: "bg-[var(--ambitious-bg)] text-ambitious border-ambitious/20",
  },
  longshot: {
    label: "Longshot",
    className: "bg-[var(--no-data)]/10 text-no-data border-no-data/20",
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
