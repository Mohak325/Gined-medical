import { Suspense, type CSSProperties } from "react";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import CountUp from "@/components/motion/CountUp";
import { collegeSummaries } from "@/lib/medical/collegeSummary";
import DirectoryClient, { type DirectoryCollege } from "./DirectoryClient";

export const metadata = {
  title: "All medical colleges in India — gined.in",
  description: `Search ${meta.collegeCount} medical colleges by state, type and yearly fee, with ${meta.cutoffYear} All India closing ranks and official fees.`,
};

export default function CollegesPage() {
  // Filtering happens in the browser on this compact list, so every filter change is instant.
  // Only the fields the directory shows or searches, to keep the page light.
  const colleges: DirectoryCollege[] = collegeSummaries().map((c) => ({
    id: c.id,
    name: c.name,
    city: c.city,
    state: c.state,
    stateCode: c.stateCode,
    type: c.type,
    established: c.established,
    university: c.university,
    mbbsSeats: c.mbbsSeats,
    pgSeats: c.pgSeats,
    aiqClose: c.aiqClose,
    feeMin: c.feeMin,
    feeMax: c.feeMax,
  }));
  const states = new Set(colleges.map((c) => c.stateCode)).size;
  const stats = [
    { value: meta.collegeCount, label: "Medical colleges" },
    { value: meta.ugCollegesWithCutoffs, label: `With ${meta.cutoffYear} closing ranks` },
    { value: meta.collegesWithFees, label: "With official fees" },
    { value: states, label: "States and union territories" },
  ];

  return (
    <>
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        <section className="relative bg-ink-deep text-text-on-dark overflow-hidden">
          <Photo name="grandLibrary" priority parallax overlay="hero" decorative />
          <div aria-hidden className="absolute inset-0 z-[1] bg-ink-deep/40" />
          <div aria-hidden className="absolute -left-40 bottom-0 z-[1] w-[36rem] h-[36rem] rounded-full bg-gold/10 blur-[140px]" />

          <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16">
            <p className="intro-fade text-eyebrow text-gold mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" /> Colleges directory
            </p>
            <SplitWords
              as="h1"
              intro
              delay={100}
              className="text-display-xl max-w-4xl"
              parts={[{ text: "Every medical college," }, { text: "side by side.", className: "italic text-sheen pr-1" }]}
            />
            <p className="intro text-body-large text-text-on-dark/75 mt-6 max-w-2xl" style={{ "--delay": "350ms" } as CSSProperties}>
              Filter by state, type and yearly fee. See {meta.cutoffYear} All India closing ranks and fees from official documents, where they&apos;re published.
            </p>

            <dl className="intro mt-12 grid grid-cols-2 md:grid-cols-4 gap-px rounded-[24px] overflow-hidden surface-ink-glass" style={{ "--delay": "500ms" } as CSSProperties}>
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col-reverse gap-1 p-5 md:p-6 bg-ink-deep/30">
                  <dt className="text-small text-text-on-dark/70">{s.label}</dt>
                  <dd className="font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3rem] leading-none tabular-nums">
                    <CountUp value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
          <Suspense fallback={<div className="skeleton h-[40rem] rounded-[28px]" />}>
            <DirectoryClient colleges={colleges} />
          </Suspense>
        </div>
      </main>
      <CTABand source="directory_bottom" compact />
      <SiteFooter />
    </>
  );
}
