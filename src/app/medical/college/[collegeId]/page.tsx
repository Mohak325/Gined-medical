import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Globe, MapPin } from "lucide-react";
import { getCourses, getCutoffs } from "@/lib/medical/api";
import { collegeSummary, similarColleges } from "@/lib/medical/collegeSummary";
import { chanceOptions, mbbsCutoffTables } from "@/lib/medical/collegeCutoffs";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import CollegeCover from "@/components/medical/shared/CollegeCover";
import AddToCompareButton from "@/components/medical/shared/AddToCompareButton";
import SaveToShortlistButton from "@/components/medical/shared/SaveToShortlistButton";
import CollegeFeesBreakdown from "@/components/medical/college/CollegeFeesBreakdown";
import CollegeBranchesMatrix from "@/components/medical/college/CollegeBranchesMatrix";
import CutoffTables from "@/components/medical/college/CutoffTables";
import ChancesHere from "@/components/medical/college/ChancesHere";

type Params = { params: Promise<{ collegeId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const college = collegeSummary((await params).collegeId);
  if (!college) return {};
  const close = college.aiqClose ? ` ${meta.cutoffYear} All India Round 1 closing rank ${formatRank(college.aiqClose)}.` : "";
  return {
    title: `${college.name} — cutoffs, seats and fees | gined.in`,
    description: `${college.type} medical college in ${college.city}, ${college.state}. ${college.mbbsSeats ? `${college.mbbsSeats} MBBS seats.` : ""}${close}`,
  };
}

function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex flex-col-reverse justify-end">
      <dt className="text-small text-text-on-dark/60">{label}{note && <span className="block text-micro font-normal tracking-normal text-text-on-dark/45">{note}</span>}</dt>
      <dd className="text-h2 tabular-nums text-text-on-dark">{value}</dd>
    </div>
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

  return (
    <>
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        {/* Hero */}
        <section className="relative bg-ink text-text-on-dark overflow-hidden pt-16 md:pt-[72px]">
          <CollegeCover id={college.id} type={college.type} stateCode={college.stateCode} showLabel={false} className="absolute inset-0 w-full h-full opacity-70" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/40" />
          <div className="relative max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-12 md:pt-20 pb-10">
            <nav aria-label="Breadcrumb" className="text-small text-text-on-dark/60">
              <Link href="/medical/colleges" className="hover:text-text-on-dark">Colleges</Link>
              <span aria-hidden> / </span>
              <Link href={`/medical/colleges?state=${college.stateCode}`} className="hover:text-text-on-dark">{college.state}</Link>
            </nav>
            <h1 className="text-display mt-4 max-w-4xl">{college.name}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-small text-text-on-dark/75">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden />{college.city}, {college.state}</span>
              <span className="rounded-full border border-white/20 px-2.5 py-0.5">{college.type}</span>
              {college.nmcStatus && <span className="rounded-full border border-white/20 px-2.5 py-0.5">NMC: {college.nmcStatus}</span>}
              {college.university && <span>{college.university}</span>}
            </p>
            <dl className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6">
              <Fact label="MBBS seats" value={college.mbbsSeats ? String(college.mbbsSeats) : "—"} note={meta.seatYear} />
              <Fact label="All India close, General" value={college.aiqClose ? formatRank(college.aiqClose) : "—"} note={`${meta.cutoffYear} Round 1`} />
              <Fact label="Yearly fee" value={fee} note={college.feeMin ? "Official, by seat type" : undefined} />
              <Fact label="Established" value={college.established ? String(college.established) : "—"} />
            </dl>
          </div>
        </section>

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 py-12 md:py-16 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-14 min-w-0">
            <section aria-labelledby="cutoffs-heading">
              <h2 id="cutoffs-heading" className="text-h1 text-ink mb-6">MBBS closing ranks</h2>
              <CutoffTables tables={tables} />
            </section>

            <section aria-labelledby="seats-heading">
              <h2 id="seats-heading" className="text-h1 text-ink mb-6">Courses and seats</h2>
              <CollegeBranchesMatrix courses={courses} cutoffs={cutoffs} />
            </section>

            <section aria-labelledby="fees-heading">
              <h2 id="fees-heading" className="text-h1 text-ink mb-6">Fees</h2>
              <CollegeFeesBreakdown courses={courses} />
            </section>

            {similar.length > 0 && (
              <section aria-labelledby="similar-heading">
                <h2 id="similar-heading" className="text-h1 text-ink mb-6">Similar colleges</h2>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {similar.map((c) => (
                    <li key={c.id}>
                      <Link href={`/medical/college/${c.id}`} className="group flex gap-4 rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-3 hover:border-border-strong">
                        <CollegeCover id={c.id} type={c.type} stateCode={c.stateCode} showLabel={false} className="w-20 h-20 shrink-0 rounded-[var(--radius-md)]" />
                        <span className="min-w-0 py-1">
                          <span className="block text-small font-semibold text-ink group-hover:text-gold-deep line-clamp-2">{c.name}</span>
                          <span className="block text-micro font-normal tracking-normal text-text-muted mt-1">
                            {c.type} · {c.state}
                            {c.aiqClose ? ` · AIQ close ${formatRank(c.aiqClose)}` : ""}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 space-y-4">
              <ChancesHere collegeName={college.name} options={options} />
              <div className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-small font-semibold text-ink">Add to your shortlist</span>
                  <SaveToShortlistButton entry={{ id: college.id, name: college.name, closing: college.aiqClose, basis: college.aiqClose ? `All India General · ${meta.cutoffYear} R1` : undefined }} />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-small font-semibold text-ink">Compare with others</span>
                  <AddToCompareButton collegeId={college.id} collegeName={college.name} />
                </div>
                {college.website && (
                  <a href={college.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-small text-text-muted hover:text-ink">
                    <Globe className="w-4 h-4" aria-hidden /> Official website <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
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
