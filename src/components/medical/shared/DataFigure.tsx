import { formatIndian } from "@/lib/medical/format";

interface DataFigureProps {
  value: number | null | undefined;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * DataFigure — Tabular numerals + Indian digit grouping.
 * All numerical data in the UI goes through this component.
 * Design Guidelines v2 §3.2
 */
export default function DataFigure({
  value,
  prefix,
  suffix,
  className = "",
}: DataFigureProps) {
  const formatted = formatIndian(value);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
