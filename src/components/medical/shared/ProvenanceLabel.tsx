interface ProvenanceLabelProps {
  quota: string;
  round?: string;
  year: number;
}

/**
 * ProvenanceLabel — Renders "AIQ · Round 1 · 2024" at Micro scale.
 * Enforces P2 from PRD: every figure needs provenance.
 * Design Guidelines v2 §3.1.2
 */
export default function ProvenanceLabel({
  quota,
  round,
  year,
}: ProvenanceLabelProps) {
  const parts = [quota, round, year.toString()].filter(Boolean);

  return (
    <span className="text-micro text-text-muted tracking-wide">
      {parts.join(" · ")}
    </span>
  );
}
