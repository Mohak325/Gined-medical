import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight, Landmark } from "lucide-react";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import PageHero from "@/components/medical/shared/PageHero";
import Cta from "@/components/ui/Cta";
import SplitWords from "@/components/motion/SplitWords";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { collegeSummaries, type CollegeSummary } from "@/lib/medical/collegeSummary";
import { STATE_PAGES, hasStateCutoffs, stateAuthority, stateBySlug } from "@/lib/medical/states";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const withColleges = new Set(collegeSummaries().filter((c) => c.mbbsSeats > 0).map((c) => c.stateCode));
  return STATE_PAGES.filter((s) => withColleges.has(s.code)).map((s) => ({ slug: s.slug }));
}

function stateColleges(code: string) {
  return collegeSummaries().filter((c) => c.stateCode === code && c.mbbsSeats > 0);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const state = stateBySlug((await params).slug);
  if (!state) return {};
  const colleges = stateColleges(state.code);
  return {
    alternates: { canonical: `/medical/state/${state.slug}` },
    title: `MBBS colleges in ${state.name}: seats, cutoffs and fees — gined.in`,
    description: `${colleges.length} MBBS colleges and ${colleges.reduce((n, c) => n + c.mbbsSeats, 0).toLocaleString("en-IN")} seats in ${state.name}, with ${meta.cutoffYear} closing ranks and official fees.`,
  };
}

const TYPE_TONE: Record<string, string> = {
  Government: "bg-ink text-text-on-dark",
  Central: "bg-[var(--safe-bg)] text-[var(--safe-ink)]",
  Private: "bg-paper-dim text-ink",
  Deemed: "bg-gold/15 text-[var(--moderate-ink)]",
};

const range = (values: number[], format: (n: number) => string) => {
  if (values.length === 0) return "—";
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? format(lo) : `${format(lo)}–${format(hi)}`;
};

