import { Suspense } from "react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import ChancesCalculatorForm from "@/components/medical/calculator/ChancesCalculatorForm";
import ResultsClient from "./ResultsClient";

export const metadata = {
  title: "Your college options — gined.in College Finder",
  description: "MBBS colleges your NEET rank can reach, labelled Safe, Moderate or Ambitious from official closing ranks.",
};

export default function ResultsPage() {
  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-28 pb-16 bg-paper min-h-screen">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <header className="mb-6">
            <p className="text-eyebrow text-gold-deep mb-3">College Finder</p>
            <h1 className="text-h1 text-ink">Your college options</h1>
          </header>

          <Suspense fallback={<div className="h-28 animate-pulse bg-paper-bright rounded-[var(--radius-md)] border border-hairline mb-8" />}>
            <div className="mb-8">
              <ChancesCalculatorForm mode="results" />
            </div>
          </Suspense>

          <Suspense fallback={<div className="h-96 rounded-[var(--radius-lg)] bg-paper-bright animate-pulse" />}>
            <ResultsClient />
          </Suspense>
        </div>
      </main>
      <CTABand source="results_bottom" compact />
      <SiteFooter />
    </>
  );
}
