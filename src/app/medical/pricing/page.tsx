import type { CSSProperties } from "react";
import { X, Video, Phone, MapPin, Check } from "lucide-react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import CTABand from "@/components/medical/shared/CTABand";
import PageHero from "@/components/medical/shared/PageHero";
import SplitWords from "@/components/motion/SplitWords";
import PackageCards, { packages, PRICES_INDICATIVE, sessionsLabel } from "@/components/medical/home/PackageCards";

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
        <PageHero
          photo="hospitalCorridor"
          eyebrow="Packages and pricing"
          title="Pick the support your"
          accent="counselling needs."
          description="Every package starts from your rank and official cutoffs, and gives you a personalised college shortlist. The bigger packages stay with you through choice filling and every round."
          overlap
        />

        {/* The cards rise over the hero's lower edge */}
        <section className="relative z-[3] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 -mt-24 md:-mt-32 pb-20 md:pb-28" aria-labelledby="packages-heading">
          <h2 id="packages-heading" className="sr-only">Packages</h2>
          <PackageCards source="pricing" />
          {PRICES_INDICATIVE && (
            <p className="mt-8 flex items-center justify-center gap-2 text-small text-text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" aria-hidden />
              Prices shown are indicative while packages are being finalised.
            </p>
          )}
        </section>

        <section className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pb-24 md:pb-32" aria-labelledby="details-heading">
          <header className="grid gap-6 lg:grid-cols-12 lg:items-end mb-10 md:mb-12">
            <div className="lg:col-span-7">
              <p className="text-eyebrow text-gold-deep mb-4" data-reveal="fade">The fine print</p>
              <SplitWords id="details-heading" text="How the packages differ." className="text-display text-ink" />
            </div>
            <p className="lg:col-span-5 text-body-large text-text-muted" data-reveal="up">
              How you meet your counsellor, how often, and what each package leaves out.
            </p>
          </header>

          <div data-reveal="up" className="grid lg:grid-cols-3 rounded-[28px] surface-premium overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-hairline">
            {packages.map((pkg, i) => (
              <div key={pkg.id} className={`p-6 md:p-8 ${pkg.recommended ? "bg-gold/[0.06]" : ""}`} data-reveal="up" style={{ "--delay": `${i * 100}ms` } as CSSProperties}>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-instrument)] text-[2rem] leading-none text-ink">{pkg.name}</h3>
                  <span className="text-small text-text-muted tabular-nums">₹{pkg.price.toLocaleString("en-IN")}</span>
                </div>
                <p className="text-small text-text-muted mt-2">
                  {sessionsLabel(pkg.session_count)} · {pkg.duration_min} min each
                </p>

                <h4 className="text-eyebrow text-text-muted mt-8 mb-3">Sessions by</h4>
                <ul className="flex flex-wrap gap-2">
                  {pkg.delivery_modes.map((mode) => {
                    const Icon = MODE_ICONS[mode] ?? MapPin;
                    return (
                      <li key={mode} className="inline-flex items-center gap-1.5 rounded-full bg-paper-bright border border-hairline px-3 py-1.5 text-small text-ink shadow-[0_1px_2px_rgba(15,46,61,0.06)]">
                        <Icon className="w-3.5 h-3.5 text-gold-deep" aria-hidden />
                        {mode}
                      </li>
                    );
                  })}
                </ul>

                <h4 className="text-eyebrow text-text-muted mt-8 mb-3">Not included</h4>
                {pkg.exclusions.length > 0 ? (
                  <ul className="space-y-2.5">
                    {pkg.exclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-small text-text-muted">
                        <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-ink/[0.06] flex items-center justify-center" aria-hidden>
                          <X className="w-2.5 h-2.5" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="flex items-start gap-2.5 text-small text-ink">
                    <span className="mt-0.5 w-4 h-4 shrink-0 rounded-full bg-safe text-white flex items-center justify-center" aria-hidden>
                      <Check className="w-2.5 h-2.5" />
                    </span>
                    Everything in the other packages is included.
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="relative overflow-hidden bg-ink-deep text-text-on-dark grain" aria-labelledby="next-heading">
          <div aria-hidden className="absolute -left-40 top-0 w-[36rem] h-[36rem] rounded-full bg-gold/10 blur-[140px]" />
          <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 py-24 md:py-32 grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-eyebrow text-gold mb-4" data-reveal="fade">After you book</p>
              <SplitWords id="next-heading" text="What happens next." className="text-display" />
            </div>
            <ol className="lg:col-span-8 relative grid gap-4 sm:grid-cols-3" data-reveal="up">
              {/* A gold line that draws across the three steps as they appear */}
              <span aria-hidden className="hidden sm:block absolute left-6 right-6 top-[3.25rem] h-px bg-white/10 overflow-hidden">
                <span className="bar-fill bg-gold" style={{ "--bar-delay": "300ms" } as CSSProperties} />
              </span>
              {nextSteps.map((step, i) => (
                <li key={step.title} className="relative rounded-[24px] surface-ink-glass p-6 md:p-7" data-reveal="up" style={{ "--delay": `${150 + i * 150}ms` } as CSSProperties}>
                  <span className="relative z-[1] w-11 h-11 rounded-full bg-gold text-ink flex items-center justify-center font-[family-name:var(--font-instrument)] text-[1.4rem] tabular-nums">{i + 1}</span>
                  <h3 className="font-[family-name:var(--font-instrument)] text-[1.6rem] leading-tight mt-8">{step.title}</h3>
                  <p className="text-small text-text-on-dark/75 mt-2">{step.body}</p>
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
