import { Suspense, type CSSProperties } from "react";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import ChancesCalculatorForm from "@/components/medical/calculator/ChancesCalculatorForm";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import ResultsClient from "./ResultsClient";

export const metadata = {
  title: "Your college options — gined.in College Finder",
  description: "MBBS colleges your NEET rank can reach, labelled Safe, Moderate or Ambitious from official closing ranks.",
};

export default function ResultsPage() {
  return (
    <>
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        <section className="relative bg-ink-deep text-text-on-dark overflow-hidden">
          <Photo name="laptopStethoscope" priority parallax overlay="hero" decorative />
          <div aria-hidden className="absolute inset-0 z-[1] bg-ink-deep/45" />
          <div aria-hidden className="absolute -right-40 -top-20 z-[1] w-[36rem] h-[36rem] rounded-full bg-gold/10 blur-[140px]" />

          <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-10 md:pb-14">
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end mb-10 md:mb-12">
              <div className="lg:col-span-7">
                <p className="intro-fade text-eyebrow text-gold mb-5 flex items-center gap-3">
                  <span aria-hidden className="h-px w-10 bg-gold" /> College Finder
                </p>
                <SplitWords
                  as="h1"
                  intro
                  delay={100}
                  className="text-display-xl"
                  parts={[{ text: "Your college" }, { text: "options.", className: "italic text-sheen pr-1" }]}
                />
              </div>
              <p className="intro lg:col-span-5 text-body-large text-text-on-dark/75 max-w-lg" style={{ "--delay": "350ms" } as CSSProperties}>
                Every college your rank can reach, checked against the official {meta.cutoffYears.join(" and ")} closing ranks and labelled Safe, Moderate or Ambitious.
              </p>
            </div>

            <div className="intro-scale surface-glass text-ink rounded-[28px] p-4 sm:p-6" style={{ "--delay": "250ms" } as CSSProperties}>
              {/* The placeholder matches the form's height at each width, so nothing below jumps when it appears. */}
              <Suspense fallback={<div className="skeleton h-[357px] md:h-[182px] lg:h-[81px] rounded-[var(--radius-md)]" />}>
                <ChancesCalculatorForm mode="results" />
              </Suspense>
            </div>
          </div>
        </section>

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
          <Suspense fallback={<div className="skeleton h-96 rounded-[28px]" />}>
            <ResultsClient />
          </Suspense>
        </div>
      </main>
      <CTABand source="results_bottom" compact />
      <SiteFooter />
    </>
  );
}
