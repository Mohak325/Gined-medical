import { Suspense } from "react";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import { collegeSummaries } from "@/lib/medical/collegeSummary";
import DirectoryClient from "./DirectoryClient";

export const metadata = {
  title: "All medical colleges in India — gined.in",
  description: `Search ${meta.collegeCount} medical colleges by state, type and yearly fee, with ${meta.cutoffYear} All India closing ranks and official fees.`,
};

export default function CollegesPage() {
  // Filtering happens in the browser on this compact list, so every filter change is instant.
  const colleges = collegeSummaries();

  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-32 pb-16 bg-paper min-h-screen">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <header className="mb-10 max-w-3xl">
            <p className="text-eyebrow text-gold-deep mb-4">Colleges directory</p>
            <h1 className="text-display text-ink">Every medical college, side by side.</h1>
            <p className="text-body-large text-text-muted mt-4">
              Filter {meta.collegeCount} colleges by state, type and yearly fee. See {meta.cutoffYear} All India closing ranks and fees from official
              documents, where they&apos;re published.
            </p>
          </header>
          <Suspense fallback={<div className="h-96 rounded-[var(--radius-lg)] bg-paper-bright animate-pulse" />}>
            <DirectoryClient colleges={colleges} />
          </Suspense>
        </div>
      </main>
      <CTABand source="directory_bottom" compact />
      <SiteFooter />
    </>
  );
}
