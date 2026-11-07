import { collegeSummaries } from "@/lib/medical/collegeSummary";
import { stateBySlug } from "@/lib/medical/states";
import { OG_SIZE, ogCard } from "@/lib/ogImage";

export const alt = "MBBS colleges, seats and cutoffs by state on gined.in";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const state = stateBySlug((await params).slug);
  if (!state) return ogCard({ eyebrow: "MBBS by state", title: "MBBS colleges by state" });
  const colleges = collegeSummaries().filter((c) => c.stateCode === state.code && c.mbbsSeats > 0);
  return ogCard({
    eyebrow: "MBBS by state",
    title: `MBBS in ${state.name}`,
    stats: [
      { label: "Medical colleges", value: String(colleges.length) },
      { label: "MBBS seats", value: colleges.reduce((n, c) => n + c.mbbsSeats, 0).toLocaleString("en-IN") },
      { label: "Government and central", value: String(colleges.filter((c) => c.type === "Government" || c.type === "Central").length) },
    ],
  });
}
