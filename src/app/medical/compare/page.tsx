import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import PageHero from "@/components/medical/shared/PageHero";
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
      <main className="bg-paper min-h-screen">
        <PageHero
          photo="brainModel"
          eyebrow="Compare"
          title="Up to four colleges,"
          accent="side by side."
          description="Add colleges from the directory, a college page or your finder results. The link to this page keeps your selection, so you can share it."
        />
        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-10 md:pt-14 pb-20 md:pb-28">
          <CompareClient colleges={colleges} />
        </div>
      </main>
      <CTABand source="compare_bottom" headline="Torn between these colleges? Talk it through." compact />
      <SiteFooter />
    </>
  );
}
