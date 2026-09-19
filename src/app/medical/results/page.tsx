import { Suspense } from "react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import ChancesCalculatorForm from "@/components/medical/calculator/ChancesCalculatorForm";
import ResultsClient from "./ResultsClient";

/**
 * Chances Calculator & Results Page — Phase 6
 * PRD v2 §M4, Register C (Instrument)
 */
export default function ResultsPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-20 bg-paper min-h-screen">
        <div className="max-w-instrument mx-auto px-6 md:px-12">
          
          <header className="mb-10">
            <h1 className="text-h2 mb-2 text-text-main">
              Your College Options
            </h1>
            <p className="text-body text-text-muted">
              Based on historical data and your NEET rank.
            </p>
          </header>

          <Suspense fallback={<div className="h-40 animate-pulse bg-paper-bright rounded-[var(--radius-md)] border border-hairline mb-10" />}>
            <div className="mb-10">
              <ChancesCalculatorForm mode="results" />
            </div>
          </Suspense>

          <Suspense fallback={<div className="h-96 flex items-center justify-center">Analyzing options...</div>}>
            <ResultsClient />
          </Suspense>

        </div>
      </main>

      <CTABand source="results_bottom" compact />
      <SiteFooter />
    </>
  );
}
