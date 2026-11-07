import type { MetadataRoute } from "next";
import { collegeSummaries } from "@/lib/medical/collegeSummary";
import { STATE_PAGES } from "@/lib/medical/states";
import { SITE_URL } from "@/lib/site";

/** Every public page: the main pages, each state with MBBS seats, and every college. */
export default function sitemap(): MetadataRoute.Sitemap {
  const colleges = collegeSummaries();
  const statesWithSeats = new Set(colleges.filter((c) => c.mbbsSeats > 0).map((c) => c.stateCode));
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({
    url: `${SITE_URL}${path}`,
    changeFrequency,
    priority,
  });

  return [
    page("/medical", 1, "weekly"),
    page("/medical/colleges", 0.9, "weekly"),
    page("/medical/guide", 0.8),
    page("/medical/pricing", 0.8),
    page("/medical/seat-matrix", 0.6),
    page("/medical/compare", 0.4),
    page("/medical/book", 0.7),
    ...STATE_PAGES.filter((s) => statesWithSeats.has(s.code)).map((s) => page(`/medical/state/${s.slug}`, 0.7)),
    ...colleges.map((c) => page(`/medical/college/${c.id}`, 0.6)),
    page("/privacy", 0.2),
    page("/terms", 0.2),
  ];
}
