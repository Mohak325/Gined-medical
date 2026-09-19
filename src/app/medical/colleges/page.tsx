import { Suspense } from "react";
import DirectoryClient from "./DirectoryClient";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";

/**
 * All Colleges Directory — Phase 4
 * PRD v2 §M2, Register C (Ledger)
 */
export default function CollegesPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-20 bg-paper min-h-screen">
        <div className="max-w-ledger mx-auto px-6 md:px-12">
          
          <header className="mb-10">
            <h1 className="text-display mb-4 text-text-main">
              All Medical Colleges
            </h1>
            <p className="text-body-large text-text-muted max-w-prose">
              Browse, filter, and compare every NMC-recognised medical college in India.
              Detailed fee structures, seat matrices, and historical cutoff trends.
            </p>
          </header>

          <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading directory...</div>}>
            <DirectoryClient />
          </Suspense>

        </div>
      </main>

      <CTABand source="directory_bottom" compact />
      <SiteFooter />
    </>
  );
}
