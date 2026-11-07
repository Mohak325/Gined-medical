"use client";

import { useEffect, useRef, useState } from "react";

const indian = (n: number) => n.toLocaleString("en-IN");

/**
 * A number that counts up once, the first time it is seen. The final value is rendered on the
 * server and is what screen readers read, so the count is only a visual flourish.
 */
export default function CountUp({ value, suffix = "", duration = 1600, className }: { value: number; suffix?: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          setShown(Math.round(value * (1 - Math.pow(1 - t, 4))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">
        {indian(value)}
        {suffix}
      </span>
      <span aria-hidden>
        {indian(shown ?? value)}
        {suffix}
      </span>
    </span>
  );
}
