import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import PageHero from "@/components/medical/shared/PageHero";
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
      <main className="bg-paper min-h-screen print:bg-white">
        <PageHero
          photo="anatomyDrawing"
          eyebrow="Shortlist"
          title="Your choice"
          accent="list."
          description="Put the colleges you want most at the top. During choice filling you're offered the highest one your rank reaches."
          className="print:hidden"
        />
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28 print:p-0">
          <h1 className="hidden print:block text-display text-ink mb-4">Your choice list</h1>
          <ShortlistClient />
        </div>
      </main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </>
  );
}
