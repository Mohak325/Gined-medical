import meta from "@/data/meta.json";
import { OG_SIZE, ogCard } from "@/lib/ogImage";

export const alt = "gined.in — NEET medical counselling with official cutoffs";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "NEET counselling",
    title: "Know where your rank can take you.",
    stats: [
      { label: "MBBS colleges", value: meta.ugCollegeCount.toLocaleString("en-IN") },
      { label: `UG seats, ${meta.seatYear}`, value: meta.ugSeats.toLocaleString("en-IN") },
      { label: `Colleges with ${meta.cutoffYear} cutoffs`, value: meta.ugCollegesWithCutoffs.toLocaleString("en-IN") },
    ],
  });
}
