import { Suspense } from "react";
import Link from "next/link";
import { ArrowUpRight, FileCheck2, Landmark, Scale } from "lucide-react";
import meta from "@/data/meta.json";
import ChancesCalculatorForm from "@/components/medical/calculator/ChancesCalculatorForm";
import HeroTrackPills from "./HeroTrackPills";

const years = meta.cutoffYears.join(" and ");

const sources = [
  { icon: Landmark, label: "MCC All India results" },
  { icon: Scale, label: `${meta.stateCutoffs.length} state counselling authorities` },
  { icon: FileCheck2, label: "Official fee documents" },
];

export default function HomeHero() {
  return (
    <section id="finder" className="relative overflow-hidden scroll-mt-16">
      {/* Quiet backdrop: a warm glow and a faint ledger grid. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_75%_30%,var(--gold-glow),transparent_70%)]" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.35] [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:linear-gradient(180deg,black,transparent_85%)]"
      />

      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-28 md:pt-36 pb-16 md:pb-24 grid gap-12 lg:gap-16 lg:grid-cols-12 items-center">
        <div className="lg:col-span-6">
          <p className="text-eyebrow text-gold-deep mb-6">NEET UG &amp; PG counselling · {meta.cutoffYear}</p>
          <h1 className="text-display-xl text-ink">
            Know where your <em className="italic text-gold-deep">rank</em> can take you.
          </h1>
          <p className="text-body-large text-text-muted mt-6 max-w-xl">
            Check your NEET rank against the official {years} closing ranks of {meta.ugCollegesWithCutoffs} MBBS colleges.
            Then plan choice filling with a counsellor who reads the numbers with you.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#finder-card"
              className="lg:hidden inline-flex items-center gap-2 px-5 py-3 bg-ink text-text-on-dark font-semibold text-small rounded-full"
            >
              Check my chances
            </a>
            <Link
              href="/medical/book?source=hero"
              className="inline-flex items-center gap-1.5 px-5 py-3 border border-border-strong text-ink font-semibold text-small rounded-full hover:bg-ink/[0.04] transition-colors"
            >
              Talk to a counsellor
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3" aria-label="Where the data comes from">
            {sources.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-small text-text-muted">
                <Icon className="w-4 h-4 text-gold-deep" aria-hidden />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div id="finder-card" className="lg:col-span-6 scroll-mt-24">
          <div className="relative bg-paper-bright border border-hairline rounded-[var(--radius-lg)] shadow-[0_24px_60px_-24px_rgba(15,46,61,0.25)] p-5 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-h3 text-ink">College Finder</h2>
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
        </div>
      </div>
    </section>
  );
}
