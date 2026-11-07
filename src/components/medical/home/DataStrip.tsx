import type { CSSProperties } from "react";
import meta from "@/data/meta.json";
import { collegeSummaries } from "@/lib/medical/collegeSummary";
import CountUp from "@/components/motion/CountUp";
import Marquee from "@/components/motion/Marquee";

/**
 * The proof band: a slow marquee of the most sought-after colleges (lowest All India closing
 * ranks), then the headline numbers counting up. Every number comes from meta.json.
 */
export default function DataStrip() {
  const top = collegeSummaries()
    .filter((c) => c.aiqClose)
    .sort((a, b) => a.aiqClose! - b.aiqClose!)
    .slice(0, 24);

  const stats = [
    { value: meta.ugCollegeCount, label: "MBBS colleges listed" },
    { value: meta.ugSeats, label: `UG seats in ${meta.seatYear}` },
    { value: meta.ugCollegesWithCutoffs, label: `MBBS colleges with ${meta.cutoffYear} cutoffs` },
    { value: meta.stateCutoffs.length, label: "State quotas, plus All India", suffix: " states" },
  ];

  return (
    <section aria-label="What the data covers" className="bg-paper-bright border-b border-hairline">
      <Marquee label="Some of the colleges covered" duration={90} className="py-6 border-b border-hairline">
        {top.map((c) => (
          <span key={c.id} className="flex items-center gap-6 pr-6 font-[family-name:var(--font-instrument)] text-[1.75rem] text-ink/80 whitespace-nowrap">
            {c.name.split(",")[0]}
            <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-gold" />
          </span>
        ))}
      </Marquee>
      <dl className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            data-reveal="up"
            style={{ "--delay": `${i * 90}ms` } as CSSProperties}
            className={`flex flex-col-reverse justify-end py-10 md:py-14 px-4 sm:px-8 ${i % 2 === 1 ? "border-l border-hairline" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-hairline" : ""} ${i === 2 ? "lg:border-l" : ""}`}
          >
            <dt className="text-small text-text-muted mt-2">{stat.label}</dt>
            <dd className="text-[clamp(2.5rem,5vw,4.25rem)] leading-none font-[family-name:var(--font-instrument)] text-ink tabular-nums">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