export default async function StatePage({ params }: Params) {
  const state = stateBySlug((await params).slug);
  if (!state) notFound();
  const colleges = stateColleges(state.code).sort((a, b) => (a.aiqClose ?? Infinity) - (b.aiqClose ?? Infinity) || a.name.localeCompare(b.name));
  if (colleges.length === 0) notFound();

  const seats = colleges.reduce((n, c) => n + c.mbbsSeats, 0);
  const byType = (t: CollegeSummary["type"]) => colleges.filter((c) => c.type === t);
  const government = [...byType("Government"), ...byType("Central")];
  const others = colleges.filter((c) => c.type === "Private" || c.type === "Deemed");
  const authority = stateAuthority(state.code);
  const covered = hasStateCutoffs(state.code);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Counselling guide", item: `${SITE_URL}/medical/guide` },
            { "@type": "ListItem", position: 2, name: state.name, item: `${SITE_URL}/medical/state/${state.slug}` },
          ],
        }}
      />
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        <PageHero
          photo="operatingTheatre"
          eyebrow={`MBBS in ${state.name}`}
          title={`${colleges.length} medical colleges,`}
          accent={`${seats.toLocaleString("en-IN")} MBBS seats.`}
          description={`Every MBBS college in ${state.name}, sorted by how hard it was to get in through the All India Quota, with official fees where they are published.`}
          breadcrumb={
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-small text-text-on-dark/70">
              <Link href="/medical/guide" className="hover:text-text-on-dark transition-colors">Counselling guide</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gold" aria-hidden />
              <span>{state.name}</span>
            </nav>
          }
          stats={[
            { value: government.length, label: "Government and central colleges" },
            { value: others.length, label: "Private and deemed colleges" },
            { value: range(colleges.flatMap((c) => (c.aiqClose ? [c.aiqClose] : [])), formatRank), label: `All India close, General (${meta.cutoffYear} R1)` },
            { value: range(colleges.flatMap((c) => (c.feeGovt ? [c.feeGovt] : [])), formatCurrencyShort), label: "Government quota fee a year" },
          ]}
        />

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-14 md:pt-20 pb-20 md:pb-28 grid gap-12 lg:gap-14 lg:grid-cols-12 items-start">
          <section className="lg:col-span-4 lg:sticky lg:top-28 space-y-5" aria-labelledby="counselling-heading">
            <div data-reveal="up" className="relative overflow-hidden rounded-[28px] bg-ink text-text-on-dark p-6 md:p-7 grain">
              <div aria-hidden className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
              <div className="relative z-[2]">
                <p className="text-eyebrow text-gold">Two routes in</p>
                <h2 id="counselling-heading" className="font-[family-name:var(--font-instrument)] text-[2rem] leading-none mt-3">How seats are filled</h2>
                <div className="mt-6 space-y-4 text-small text-text-on-dark/80">
                  <p>
                    <strong className="text-text-on-dark">All India Quota:</strong> 15% of government college seats, counselled by MCC for students from any state.
                    Deemed and central university seats are also counselled by MCC.
                  </p>
                  <p>
                    <strong className="text-text-on-dark">State quota:</strong> the remaining government seats, and most private college seats, are counselled by{" "}
                    {authority ? <span className="text-text-on-dark">{authority}</span> : `${state.name}'s own counselling authority`}. Eligibility usually depends on domicile.
                  </p>
                  <p className="flex items-start gap-2.5 rounded-2xl surface-ink-glass p-3.5">
                    <Landmark className="w-4 h-4 mt-0.5 text-gold shrink-0" aria-hidden />
                    {covered
                      ? `We hold ${state.name}'s own ${meta.cutoffYear} state quota closing ranks, so the College Finder can check your state quota chances.`
                      : `We don't hold ${state.name}'s state quota closing ranks yet. A counsellor can tell you how it filled.`}
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-2.5">
                  {covered && (
                    <Cta href="/medical#finder" variant="gold" className="w-full">
                      Check my {state.name} chances
                    </Cta>
                  )}
                  <Cta href={`/medical/book?source=state-${state.code.toLowerCase()}&state=${state.code}`} variant={covered ? "glass" : "gold"} className="w-full">
                    Ask about {state.name} counselling
                  </Cta>
                </div>
              </div>
            </div>
          </section>

          <section className="lg:col-span-8 min-w-0" aria-labelledby="colleges-heading">
            <p className="text-eyebrow text-gold-deep mb-3" data-reveal="fade">Every MBBS college</p>
            <SplitWords id="colleges-heading" text={`Colleges in ${state.name}.`} className="text-display text-ink mb-8" />
            <div data-reveal="up" className="rounded-[28px] surface-premium overflow-x-auto">
              <table className="w-full text-small">
                <thead className="text-left text-micro font-semibold text-text-muted border-b border-hairline bg-paper/60">
                  <tr>
                    <th scope="col" className="px-5 py-4">College</th>
                    <th scope="col" className="px-5 py-4">Type</th>
                    <th scope="col" className="px-5 py-4 text-right whitespace-nowrap">Seats</th>
                    <th scope="col" className="px-5 py-4 text-right whitespace-nowrap">AIQ close</th>
                    <th scope="col" className="px-5 py-4 text-right whitespace-nowrap">Fee from</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {colleges.map((c) => (
                    <tr key={c.id} className="group transition-colors hover:bg-gold/[0.06]">
                      <td className="px-5 py-4 min-w-[14rem]">
                        <Link href={`/medical/college/${c.id}`} className="inline-flex items-center gap-1.5 font-semibold text-ink group-hover:text-gold-deep transition-colors">
                          {c.name}
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-0 -translate-x-1 transition-[opacity,transform] duration-300 group-hover:opacity-100 group-hover:translate-x-0" aria-hidden />
                        </Link>
                        <span className="block text-micro font-normal tracking-normal text-text-muted mt-0.5">{c.city}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-micro font-semibold ${TYPE_TONE[c.type] ?? "bg-paper-dim text-text-muted"}`}>{c.type}</span>
                      </td>
                      <td className="px-5 py-4 text-right tabular-nums">{c.mbbsSeats}</td>
                      <td className="px-5 py-4 text-right tabular-nums font-semibold text-ink">{formatRank(c.aiqClose)}</td>
                      <td className="px-5 py-4 text-right tabular-nums whitespace-nowrap">{formatCurrencyShort(c.feeMin)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-micro font-normal tracking-normal text-text-muted">
              Sorted by {meta.cutoffYear} All India Round 1 closing rank for General seats; private colleges usually fill through state counselling and show &quot;—&quot;. Fees are official yearly MBBS fees.
            </p>
          </section>
        </div>
      </main>
      <CTABand source={`state_${state.code.toLowerCase()}`} headline={`Planning for ${state.name}? Talk to a counsellor.`} compact />
      <SiteFooter />
    </>
  );
}
