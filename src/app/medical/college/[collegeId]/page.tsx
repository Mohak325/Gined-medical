import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronRight, Globe, MapPin } from "lucide-react";
import { getCourses, getCutoffs } from "@/lib/medical/api";
import { collegeSummary, similarColleges } from "@/lib/medical/collegeSummary";
import { chanceOptions, mbbsCutoffTables } from "@/lib/medical/collegeCutoffs";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/site";
import { stateByCode } from "@/lib/medical/states";
import CollegeCover from "@/components/medical/shared/CollegeCover";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import SaveToShortlistButton from "@/components/medical/shared/SaveToShortlistButton";
import CollegeFeesBreakdown from "@/components/medical/college/CollegeFeesBreakdown";
import CollegeBranchesMatrix from "@/components/medical/college/CollegeBranchesMatrix";
import CutoffTables from "@/components/medical/college/CutoffTables";
import ChancesHere from "@/components/medical/college/ChancesHere";
import SectionNav from "@/components/medical/college/SectionNav";
import SplitWords from "@/components/motion/SplitWords";
import CountUp from "@/components/motion/CountUp";

type Params = { params: Promise<{ collegeId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const college = collegeSummary((await params).collegeId);
  if (!college) return {};
  const close = college.aiqClose ? ` ${meta.cutoffYear} All India Round 1 closing rank ${formatRank(college.aiqClose)}.` : "";
  return {
    alternates: { canonical: `/medical/college/${college.id}` },
    title: `${college.name} — cutoffs, seats and fees | gined.in`,
    description: `${college.type} medical college in ${college.city}, ${college.state}. ${college.mbbsSeats ? `${college.mbbsSeats} MBBS seats.` : ""}${close}`,
  };
}

function Fact({ label, value, note }: { label: string; value: ReactNode; note?: string }) {
  return (
    <div className="flex flex-col-reverse justify-end gap-1.5 p-5 md:p-6 bg-ink-deep/30">
      <dt className="text-small text-text-on-dark/75">
        {label}
        {note && <span className="block text-micro font-normal tracking-normal text-text-on-dark/60 mt-0.5">{note}</span>}
      </dt>
      <dd className="font-[family-name:var(--font-instrument)] text-[2.25rem] md:text-[2.75rem] leading-none tabular-nums text-text-on-dark">{value}</dd>
    </div>
  );
}

/** A numbered section with a serif heading that slides up, and an anchor that clears the sticky bars. */
function Section({ id, n, title, children }: { id: string; n: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} data-section={id}>
      <span id={id} aria-hidden className="block relative -top-20" />
      <p className="text-eyebrow text-gold-deep mb-3 flex items-center gap-3" data-reveal="fade">
        <span className="tabular-nums">{n}</span>
        <span aria-hidden className="h-px w-8 bg-gold" />
      </p>
      <SplitWords id={`${id}-heading`} text={title} className="font-[family-name:var(--font-instrument)] text-[2.5rem] md:text-[3.25rem] leading-[1.02] text-ink mb-8" />
      <div data-reveal="up">{children}</div>
    </section>
  );
}

