import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import ShortlistClient from "./ShortlistClient";

export const metadata = {
  title: "Your shortlist — gined.in",
  description: "Your saved medical colleges in preference order, labelled for your NEET rank.",
  robots: { index: false },
};

export default function ShortlistPage() {
  return (
    <>
      <div className="print:hidden">
        <SiteNavbar />
      </div>
      <main className="pt-24 md:pt-32 pb-16 bg-paper min-h-screen print:pt-0 print:bg-white">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <header className="mb-8 max-w-3xl">
            <p className="text-eyebrow text-gold-deep mb-4 print:hidden">Shortlist</p>
            <h1 className="text-display text-ink">Your choice list.</h1>
            <p className="text-body-large text-text-muted mt-4 print:hidden">
              Put the colleges you want most at the top. During choice filling you&apos;re offered the highest one your rank reaches.
            </p>
          </header>
          <ShortlistClient />
        </div>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}
