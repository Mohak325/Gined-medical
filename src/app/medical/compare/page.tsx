import { Suspense } from "react";
import CompareClient from "./CompareClient";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";

/**
 * Comparison Tool — Phase 8
 */
export default function ComparePage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-32 bg-paper min-h-screen">
        <div className="max-w-ledger mx-auto px-6 md:px-12">
          
          <header className="mb-10">
            <h1 className="text-display mb-4 text-text-main">
              Compare Colleges
            </h1>
            <p className="text-body-large text-text-muted max-w-prose">
              Side-by-side comparison of up to 3 medical colleges.
            </p>
          </header>

          <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading comparison...</div>}>
            <CompareClient />
          </Suspense>

        </div>
      </main>

      <SiteFooter />
    </>
  );
}
