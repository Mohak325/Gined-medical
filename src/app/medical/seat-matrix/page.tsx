import { Suspense } from "react";
import meta from "@/data/meta.json";
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
      <SiteNavbar />
      
      <main className="pt-24 md:pt-32 pb-16 bg-paper min-h-screen">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <header className="mb-10 max-w-3xl">
            <p className="text-eyebrow text-gold-deep mb-4">Seat matrix</p>
            <h1 className="text-display text-ink">Where the {meta.seatYear} seats are.</h1>
            <p className="text-body-large text-text-muted mt-4">
              Seats by college, course and quota. Filters stay in the page address, so you can share exactly what you&apos;re looking at.
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
