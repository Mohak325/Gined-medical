import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal or per-search pages with nothing for a search engine to index.
      disallow: ["/medical/results", "/medical/shortlist"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
