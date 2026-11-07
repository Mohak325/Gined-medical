"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A number that glides to its new value whenever it changes (for counts that follow a control,
 * like the what-if slider). With reduced motion it simply jumps.
 */
export default function TweenNumber({ value, duration = 600, className }: { value: number; duration?: number; className?: string }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      from.current = value;
      const frame = requestAnimationFrame(() => setShown(value));
      return () => cancelAnimationFrame(frame);
    }
    const t0 = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const next = Math.round(start + (value - start) * (1 - Math.pow(1 - t, 3)));
      from.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return <span className={className}>{shown.toLocaleString("en-IN")}</span>;
}
