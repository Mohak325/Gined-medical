import type { CSSProperties, ReactNode } from "react";

/** A slow, endless ticker that pauses on hover. Items repeat once so the loop is seamless. */
export default function Marquee({ children, duration = 60, className = "", label }: { children: ReactNode; duration?: number; className?: string; label: string }) {
  return (
    <section aria-label={label} className={`marquee overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)] ${className}`}>
      <div className="marquee-track flex w-max" style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </section>
  );
}
