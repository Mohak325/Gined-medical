import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import meta from "@/data/meta.json";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import CountUp from "@/components/motion/CountUp";
import type { PhotoKey } from "@/content/images";

const LABELS = [
  // Wording follows CONFIDENCE_THRESHOLDS in src/lib/medical/confidence.ts.
  { name: "Safe", tone: "bg-safe", text: "Your rank is at least 15% better than the closing rank." },
  { name: "Moderate", tone: "bg-moderate", text: "Near the closing rank: up to 15% better or 10% past it." },
  { name: "Ambitious", tone: "bg-ambitious", text: "10 to 35% past the closing rank. Worth a place in your list." },
];

function PhotoTile({
  href,
  className = "",
  photo,
  eyebrow,
  title,
  body,
  figure,
  delay,
}: {
  href: string;
  className?: string;
  photo: PhotoKey;
  eyebrow: string;
  title: string;
  body: string;
  figure?: number;
  delay: number;
}) {
  return (
    <Link
      href={href}
      data-spotlight=""
      data-reveal="up"
      style={{ "--delay": `${delay}ms`, "--spot": "rgba(201,162,75,0.22)" } as CSSProperties}
      className={`group relative min-h-[300px] overflow-hidden rounded-[24px] bg-ink-deep text-text-on-dark flex flex-col justify-end p-6 md:p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${className}`}
    >
      <span className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
        <Photo name={photo} overlay="tile" decorative sizes="(min-width: 1024px) 33vw, 100vw" />
      </span>
      <span className="absolute top-5 right-5 z-[2] w-10 h-10 rounded-full surface-ink-glass flex items-center justify-center transition-transform duration-500 group-hover:rotate-45" aria-hidden>
        <ArrowUpRight className="w-5 h-5 text-gold" />
      </span>
      <span className="relative z-[2]">
        <span className="block text-eyebrow text-gold mb-3">{eyebrow}</span>
        {figure !== undefined && (
          <span className="block font-[family-name:var(--font-instrument)] text-[3rem] leading-none tabular-nums mb-2">
            <CountUp value={figure} />
          </span>
        )}
        <span className="block text-h3">{title}</span>
        <span className="block text-small text-text-on-dark/75 mt-1 max-w-sm">{body}</span>
      </span>
    </Link>
  );
}

export default function ToolsBento() {
  return (
    <section id="tools" className="py-24 md:py-32 scroll-mt-16">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end mb-12 md:mb-16">
          <div className="lg:col-span-8">
            <p className="text-eyebrow text-gold-deep mb-4" data-reveal="fade">Free tools</p>
            <SplitWords text="Everything you need before choice filling." className="text-display text-ink" />
          </div>
          <p className="lg:col-span-4 text-body-large text-text-muted" data-reveal="up" style={{ "--delay": "200ms" } as CSSProperties}>
            Built on official counselling results and fee documents, so every number has a source.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-6 md:auto-rows-[minmax(280px,auto)]">
          <Link
            href="/medical#finder"
            data-spotlight=""
            data-reveal="up"
            style={{ "--spot": "rgba(201,162,75,0.2)" } as CSSProperties}
            className="group md:col-span-4 md:row-span-2 relative overflow-hidden rounded-[24px] bg-ink text-text-on-dark p-7 md:p-10 flex flex-col justify-between gap-10 grain"
          >
            <span aria-hidden className="absolute -right-32 -top-32 w-[28rem] h-[28rem] rounded-full bg-gold/15 blur-3xl transition-transform duration-[1500ms] group-hover:scale-125" />
            <span aria-hidden className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] [background-size:48px_48px]" />
            <span className="relative z-[2] flex items-start justify-between">
              <span className="text-eyebrow text-gold">College Finder</span>
              <span className="w-11 h-11 rounded-full bg-gold text-ink flex items-center justify-center transition-transform duration-500 group-hover:rotate-45" aria-hidden>
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </span>
            <span className="relative z-[2] block">
              <span className="block text-display max-w-xl">Your rank against every college&apos;s {meta.cutoffYears.join(" and ")} closing ranks.</span>
              <span className="mt-10 grid gap-3 sm:grid-cols-3">
                {LABELS.map((label, i) => (
                  <span
                    key={label.name}
                    data-reveal="up"
                    style={{ "--delay": `${300 + i * 120}ms` } as CSSProperties}
                    className="block rounded-2xl surface-ink-glass p-4 transition-colors group-hover:bg-white/[0.08]"
                  >
                    <span className="flex items-center gap-2 text-small font-semibold">
                      <span className={`w-2.5 h-2.5 rounded-full ${label.tone} shadow-[0_0_12px_currentColor]`} aria-hidden />
                      {label.name}
                    </span>
                    <span className="block text-micro font-normal tracking-normal text-text-on-dark/70 mt-2 leading-relaxed">{label.text}</span>
                  </span>
                ))}
              </span>
            </span>
          </Link>

          <PhotoTile href="/medical/colleges" className="md:col-span-2" photo="microscope" eyebrow="Directory" figure={meta.collegeCount} title="Every medical college" body="Search by state, type and yearly fee." delay={100} />
          <PhotoTile href="/medical/seat-matrix" className="md:col-span-2" photo="heartModel" eyebrow="Seat matrix" figure={meta.ugSeats} title={`${meta.seatYear} seats`} body="By college, course and quota." delay={200} />
          <PhotoTile href="/medical/compare" className="md:col-span-3" photo="brainModel" eyebrow="Compare" title="Up to four colleges, side by side" body="Closing ranks, seats and official fees in one table." delay={100} />
          <PhotoTile href="/medical/guide" className="md:col-span-3" photo="anatomyDrawing" eyebrow="Guide" title="Counselling, start to finish" body="Seven steps, a documents checklist and every state." delay={200} />
        </div>
      </div>
    </section>
  );
}
