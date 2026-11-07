import { Suspense } from "react";
import meta from "@/data/meta.json";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import PageHero from "@/components/medical/shared/PageHero";
import SeatMatrixClient from "./SeatMatrixClient";

export const metadata = {
  title: "MBBS seat matrix by college and quota — gined.in",
  description: "Every college's MBBS and PG seats by quota for the current counselling year, filterable by state and college type.",
};

export default function SeatMatrixPage() {
  return (
    <>
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        <PageHero
          photo="heartModel"
          eyebrow="Seat matrix"
          title={`Where the ${meta.seatYear}`}
          accent="seats are."
          description="Seats by college, course and quota. Filters stay in the page address, so you can share exactly what you're looking at."
          stats={[
            { value: meta.ugSeats, label: "MBBS seats" },
            { value: meta.ugCollegeCount, label: "Colleges offering MBBS" },
            { value: meta.pgCourses.length, label: "PG specialties" },
          ]}
        />
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
          <Suspense fallback={<div className="skeleton h-[40rem] rounded-[28px]" />}>
            <SeatMatrixClient />
          </Suspense>
        </div>
      </main>
      <CTABand source="seat_matrix_bottom" compact />
      <SiteFooter />
    </>
  );
}
