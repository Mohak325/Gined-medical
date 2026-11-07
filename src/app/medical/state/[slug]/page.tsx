import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Landmark } from "lucide-react";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
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

const range = (values: number[], format: (n: number) => string) => {
  if (values.length === 0) return "—";
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  return lo === hi ? format(lo) : `${format(lo)}–${format(hi)}`;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <dt className="text-small text-text-muted">{label}</dt>
      <dd className="text-h1 text-ink tabular-nums">{value}</dd>
    </div>
  );
}

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
      <main className="pt-24 md:pt-32 pb-16 bg-paper min-h-screen">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <nav aria-label="Breadcrumb" className="text-small text-text-muted mb-4">
            <Link href="/medical/guide" className="hover:text-ink">Counselling guide</Link> <span aria-hidden>/</span> {state.name}
          </nav>
          <header className="max-w-3xl">
            <p className="text-eyebrow text-gold-deep mb-4">MBBS in {state.name}</p>
            <h1 className="text-display text-ink">{colleges.length} medical colleges, {seats.toLocaleString("en-IN")} MBBS seats.</h1>
          </header>

          <dl className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-6 border-y border-hairline py-8">
            <Stat label="Government and central colleges" value={String(government.length)} />
            <Stat label="Private and deemed colleges" value={String(others.length)} />
            <Stat label={`All India close, General (${meta.cutoffYear} R1)`} value={range(colleges.flatMap((c) => (c.aiqClose ? [c.aiqClose] : [])), formatRank)} />
            <Stat label="Government quota fee a year" value={range(colleges.flatMap((c) => (c.feeGovt ? [c.feeGovt] : [])), formatCurrencyShort)} />
          </dl>

          <div className="mt-12 grid gap-10 lg:grid-cols-12">
            <section className="lg:col-span-4 space-y-4" aria-labelledby="counselling-heading">
              <h2 id="counselling-heading" className="text-h1 text-ink">How seats are filled</h2>
              <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 space-y-4 text-small text-text-muted">
                <p>
                  <strong className="text-ink">All India Quota:</strong> 15% of government college seats, counselled by MCC for students from any state.
                  Deemed and central university seats are also counselled by MCC.
                </p>
                <p>
                  <strong className="text-ink">State quota:</strong> the remaining government seats, and most private college seats, are counselled by{" "}
                  {authority ? <span className="text-ink">{authority}</span> : `${state.name}'s own counselling authority`}. Eligibility usually depends on domicile.
                </p>
                <p className="flex items-start gap-2">
                  <Landmark className="w-4 h-4 mt-0.5 text-gold-deep shrink-0" aria-hidden />
                  {covered
                    ? `We hold ${state.name}'s own ${meta.cutoffYear} state quota closing ranks, so the College Finder can check your state quota chances.`
                    : `We don't hold ${state.name}'s state quota closing ranks yet. A counsellor can tell you how it filled.`}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                {covered && (
                  <Link href={`/medical#finder`} className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full bg-ink text-text-on-dark text-small font-semibold hover:bg-ink-soft">
                    Check my {state.name} chances <ArrowUpRight className="w-4 h-4 text-gold" aria-hidden />
                  </Link>
                )}
                <Link href={`/medical/book?source=state-${state.code.toLowerCase()}&state=${state.code}`} className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-border-strong text-small font-semibold text-ink hover:bg-ink/[0.04]">
                  Ask about {state.name} counselling
                </Link>
              </div>
            </section>

            <section className="lg:col-span-8 min-w-0" aria-labelledby="colleges-heading">
              <h2 id="colleges-heading" className="text-h1 text-ink mb-4">Colleges</h2>
              <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright overflow-x-auto">
                <table className="w-full text-small">
                  <thead className="text-left text-text-muted border-b border-hairline">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">College</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Type</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">Seats</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">AIQ close</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-right">Fee from</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {colleges.map((c) => (
                      <tr key={c.id} className="hover:bg-paper">
                        <td className="px-4 py-3 min-w-[14rem]">
                          <Link href={`/medical/college/${c.id}`} className="font-semibold text-ink hover:text-gold-deep">{c.name}</Link>
                          <span className="block text-micro font-normal tracking-normal text-text-muted">{c.city}</span>
                        </td>
                        <td className="px-4 py-3 text-text-muted">{c.type}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{c.mbbsSeats}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatRank(c.aiqClose)}</td>
                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{formatCurrencyShort(c.feeMin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-micro font-normal tracking-normal text-text-muted">
                Sorted by {meta.cutoffYear} All India Round 1 closing rank for General seats; private colleges usually fill through state counselling and show &quot;—&quot;. Fees are official yearly MBBS fees.
              </p>
            </section>
          </div>
        </div>
      </main>
      <CTABand source={`state_${state.code.toLowerCase()}`} headline={`Planning for ${state.name}? Talk to a counsellor.`} compact />
      <SiteFooter />
    </>
  );
}
