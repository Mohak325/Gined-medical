import { Suspense } from "react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import BookingForm from "./BookingForm";

export default function BookPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-32 bg-paper-bright min-h-screen">
        <div className="max-w-xl mx-auto px-6">
          <Suspense fallback={<div className="h-96 flex items-center justify-center animate-pulse bg-paper rounded-[var(--radius-lg)] border border-hairline" />}>
            <BookingForm />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
