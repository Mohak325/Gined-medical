import { X, Video, Phone, MapPin } from "lucide-react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import PackageCards, { packages, PRICES_INDICATIVE } from "@/components/medical/home/PackageCards";

export const metadata = {
  title: "Counselling packages and pricing — gined.in",
  description: "NEET counselling packages: college shortlists, choice-filling strategy and round-by-round support with a 1-to-1 counsellor.",
};

const MODE_ICONS: Record<string, typeof Video> = { "Video Call": Video, Phone: Phone };

// Matches what the booking confirmation tells students.
const nextSteps = [
  { title: "Send a request", body: "Pick a package and leave your details. It takes about two minutes." },
  { title: "We get in touch", body: "Our counselling team contacts you to schedule your first session." },
  { title: "Plan with your counsellor", body: "Go through your rank, options and choice list together, session by session." },
];

export default function PricingPage() {
  return (
    <>
      <SiteNavbar />
      <main className="bg-paper">
        <section className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-28 md:pt-36 pb-12">
          <p className="text-eyebrow text-gold-deep mb-4">Packages and pricing</p>
          <h1 className="text-display-xl text-ink max-w-3xl">Pick the support your counselling needs.</h1>
          <p className="text-body-large text-text-muted mt-6 max-w-2xl">
            Every package starts from your rank and official cutoffs, and gives you a personalised college shortlist. The bigger packages stay with you
            through choice filling and every round.
          </p>
        </section>

        <section className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pb-16" aria-label="Packages">
          <PackageCards source="pricing" />
          {PRICES_INDICATIVE && <p className="mt-6 text-small text-text-muted">Prices shown are indicative while packages are being finalised.</p>}
        </section>

        <section className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pb-20" aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-h1 text-ink mb-8">How the packages differ</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="rounded-[var(--radius-lg)] border border-hairline bg-paper-bright p-6 md:p-7">
                <h3 className="text-h3 text-ink">{pkg.name}</h3>
                <h4 className="text-eyebrow text-text-muted mt-6 mb-3">Sessions by</h4>
                <ul className="flex flex-wrap gap-2">
                  {pkg.delivery_modes.map((mode) => {
                    const Icon = MODE_ICONS[mode] ?? MapPin;
                    return (
                      <li key={mode} className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-small text-text-main">
                        <Icon className="w-3.5 h-3.5 text-gold-deep" aria-hidden />
                        {mode}
                      </li>
                    );
                  })}
                </ul>
                <h4 className="text-eyebrow text-text-muted mt-6 mb-3">Not included</h4>
                {pkg.exclusions.length > 0 ? (
                  <ul className="space-y-2.5">
                    {pkg.exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-small text-text-muted">
                        <X className="w-4 h-4 mt-0.5 shrink-0" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-small text-text-muted">Everything in the other packages is included.</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-paper-bright border-y border-hairline" aria-labelledby="next-heading">
          <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 py-20 grid gap-10 lg:grid-cols-12">
            <h2 id="next-heading" className="text-display text-ink lg:col-span-4">What happens after you book.</h2>
            <ol className="lg:col-span-8 grid gap-4 sm:grid-cols-3">
              {nextSteps.map((step, i) => (
                <li key={step.title} className="rounded-[var(--radius-lg)] border border-hairline bg-paper p-6">
                  <span className="w-8 h-8 rounded-full bg-ink text-gold flex items-center justify-center text-small font-semibold tabular-nums">{i + 1}</span>
                  <h3 className="text-h4 text-ink mt-6">{step.title}</h3>
                  <p className="text-small text-text-muted mt-2">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <CTABand source="pricing_bottom" headline="Not sure which package fits? Talk it through first." compact />
      </main>
      <SiteFooter />
    </>
  );
}
