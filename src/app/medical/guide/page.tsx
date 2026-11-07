import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import roadmap from "@/content/roadmap.ug.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import PageHero from "@/components/medical/shared/PageHero";
import SectionNav from "@/components/medical/college/SectionNav";
import SplitWords from "@/components/motion/SplitWords";
import CounsellingCalendar from "@/components/medical/guide/CounsellingCalendar";
import DocumentChecklist from "@/components/medical/guide/DocumentChecklist";
import { collegeSummaries } from "@/lib/medical/collegeSummary";
import { STATE_PAGES } from "@/lib/medical/states";

export const metadata = {
  title: "NEET UG counselling guide: steps, documents and dates — gined.in",
  description: "The seven steps of NEET UG counselling, a documents checklist, the counselling calendar and a page for every state.",
};

const SECTIONS = [
  { id: "steps", label: "Steps" },
  { id: "documents", label: "Documents" },
  { id: "calendar", label: "Calendar" },
  { id: "states", label: "States" },
];

/** A numbered section heading; the anchor sits above it so the sticky bars don't cover it. */
function SectionHead({ id, n, title, intro, dark = false }: { id: string; n: string; title: string; intro?: ReactNode; dark?: boolean }) {
  return (
    <header className="mb-10 md:mb-12">
      <span id={id} aria-hidden className="block relative -top-20" />
      <p className={`text-eyebrow mb-3 flex items-center gap-3 ${dark ? "text-gold" : "text-gold-deep"}`} data-reveal="fade">
        <span className="tabular-nums">{n}</span>
        <span aria-hidden className="h-px w-8 bg-gold" />
      </p>
      <SplitWords id={`${id}-heading`} text={title} className={`text-display ${dark ? "" : "text-ink"}`} />
      {intro && (
        <p className={`text-body-large mt-4 max-w-2xl ${dark ? "text-text-on-dark/75" : "text-text-muted"}`} data-reveal="up">
          {intro}
        </p>
      )}
    </header>
  );
}

export default function GuidePage() {
  const documents = [...new Set(roadmap.steps.flatMap((s) => s.documents))];
  const counts = new Map<string, number>();
  for (const c of collegeSummaries()) if (c.mbbsSeats > 0) counts.set(c.stateCode, (counts.get(c.stateCode) ?? 0) + 1);
  const states = STATE_PAGES.filter((s) => counts.has(s.code));

  return (
    <>
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        <PageHero
          photo="graduation"
          eyebrow="Counselling guide"
          title="NEET UG counselling,"
          accent="start to finish."
          description="Seven steps, the documents each one needs, the dates to watch and how every state fills its seats."
          stats={[
            { value: roadmap.steps.length, label: "Steps, in order" },
            { value: documents.length, label: "Documents to keep ready" },
            { value: states.length, label: "State pages" },
          ]}
        />

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14">
          <SectionNav sections={SECTIONS} />

          <section data-section="steps" aria-labelledby="steps-heading" className="pb-20 md:pb-28">
            <SectionHead id="steps" n="01" title="The seven steps." intro="From your result to reporting at college. Each step lists what to keep ready." />
            <ol className="relative">
              <span aria-hidden className="absolute left-[1.375rem] md:left-[1.875rem] top-2 bottom-2 w-px bg-ink/10" />
              <span aria-hidden className="scroll-progress absolute left-[1.375rem] md:left-[1.875rem] top-2 bottom-2 w-px bg-gold" />
              {roadmap.steps.map((step) => (
                <li key={step.step_order} className="relative grid grid-cols-[auto_1fr] gap-4 md:gap-8 pb-6 last:pb-0">
                  <span className="relative z-[1] w-11 h-11 md:w-[3.75rem] md:h-[3.75rem] rounded-full bg-ink text-gold ring-8 ring-paper flex items-center justify-center font-[family-name:var(--font-instrument)] text-[1.35rem] md:text-[1.75rem] tabular-nums">
                    {step.step_order}
                  </span>
                  <div data-reveal="up" data-spotlight="" className="rounded-[24px] surface-premium p-6 md:p-8 grid gap-5 md:grid-cols-12 md:gap-8">
                    <div className="md:col-span-5">
                      <h3 className="font-[family-name:var(--font-instrument)] text-[1.75rem] md:text-[2.1rem] leading-[1.08] text-ink">{step.title}</h3>
                      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/12 border border-gold/30 px-3 py-1 text-micro font-semibold text-[var(--moderate-ink)]">
                        <Clock className="w-3.5 h-3.5" aria-hidden />
                        {step.timing_window}
                      </p>
                    </div>
                    <div className="md:col-span-7">
                      <p className="text-body text-text-muted">{step.body}</p>
                      {step.documents.length > 0 && (
                        <div className="mt-5">
                          <p className="text-eyebrow text-text-muted mb-2.5">Keep ready</p>
                          <ul className="flex flex-wrap gap-1.5">
                            {step.documents.map((doc) => (
                              <li key={doc} className="rounded-full bg-paper-bright border border-hairline px-3 py-1 text-micro font-normal tracking-normal text-ink">
                                {doc}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pb-20 md:pb-28 grid gap-14 lg:gap-12 lg:grid-cols-12 items-start">
          <section data-section="documents" aria-labelledby="documents-heading" className="lg:col-span-7">
            <SectionHead id="documents" n="02" title="Documents checklist." />
            <div data-reveal="up">
              <DocumentChecklist documents={documents} />
            </div>
          </section>

          <section data-section="calendar" aria-labelledby="calendar-heading" className="lg:col-span-5">
            <SectionHead id="calendar" n="03" title="Counselling calendar." />
            <div data-reveal="up" className="relative overflow-hidden rounded-[28px] bg-ink text-text-on-dark p-6 md:p-8 grain">
              <div aria-hidden className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative z-[2]">
                <CounsellingCalendar />
              </div>
            </div>
          </section>
        </div>

        <section data-section="states" aria-labelledby="states-heading" className="relative overflow-hidden bg-ink-deep text-text-on-dark grain">
          <div aria-hidden className="absolute -left-40 top-0 w-[36rem] h-[36rem] rounded-full bg-gold/10 blur-[140px]" />
          <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 py-20 md:py-28">
            <SectionHead id="states" n="04" title="Counselling by state." intro="Each state counsels its own quota. Pick yours for its colleges, seats, closing ranks and fees." dark />
            <ul className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {states.map((s, i) => (
                <li key={s.code} data-reveal="up" style={{ "--delay": `${(i % 4) * 50}ms` } as CSSProperties}>
                  <Link
                    href={`/medical/state/${s.slug}`}
                    className="group flex items-center justify-between gap-2 rounded-2xl surface-ink-glass px-4 py-3.5 transition-[background-color,transform] duration-300 hover:bg-white/[0.1] hover:-translate-y-0.5"
                  >
                    <span className="min-w-0">
                      <span className="block font-[family-name:var(--font-instrument)] text-[1.2rem] leading-tight truncate">{s.name}</span>
                      <span className="block text-micro font-normal tracking-normal text-text-on-dark/70 tabular-nums mt-0.5">
                        {counts.get(s.code)} college{counts.get(s.code) === 1 ? "" : "s"}
                      </span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 shrink-0 text-gold transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <CTABand source="guide_bottom" photo="operatingTheatre" headline="Rather not do this alone? A counsellor can walk every step with you." compact />
      <SiteFooter />
    </>
  );
}
