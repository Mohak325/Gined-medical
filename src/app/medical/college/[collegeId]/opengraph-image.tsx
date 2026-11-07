import meta from "@/data/meta.json";
import { collegeSummary } from "@/lib/medical/collegeSummary";
import { formatCurrencyShort, formatRank } from "@/lib/medical/format";
import { OG_SIZE, ogCard } from "@/lib/ogImage";

export const alt = "College cutoffs, seats and fees on gined.in";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ collegeId: string }> }) {
  const college = collegeSummary((await params).collegeId);
  if (!college) return ogCard({ eyebrow: "Medical college", title: "Medical college cutoffs, seats and fees" });
  return ogCard({
    eyebrow: `${college.type} · ${college.state}`,
    title: college.name,
    stats: [
      ...(college.mbbsSeats ? [{ label: "MBBS seats", value: String(college.mbbsSeats) }] : []),
      ...(college.aiqClose ? [{ label: `AIQ close, ${meta.cutoffYear} R1`, value: formatRank(college.aiqClose) }] : []),
      ...(college.feeMin ? [{ label: "Yearly fee from", value: formatCurrencyShort(college.feeMin) }] : []),
    ],
  });
}
