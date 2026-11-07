import { Suspense, type CSSProperties } from "react";
import { FileCheck2, Landmark, Scale } from "lucide-react";
import meta from "@/data/meta.json";
import { collegeSummary } from "@/lib/medical/collegeSummary";
import { formatRank } from "@/lib/medical/format";
import ChancesCalculatorForm from "@/components/medical/calculator/ChancesCalculatorForm";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import Cta from "@/components/ui/Cta";
import HeroTrackPills from "./HeroTrackPills";

const years = meta.cutoffYears.join(" and ");

const sources = [
  { icon: Landmark, label: "MCC All India results" },
  { icon: Scale, label: `${meta.stateCutoffs.length} state counselling authorities` },
  { icon: FileCheck2, label: "Official fee documents" },
];

// Real closing ranks floating beside the finder: proof of the data, not decoration.
const CHIP_COLLEGES = ["ug_in073g1", "ug_ka001g1", "ug_in086g1"];
const CHIP_POSITIONS = ["-left-28 top-28", "-right-6 -top-10", "-left-14 -bottom-10"];

export default function HomeHero() {
  const chips = CHIP_COLLEGES.map((id) => collegeSummary(id)).filter((c) => c?.aiqClose);

  return (
    <section id="finder" className="relative min-h-[100svh] flex items-center bg-ink-deep text-text-on-dark overflow-hidden scroll-mt-16">
      <Photo name="surgeons" priority parallax overlay="hero" decorative />
      <div aria-hidden className="lg:hidden absolute inset-0 z-[1] bg-ink-deep/55" />
      <div aria-hidden className="absolute -right-40 top-1/4 z-[1] w-[40rem] h-[40rem] rounded-full bg-gold/10 blur-[140px]" />

      <div className="relative z-[2] w-full max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-36 pb-20 grid gap-14 lg:gap-16 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6">
          <p className="intro-fade text-eyebrow text-gold mb-6 flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" /> NEET UG &amp; PG counselling · {meta.cutoffYear}
          </p>
          <SplitWords
            as="h1"
            intro
            className="text-display-xl"
            delay={150}
            parts={[{ text: "Know where your" }, { text: "rank", className: "italic text-sheen pr-1" }, { text: "can take you." }]}
          />
          <p className="intro text-body-large text-text-on-dark/75 mt-7 max-w-xl" style={{ "--delay": "450ms" } as CSSProperties}>
            Check your NEET rank against the official {years} closing ranks of {meta.ugCollegesWithCutoffs} MBBS colleges. Then plan choice filling with a counsellor who reads the numbers with you.
          </p>

          <div className="intro mt-9 flex flex-wrap items-center gap-3" style={{ "--delay": "600ms" } as CSSProperties}>
            <Cta href="#finder-card" variant="gold" size="lg" className="lg:hidden">Check my chances</Cta>
            <Cta href="/medical/book?source=hero" variant="glass" size="lg">Talk to a counsellor</Cta>
          </div>

          <ul className="intro-fade mt-12 flex flex-wrap gap-x-6 gap-y-3" aria-label="Where the data comes from" style={{ "--delay": "750ms" } as CSSProperties}>
            {sources.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-small text-text-on-dark/70">
                <Icon className="w-4 h-4 text-gold" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div id="finder-card" className="intro-scale lg:col-span-6 relative scroll-mt-24" style={{ "--delay": "300ms" } as CSSProperties}>
          <div className="relative surface-glass text-ink rounded-[28px] p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-h2 font-[family-name:var(--font-instrument)] font-normal text-ink">College Finder</h2>
                <p className="text-small text-text-muted mt-1">Free, instant and no sign-up.</p>
              </div>
              <HeroTrackPills />
            </div>
            <Suspense fallback={<div className="h-64 rounded-[var(--radius-md)] bg-paper-dim/60 animate-pulse" />}>
              <ChancesCalculatorForm mode="hero" />
            </Suspense>
            <p className="mt-5 pt-5 border-t border-hairline text-micro font-normal tracking-normal text-text-muted">
              Safe, Moderate and Ambitious labels compare your rank with past closing ranks. They are a guide, not a guarantee.
            </p>
          </div>

          {chips.length > 0 && (
            <ul aria-label={`${meta.cutoffYear} All India Round 1 closing ranks`} className="hidden xl:block">
              {chips.map((c, i) => (
                <li
                  key={c!.id}
                  className={`absolute ${CHIP_POSITIONS[i]} z-[3] float-slow rounded-2xl px-4 py-3 bg-ink-deep/92 backdrop-blur-md border border-white/10 text-text-on-dark shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] max-w-[15rem]`}
                  style={{ animationDelay: `${i * -2.3}s` }}
                >
                  <span className="block text-micro font-normal tracking-normal text-text-on-dark/80 truncate">{c!.name.split(",")[0]}</span>
                  <span className="flex items-baseline gap-2">
                    <span className="text-h3 tabular-nums">{formatRank(c!.aiqClose)}</span>
                    <span className="text-micro text-gold">AIQ close</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <a
        href="#tools"
        className="absolute z-[2] bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-micro uppercase tracking-[0.2em] text-text-on-dark/60 hover:text-text-on-dark"
        aria-label="Scroll to the tools"
      >
        Scroll
        <span aria-hidden className="relative h-10 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-gold animate-[scroll-cue_2s_ease-in-out_infinite]" />
        </span>
      </a>
    </section>
  );
}
