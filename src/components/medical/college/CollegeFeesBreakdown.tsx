import { formatCurrency } from "@/lib/medical/format";
import { type CollegeCourse, type OfficialFee } from "@/lib/medical/mockData";
import { FileCheck2, MessageCircle } from "lucide-react";
import Cta from "@/components/ui/Cta";

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
    <div className="relative overflow-hidden rounded-[24px] bg-ink text-text-on-dark p-6 md:p-7 grain flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
      <div aria-hidden className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-gold/15 blur-3xl" />
      <div className="relative z-[2] flex items-start gap-4">
        <span className="w-10 h-10 shrink-0 rounded-full surface-ink-glass flex items-center justify-center" aria-hidden>
          <MessageCircle className="w-4 h-4 text-gold" />
        </span>
        <div>
          <h3 className="font-[family-name:var(--font-instrument)] text-[1.5rem] leading-tight">{title}</h3>
          <p className="text-small text-text-on-dark/75 mt-1">{body}</p>
        </div>
      </div>
      <Cta href="/medical/book?source=college-fees" variant="gold" className="relative z-[2] shrink-0">
        Ask our counselling experts
      </Cta>
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
    <div className="space-y-5">
      <div className="rounded-[24px] surface-premium p-6 md:p-7">
        <h3 className="flex items-center gap-2 text-eyebrow text-[var(--safe-ink)]">
          <FileCheck2 className="w-4 h-4" aria-hidden /> Published annual fees
        </h3>
        <p className="text-small text-text-muted mt-3 mb-5">
          Per year, as published in{" "}
          {sources.map((fee, index) => (
            <span key={fee.source}>
              {index > 0 && "; "}
              {fee.sourceUrl ? (
                <a href={fee.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gold-deep">
                  {fee.source}
                </a>
              ) : (
                `${fee.source}, ${fee.year}`
              )}
            </span>
          ))}
          . The fee depends on the seat you get. Hostel, exam and other charges may be extra.
        </p>
        <ul className="divide-y divide-hairline border-t border-hairline">
          {official.map((fee) => (
            <li key={`${fee.course}-${fee.seatType}`} className="flex items-baseline justify-between gap-4 py-4">
              <span className="text-small text-ink">
                {fee.course}
                <span className="block text-micro font-normal tracking-normal text-text-muted mt-0.5">{SEAT_LABELS[fee.seatType]}</span>
              </span>
              <span className="font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none text-ink tabular-nums">{formatCurrency(fee.annualFee)}</span>
            </li>
          ))}
        </ul>
      </div>
      <AskCounsellor
        title="Service bond and other charges"
        body="Bond terms, hostel and other charges vary by college and seat. Our counselling experts can confirm them for this college."
      />
    </div>
  );
}