export default async function CollegeDetailPage({ params }: Params) {
  const { collegeId } = await params;
  const college = collegeSummary(collegeId);
  if (!college) notFound();

  const [courses, cutoffs] = await Promise.all([getCourses({ collegeId }), getCutoffs({ collegeId })]);
  const tables = mbbsCutoffTables(cutoffs);
  const options = chanceOptions(tables);
  const similar = similarColleges(collegeId);
  const fee = college.feeMin ? (college.feeMin === college.feeMax ? formatCurrencyShort(college.feeMin) : `${formatCurrencyShort(college.feeMin)}–${formatCurrencyShort(college.feeMax)}`) : "Not published";

  const pageUrl = `${SITE_URL}/medical/college/${college.id}`;
  const statePage = stateByCode(college.stateCode);
  const sections = [
    { id: "cutoffs", label: "Closing ranks" },
    { id: "seats", label: "Courses and seats" },
    { id: "fees", label: "Fees" },
    ...(similar.length > 0 ? [{ id: "similar", label: "Similar colleges" }] : []),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollegeOrUniversity",
              name: college.name,
              url: pageUrl,
              ...(college.website ? { sameAs: [college.website] } : {}),
              address: { "@type": "PostalAddress", addressLocality: college.city, addressRegion: college.state, addressCountry: "IN" },
              ...(college.established ? { foundingDate: String(college.established) } : {}),
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Colleges", item: `${SITE_URL}/medical/colleges` },
                ...(statePage ? [{ "@type": "ListItem", position: 2, name: college.state, item: `${SITE_URL}/medical/state/${statePage.slug}` }] : []),
                { "@type": "ListItem", position: statePage ? 3 : 2, name: college.name, item: pageUrl },
              ],
            },
          ],
        }}
      />
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        {/* Hero: the college's generated cover, never a photo we don't have the right to use */}
        <section className="relative bg-ink-deep text-text-on-dark overflow-hidden grain">
          <div aria-hidden className="absolute inset-0 overflow-hidden">
            <CollegeCover id={college.id} type={college.type} stateCode={college.stateCode} showLabel={false} className="parallax w-full h-full opacity-75" />
          </div>
          <div aria-hidden className="absolute inset-0 z-[1] bg-[linear-gradient(0deg,var(--ink-deep)_0%,rgba(8,26,36,0.82)_45%,rgba(8,26,36,0.45)_100%)]" />
          <div aria-hidden className="absolute -right-32 top-10 z-[1] w-[34rem] h-[34rem] rounded-full bg-gold/10 blur-[130px]" />

          <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16">
            <nav aria-label="Breadcrumb" className="intro-fade flex items-center gap-1.5 text-small text-text-on-dark/70">
              <Link href="/medical/colleges" className="hover:text-text-on-dark transition-colors">Colleges</Link>
              <ChevronRight className="w-3.5 h-3.5 text-gold" aria-hidden />
              <Link href={statePage ? `/medical/state/${statePage.slug}` : `/medical/colleges?state=${college.stateCode}`} className="hover:text-text-on-dark transition-colors">
                {college.state}
              </Link>
            </nav>
            <SplitWords as="h1" intro delay={100} text={college.name} className="text-display mt-5 max-w-5xl" />
            <p className="intro mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-small text-text-on-dark/80" style={{ "--delay": "300ms" } as CSSProperties}>
              <span className="inline-flex items-center gap-1.5 mr-1">
                <MapPin className="w-4 h-4 text-gold" aria-hidden />
                {college.city}, {college.state}
              </span>
              <span className="rounded-full surface-ink-glass px-3 py-1">{college.type}</span>
              {college.nmcStatus && <span className="rounded-full surface-ink-glass px-3 py-1">NMC: {college.nmcStatus}</span>}
              {college.university && <span className="rounded-full surface-ink-glass px-3 py-1">{college.university}</span>}
            </p>

            <dl className="intro-scale mt-10 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-px rounded-[24px] overflow-hidden surface-ink-glass" style={{ "--delay": "400ms" } as CSSProperties}>
              <Fact label="MBBS seats" value={college.mbbsSeats ? <CountUp value={college.mbbsSeats} /> : "—"} note={meta.seatYear} />
              <Fact label="All India close, General" value={college.aiqClose ? <CountUp value={college.aiqClose} /> : "—"} note={`${meta.cutoffYear} Round 1`} />
              <Fact label="Yearly fee" value={fee} note={college.feeMin ? "Official, by seat type" : undefined} />
              <Fact label="Established" value={college.established ? String(college.established) : "—"} />
            </dl>
          </div>
        </section>

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28 grid gap-12 lg:gap-14 lg:grid-cols-12">
          <div className="lg:col-span-8 min-w-0">
            <SectionNav sections={sections} />
            <div className="space-y-20 md:space-y-24">
              <Section id="cutoffs" n="01" title="MBBS closing ranks">
                <CutoffTables tables={tables} />
              </Section>

              <Section id="seats" n="02" title="Courses and seats">
                <CollegeBranchesMatrix courses={courses} cutoffs={cutoffs} />
              </Section>

              <Section id="fees" n="03" title="Fees">
                <CollegeFeesBreakdown courses={courses} />
              </Section>

              {similar.length > 0 && (
                <Section id="similar" n="04" title="Similar colleges">
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {similar.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/medical/college/${c.id}`}
                          data-spotlight=""
                          className="group flex gap-4 rounded-[24px] surface-premium p-3 pr-5 transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
                        >
                          <span className="relative w-24 h-24 shrink-0 rounded-[18px] overflow-hidden">
                            <span className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110">
                              <CollegeCover id={c.id} type={c.type} stateCode={c.stateCode} showLabel={false} className="w-full h-full" />
                            </span>
                          </span>
                          <span className="min-w-0 py-1 flex flex-col">
                            <span className="font-[family-name:var(--font-instrument)] text-[1.25rem] leading-[1.15] text-ink group-hover:text-gold-deep transition-colors line-clamp-2">{c.name}</span>
                            <span className="block text-micro font-normal tracking-normal text-text-muted mt-1.5">
                              {c.type} · {c.state}
                            </span>
                            {c.aiqClose ? (
                              <span className="mt-auto pt-2 text-small text-text-muted">
                                AIQ close <span className="font-semibold text-ink tabular-nums">{formatRank(c.aiqClose)}</span>
                              </span>
                            ) : null}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-5">
              <ChancesHere collegeName={college.name} options={options} />
              <div data-reveal="up" style={{ "--delay": "120ms" } as CSSProperties} className="rounded-[28px] surface-premium p-6 md:p-7 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-small font-semibold text-ink">Add to your shortlist</span>
                  <SaveToShortlistButton entry={{ id: college.id, name: college.name, closing: college.aiqClose, basis: college.aiqClose ? `All India General · ${meta.cutoffYear} R1` : undefined }} />
                </div>
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-hairline">
                  <span className="text-small font-semibold text-ink">Compare with others</span>
                  <AddToCompareButton collegeId={college.id} collegeName={college.name} />
                </div>
                {college.website && (
                  <a
                    href={college.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2 pt-4 border-t border-hairline text-small font-semibold text-ink hover:text-gold-deep transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Globe className="w-4 h-4 text-text-muted" aria-hidden /> Official website
                    </span>
                    <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <CTABand source="college_detail" headline="Is this college right for your list?" compact />
      <SiteFooter />
    </>
  );
}
