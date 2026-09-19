import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import testimonialsData from "@/content/testimonials.json";
import CTABand from "@/components/medical/shared/CTABand";

export default function SuccessStoriesPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-32 bg-paper min-h-screen">
        <div className="max-w-prose mx-auto px-6 md:px-12 text-center mb-16">
          <h1 className="text-display text-text-main mb-6">Success Stories</h1>
          <p className="text-body-large text-text-muted">
            See how data-backed counselling helped these students secure seats in top medical colleges.
          </p>
        </div>

        <div className="max-w-ledger mx-auto px-6 md:px-12 space-y-16">
          {testimonialsData.testimonials.map((t, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-8 items-center bg-paper-bright border border-hairline rounded-[var(--radius-lg)] p-8 md:p-12">
              <div className="w-48 h-48 rounded-full overflow-hidden shrink-0 border-4 border-paper shadow-card">
                <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-micro font-semibold text-gold uppercase tracking-widest">{t.track}</span>
                  <span className="text-micro text-text-muted px-2 py-0.5 bg-paper-dim rounded-[var(--radius-sm)]">
                    Rank {t.rank}
                  </span>
                </div>
                <blockquote className="text-h3 text-text-main font-medium italic mb-6">
                  "{t.quote}"
                </blockquote>
                <div>
                  <div className="font-semibold text-text-main">{t.name}</div>
                  <div className="text-small text-text-muted">Secured seat at <span className="font-medium">{t.college_name}</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <CTABand source="success_stories" />
      <SiteFooter />
    </>
  );
}
