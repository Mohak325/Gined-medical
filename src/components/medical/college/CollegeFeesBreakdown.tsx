import Link from "next/link";
import { formatCurrency } from "@/lib/medical/format";
import { type CollegeCourse, type OfficialFee } from "@/lib/medical/mockData";
import { FileCheck2, MessageCircle, ArrowRight } from "lucide-react";

const SEAT_LABELS: Record<OfficialFee["seatType"], string> = {
  government: "Government quota seat",
  private: "Private seat",
  management: "Management quota seat",
  nri: "NRI seat",
};
const SEAT_ORDER: OfficialFee["seatType"][] = ["government", "private", "management", "nri"];

/** Sends students to a counsellor for whatever the site has no official figure for. */
function AskCounsellor({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-gold/10 border border-gold/30 rounded-[var(--radius-md)] p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div className="flex items-start gap-3">
        <MessageCircle className="w-5 h-5 text-gold-deep shrink-0 mt-0.5" />
        <div>
          <h3 className="text-body font-semibold text-text-main">{title}</h3>
          <p className="text-small text-text-muted">{body}</p>
        </div>
      </div>
      <Link
        href="/medical/book?source=college-fees"
        className="inline-flex items-center justify-center gap-2 shrink-0 bg-ink text-text-on-dark hover:bg-ink/90 font-semibold text-small px-5 py-3 rounded-[var(--radius-sm)] transition-colors"
      >
        Ask our counselling experts <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function CollegeFeesBreakdown({ courses }: { courses: CollegeCourse[] }) {
  if (courses.length === 0) return null;

  const official = courses
    .flatMap((c) => c.officialFees ?? [])
    .sort((a, b) => a.course.localeCompare(b.course) || SEAT_ORDER.indexOf(a.seatType) - SEAT_ORDER.indexOf(b.seatType));
  const sources = [...new Map(official.map((fee) => [fee.source, fee])).values()];

  if (official.length === 0) {
    return (
      <AskCounsellor
        title="Fee not yet published"
        body="We only show fees from official documents, and none has been published for this college yet. Our counselling experts can tell you the current fee, the service bond and any extra charges."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-paper border border-hairline rounded-[var(--radius-md)] p-6">
        <h3 className="text-h4 text-text-main mb-1 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-safe" /> Published Annual Fees
        </h3>
        <p className="text-small text-text-muted mb-4">
          Per year, as published in{" "}
          {sources.map((fee, index) => (
            <span key={fee.source}>
              {index > 0 && "; "}
              {fee.sourceUrl ? (
                <a href={fee.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gold-deep">{fee.source}</a>
              ) : (
                `${fee.source}, ${fee.year}`
              )}
            </span>
          ))}
          . The fee depends on the seat you get. Hostel, exam and other charges may be extra.
        </p>
        <div className="divide-y divide-hairline">
          {official.map((fee) => (
            <div key={`${fee.course}-${fee.seatType}`} className="flex items-baseline justify-between gap-4 py-3">
              <span className="text-small text-text-main">
                {fee.course} · {SEAT_LABELS[fee.seatType]}
              </span>
              <span className="text-body font-semibold text-text-main tabular-nums">{formatCurrency(fee.annualFee)}</span>
            </div>
          ))}
        </div>
      </div>
      <AskCounsellor
        title="Service bond and other charges"
        body="Bond terms, hostel and other charges vary by college and seat. Our counselling experts can confirm them for this college."
      />
    </div>
  );
}
