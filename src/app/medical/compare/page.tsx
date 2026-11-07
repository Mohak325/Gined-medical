import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import { collegeSummary, type CollegeSummary } from "@/lib/medical/collegeSummary";
import { CompareQuerySchema } from "@/lib/medical/schemas";
import CompareClient from "./CompareClient";

export const metadata = {
  title: "Compare medical colleges — gined.in",
  description: "Compare up to four medical colleges side by side: closing ranks, seats, official fees and more.",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const raw = await searchParams;
  const parsed = CompareQuerySchema.safeParse({ ids: typeof raw.ids === "string" ? raw.ids : undefined });
  const ids = parsed.success ? parsed.data.ids : [];
  const colleges = ids.map((id) => collegeSummary(id)).filter((c): c is CollegeSummary => !!c);

  return (
    <>
      <SiteNavbar />
      <main className="pt-24 md:pt-32 pb-16 bg-paper min-h-screen">
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
          <header className="mb-10 max-w-3xl">
            <p className="text-eyebrow text-gold-deep mb-4">Compare</p>
            <h1 className="text-display text-ink">Up to four colleges, side by side.</h1>
            <p className="text-body-large text-text-muted mt-4">Add colleges from the directory, a college page or your finder results. The link to this page keeps your selection, so you can share it.</p>
          </header>
          <CompareClient colleges={colleges} />
        </div>
      </main>
      <CTABand source="compare_bottom" headline="Torn between these colleges? Talk it through." compact />
      <SiteFooter />
    </>
  );
}
