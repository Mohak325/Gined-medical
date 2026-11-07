import type { CSSProperties } from "react";
import { Compass, LineChart, ListOrdered, ShieldCheck } from "lucide-react";
import meta from "@/data/meta.json";
import SplitWords from "@/components/motion/SplitWords";

const reasons = [
  {
    icon: LineChart,
    title: "Data over intuition",
    body: `We compare your rank with official ${meta.cutoffYear} closing ranks, so your shortlist starts from real numbers rather than guesswork.`,
  },
  {
    icon: ShieldCheck,
    title: "No hidden agendas",
    body: "We have no tie-ups with private colleges. Recommendations start from your rank and the data, nothing else.",
  },
  {
    icon: ListOrdered,
    title: "Preference order that works",
    body: "A good rank can be wasted by a bad order. We build your choice list so it can upgrade in later rounds and mop-up.",
  },
  {
    icon: Compass,
    title: "Honest about uncertainty",
    body: "Safe, Moderate and Ambitious are guides, not guarantees. Cutoffs move every year, so your list is built to allow for that.",
  },
];

export default function WhyGined() {
  return (
    <section id="why-us" className="py-24 md:py-32">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid gap-12 lg:grid-cols-12">
        <header className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
          <p className="text-eyebrow text-gold-deep mb-4" data-reveal="fade">Why Gined</p>
          <SplitWords text="Counselling that starts from your numbers." className="text-display text-ink" />
        </header>
        <ol className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
          {reasons.map((reason, i) => (
            <li
              key={reason.title}
              data-spotlight=""
              data-reveal="up"
              style={{ "--delay": `${(i % 2) * 120}ms` } as CSSProperties}
              className="group surface-premium rounded-[24px] p-7 md:p-8 transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <span className="w-12 h-12 rounded-2xl bg-ink text-gold flex items-center justify-center transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
                  <reason.icon className="w-6 h-6" aria-hidden />
                </span>
                <span className="font-[family-name:var(--font-instrument)] text-[3rem] leading-none text-ink/10 tabular-nums" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-h2 font-[family-name:var(--font-instrument)] font-normal text-ink mt-8">{reason.title}</h3>
              <p className="text-body text-text-muted mt-3">{reason.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
