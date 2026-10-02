import { notFound } from "next/navigation";
import { getCollegeById, getCutoffs, getCourses } from "@/lib/medical/api";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import CollegeHeader from "@/components/medical/college/CollegeHeader";
import CollegeFeesBreakdown from "@/components/medical/college/CollegeFeesBreakdown";
import CutoffTrendChart from "@/components/medical/college/CutoffTrendChart";
import CollegeBranchesMatrix from "@/components/medical/college/CollegeBranchesMatrix";

/**
 * College Detail Page — Phase 5
 */
export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ collegeId: string }>;
}) {
  const { collegeId } = await params;
  const college = await getCollegeById(collegeId);

  if (!college) {
    notFound();
  }

  const courses = await getCourses({ collegeId });
  const cutoffs = await getCutoffs({ collegeId });

  return (
    <>
      <SiteNavbar variant="cinematic" />
      
      <main className="pb-20 bg-paper min-h-screen">
        <CollegeHeader college={college} />
        
        <div className="max-w-ledger mx-auto px-6 md:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-2 space-y-16">
            <section>
              <h2 className="text-h2 text-text-main mb-6">Branches & Seat Matrix</h2>
              <CollegeBranchesMatrix courses={courses} cutoffs={cutoffs} />
            </section>

            <section>
              <h2 className="text-h2 text-text-main mb-6">Fees & Bond Structure</h2>
              <CollegeFeesBreakdown courses={courses} />
            </section>

            <section>
              <h2 className="text-h2 text-text-main mb-6">Cutoff Trends</h2>
              {(() => {
                // Find the most represented quota and category for this college's cutoffs
                if (cutoffs.length === 0) {
                  return (
                    <div className="bg-paper border border-hairline rounded-[var(--radius-md)] p-8 text-center text-text-muted">
                      No historical cutoff data available for this institution in our database yet.
                    </div>
                  );
                }

                // Prefer AIQ General, but fallback to whatever has the most data points
                let bestQuota = "aiq";
                let bestCategory = "general";

                const hasAiqGen = cutoffs.some(c => c.quota === "aiq" && c.category === "general");
                
                if (!hasAiqGen) {
                  const counts: Record<string, number> = {};
                  cutoffs.forEach(c => {
                    const key = `${c.quota}_${c.category}`;
                    counts[key] = (counts[key] || 0) + 1;
                  });
                  
                  const bestKey = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
                  [bestQuota, bestCategory] = bestKey.split("_");
                }

                return (
                  <>
                    <CutoffTrendChart cutoffs={cutoffs} category={bestCategory} quota={bestQuota} />
                    <p className="text-small text-text-muted mt-4">
                      Note: This chart shows Round 1 {bestQuota.toUpperCase()} {bestCategory.toUpperCase()} category closing ranks. A lower rank number indicates higher competition.
                    </p>
                  </>
                );
              })()}
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="relative">
            <div className="sticky top-28 bg-paper-bright border border-hairline rounded-[var(--radius-md)] p-6 shadow-card">
              <h3 className="text-h3 text-text-main mb-2">Want to know your chances?</h3>
              <p className="text-small text-text-muted mb-6">
                Enter your NEET rank to see if you can realistically get a seat at {college.name}.
              </p>
              
              <a 
                href="/medical#calculator"
                className="block w-full text-center px-4 py-3 bg-gold text-ink font-semibold rounded-[var(--radius-sm)] hover:bg-gold/90 transition-colors"
              >
                Check My Chances
              </a>
              
              <hr className="my-6 border-hairline" />
              
              <h4 className="text-small font-semibold text-text-main mb-3">Compare</h4>
              <p className="text-micro text-text-muted mb-4">
                Add this college to compare it side-by-side with others.
              </p>
              {/* Note: This is an RSC, we can't use AddToCompareButton directly unless it's imported or we make this part a client component. Let's make a small client wrapper for the sidebar actions if needed, but since it's just a placeholder button for now, I'll use a link to the compare tray or leave it. */}
            </div>
          </aside>

        </div>
      </main>

      <CTABand source="college_detail" />
      <SiteFooter />
    </>
  );
}
