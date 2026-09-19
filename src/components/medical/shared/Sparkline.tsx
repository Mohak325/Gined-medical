import React from "react";
import { type TrendState, getTrendDisplay } from "@/lib/medical/trend";

interface SparklineProps {
  data: number[];
  trendState: TrendState;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Sparkline — 64x20 inline SVG line chart. 1.5px stroke.
 * Color maps to the trend state.
 * Design Guidelines v2 §10.6
 */
export default function Sparkline({
  data,
  trendState,
  width = 64,
  height = 20,
  className = "",
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div style={{ width, height }} className={className} />;
  }

  const { colorVar } = getTrendDisplay(trendState);
  
  // Find min and max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1; // avoid div by zero

  // Map data to SVG coordinates
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    // Invert Y so higher value is at the bottom? Wait, a rising rank number = easier = better for student.
    // If we want lower rank (harder) to go UP on the chart like a traditional "score":
    // Actually, rank numbers: 1000 is harder than 5000. So 1000 should be HIGHER on the Y axis.
    // Y = 0 is top, Y = height is bottom.
    // So smaller rank -> smaller Y (higher on screen).
    const y = ((val - min) / range) * height;
    return `${x},${y}`;
  });

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible ${className}`}
      style={{ stroke: `var(${colorVar})` }}
    >
      <polyline
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </svg>
  );
}
