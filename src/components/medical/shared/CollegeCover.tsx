/**
 * A generated cover for a college: a pattern seeded by its id, tinted by its type, with its
 * state code and founding year. Stands in until colleges have photos we have the right to use.
 */
const TINTS: Record<string, { bg: string; line: string; accent: string }> = {
  Government: { bg: "var(--ink)", line: "rgba(242,238,228,0.10)", accent: "var(--gold)" },
  Central: { bg: "#16352B", line: "rgba(242,238,228,0.10)", accent: "#8CC5A8" },
  Private: { bg: "var(--ink-soft)", line: "rgba(242,238,228,0.10)", accent: "var(--gold)" },
  Deemed: { bg: "#3B2F1A", line: "rgba(242,238,228,0.10)", accent: "var(--gold)" },
};

function seed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

export default function CollegeCover({
  id,
  type,
  stateCode,
  established,
  className = "",
  showLabel = true,
}: {
  id: string;
  type: string;
  stateCode: string;
  established?: number;
  className?: string;
  showLabel?: boolean;
}) {
  const tint = TINTS[type] ?? TINTS.Government;
  const h = seed(id);
  const cx = 60 + (h % 280);
  const cy = 40 + ((h >> 9) % 160);
  const rings = 5 + ((h >> 17) % 4);
  const tilt = (h >> 21) % 60;

  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" className={className} role="img" aria-label={`${type} college in ${stateCode}`}>
      <rect width="400" height="240" fill={tint.bg} />
      <g fill="none" stroke={tint.line} strokeWidth="1.25">
        {Array.from({ length: rings }, (_, i) => (
          <circle key={i} cx={cx} cy={cy} r={28 + i * 30} />
        ))}
      </g>
      <g stroke={tint.line} strokeWidth="1" transform={`rotate(${tilt} 200 120)`}>
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={-100} x2={500} y1={-60 + i * 45} y2={-60 + i * 45} />
        ))}
      </g>
      <circle cx={cx} cy={cy} r="7" fill={tint.accent} />
      {showLabel && (
        <g fontFamily="var(--font-instrument), Georgia, serif" fill="rgba(242,238,228,0.92)">
          <text x="24" y="194" fontSize="40">{stateCode}</text>
          {established ? (
            <text x="376" y="194" fontSize="20" textAnchor="end" fill="rgba(242,238,228,0.6)">
              est. {established}
            </text>
          ) : null}
        </g>
      )}
    </svg>
  );
}
