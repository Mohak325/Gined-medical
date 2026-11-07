import Link from "next/link";
import roadmap from "@/content/roadmap.ug.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import CounsellingCalendar from "@/components/medical/guide/CounsellingCalendar";
import DocumentChecklist from "@/components/medical/guide/DocumentChecklist";
import { collegeSummaries } from "@/lib/medical/collegeSummary";
import { STATE_PAGES } from "@/lib/medical/states";

export const metadata = {
  title: "NEET UG counselling guide: steps, documents and dates — gined.in",
  description: "The seven steps of NEET UG counselling, a documents checklist, the counselling calendar and a page for every state.",
};

export default function GuidePage() {
  const documents = [...new Set(roadmap.steps.flatMap((s) => s.documents))];
  const counts = new Map<string, number>();
  for (const c of collegeSummaries()) if (c.mbbsSeats > 0) counts.set(c.stateCode, (counts.get(c.stateCode) ?? 0) + 1);
  const states = STATE_PAGES.filter((s) => counts.has(s.code));

  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-32 pb-16 bg-paper min-h-screen">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <header className="max-w-3xl">
            <p className="text-eyebrow text-gold-deep mb-4">Counselling guide</p>
            <h1 className="text-display-xl text-ink">NEET UG counselling, start to finish.</h1>
            <p className="text-body-large text-text-muted mt-6">Seven steps, the documents each one needs, the dates to watch and how every state fills its seats.</p>
            <nav aria-label="On this page" className="mt-8 flex flex-wrap gap-2 text-small">
              {[["#steps", "Steps"], ["#documents", "Documents"], ["#calendar", "Calendar"], ["#states", "States"]].map(([href, label]) => (
                <a key={href} href={href} className="px-4 py-2 rounded-full border border-hairline bg-paper-bright font-semibold text-ink hover:border-border-strong">{label}</a>
              ))}
            </nav>
          </header>

          <section id="steps" className="mt-16 scroll-mt-24" aria-labelledby="steps-heading">
            <h2 id="steps-heading" className="text-h1 text-ink mb-8">The seven steps</h2>
            <ol className="space-y-4">
              {roadmap.steps.map((step) => (
                <li key={step.step_order} className="grid gap-4 md:grid-cols-12 rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 md:p-8">
                  <div className="md:col-span-4">
                    <span className="w-9 h-9 rounded-full bg-ink text-gold flex items-center justify-center text-small font-semibold tabular-nums">{step.step_order}</span>
                    <h3 className="text-h2 text-ink mt-4">{step.title}</h3>
                    <p className="text-small font-semibold text-gold-deep mt-1">{step.timing_window}</p>
                  </div>
                  <div className="md:col-span-8">
                    <p className="text-body text-text-muted">{step.body}</p>
                    {step.documents.length > 0 && (
                      <p className="text-small text-text-muted mt-4"><span className="font-semibold text-ink">Keep ready:</span> {step.documents.join(", ")}.</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="mt-20 grid gap-12 lg:grid-cols-12">
            <section id="documents" className="lg:col-span-7 scroll-mt-24" aria-labelledby="documents-heading">
              <h2 id="documents-heading" className="text-h1 text-ink mb-6">Documents checklist</h2>
              <DocumentChecklist documents={documents} />
            </section>
            <section id="calendar" className="lg:col-span-5 scroll-mt-24" aria-labelledby="calendar-heading">
              <h2 id="calendar-heading" className="text-h1 text-ink mb-6">Counselling calendar</h2>
              <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6">
                <CounsellingCalendar />
              </div>
            </section>
          </div>

          <section id="states" className="mt-20 scroll-mt-24" aria-labelledby="states-heading">
            <h2 id="states-heading" className="text-h1 text-ink mb-2">Counselling by state</h2>
            <p className="text-body text-text-muted mb-6">Each state counsels its own quota. Pick yours for its colleges, seats, closing ranks and fees.</p>
            <ul className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {states.map((s) => (
                <li key={s.code}>
                  <Link href={`/medical/state/${s.slug}`} className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-hairline bg-paper-bright px-4 py-3 text-small hover:border-border-strong">
                    <span className="font-semibold text-ink truncate">{s.name}</span>
                    <span className="text-text-muted tabular-nums shrink-0">{counts.get(s.code)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
      <CTABand source="guide_bottom" headline="Rather not do this alone? A counsellor can walk every step with you." compact />
      <SiteFooter />
    </>
  );
}
