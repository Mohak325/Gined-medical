import type { CSSProperties, ReactNode } from "react";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import CountUp from "@/components/motion/CountUp";
import type { PhotoKey } from "@/content/images";

// Written out in full so Tailwind sees each class.
const COLS: Record<number, string> = { 3: "md:grid-cols-3", 4: "md:grid-cols-4" };

/**
 * The dark photo hero that opens a tool page: an eyebrow, a split serif headline with an italic
 * gold accent, a line of text, and optionally a strip of counting figures. Everything uses the
 * CSS intro animations, so it shows on the first paint without waiting for JavaScript.
 */
export default function PageHero({
  photo,
  eyebrow,
  title,
  accent,
  description,
  stats,
  children,
  className = "",
}: {
  photo: PhotoKey;
  eyebrow: string;
  title: string;
  /** The words after the title, set in italic gold. */
  accent?: string;
  description: ReactNode;
  stats?: { value: number; label: string; suffix?: string }[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`relative bg-ink-deep text-text-on-dark overflow-hidden ${className}`}>
      <Photo name={photo} priority parallax overlay="hero" decorative />
      <div aria-hidden className="absolute inset-0 z-[1] bg-ink-deep/45" />
      <div aria-hidden className="absolute -right-40 -top-20 z-[1] w-[36rem] h-[36rem] rounded-full bg-gold/10 blur-[140px]" />

      <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16">
        <p className="intro-fade text-eyebrow text-gold mb-5 flex items-center gap-3">
          <span aria-hidden className="h-px w-10 bg-gold" /> {eyebrow}
        </p>
        <SplitWords
          as="h1"
          intro
          delay={100}
          className="text-display-xl max-w-4xl [text-wrap:balance]"
          parts={[{ text: title }, ...(accent ? [{ text: accent, className: "italic text-sheen pr-1" }] : [])]}
        />
        <p className="intro text-body-large text-text-on-dark/75 mt-6 max-w-2xl" style={{ "--delay": "350ms" } as CSSProperties}>
          {description}
        </p>

        {stats && (
          <dl
            className={`intro mt-12 grid grid-cols-2 ${COLS[stats.length] ?? ""} gap-px rounded-[24px] overflow-hidden surface-ink-glass`}
            style={{ "--delay": "500ms" } as CSSProperties}
          >
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse gap-1 p-5 md:p-6 bg-ink-deep/30 last:odd:col-span-2 md:last:odd:col-span-1">
                <dt className="text-small text-text-on-dark/70">{s.label}</dt>
                <dd className="font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3rem] leading-none tabular-nums">
                  <CountUp value={s.value} suffix={s.suffix} />
                </dd>
              </div>
            ))}
          </dl>
        )}
        {children}
      </div>
    </section>
  );
}
