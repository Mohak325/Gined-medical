import { Suspense } from "react";
import SeatMatrixClient from "./SeatMatrixClient";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";

/**
 * Seat Matrix Explorer — Phase 7
 */
export default function SeatMatrixPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-20 bg-paper min-h-screen">
        <div className="max-w-ledger mx-auto px-6 md:px-12">
          
          <header className="mb-10">
            <h1 className="text-display mb-4 text-text-main">
              Seat Matrix Explorer
            </h1>
            <p className="text-body-large text-text-muted max-w-prose">
              View exact seat allocations for every quota and category across all colleges.
            </p>
          </header>

          <Suspense fallback={<div className="h-96 flex items-center justify-center">Loading seat matrix...</div>}>
            <SeatMatrixClient />
          </Suspense>

        </div>
      </main>

      <CTABand source="seat_matrix_bottom" compact />
      <SiteFooter />
    </>
  );
}
