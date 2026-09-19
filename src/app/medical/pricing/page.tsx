import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import packagesData from "@/content/packages.json";
import { CheckCircle2, X } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <>
      <SiteNavbar variant="solid" />
      
      <main className="pt-24 pb-32 bg-paper min-h-screen">
        <div className="max-w-prose mx-auto px-6 md:px-12 text-center mb-16">
          <h1 className="text-display text-text-main mb-6">Expert Counselling Packages</h1>
          <p className="text-body-large text-text-muted">
            Choose the right level of support for your NEET journey. All packages include data-driven reports and personalised shortlists.
          </p>
        </div>

        <div className="max-w-ledger mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {packagesData.packages.map((pkg) => (
              <div 
                key={pkg.id} 
                className={`relative flex flex-col bg-paper-bright border rounded-[var(--radius-lg)] p-8 ${
                  pkg.recommended 
                    ? "border-gold shadow-card md:-translate-y-4" 
                    : "border-hairline"
                }`}
              >
                {pkg.recommended && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gold text-ink text-micro font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                
                <h3 className="text-h3 text-text-main mb-2">{pkg.name}</h3>
                <div className="text-small text-text-muted mb-6">{pkg.session_count === -1 ? 'Unlimited Sessions' : `${pkg.session_count} Session${pkg.session_count > 1 ? 's' : ''}`}</div>
                
                <div className="mb-8">
                  <span className="text-display text-text-main tabular-nums">₹{pkg.price.toLocaleString("en-IN")}</span>
                </div>

                <Link 
                  href={`/medical/book?package=${pkg.id}`}
                  className={`w-full text-center px-6 py-3 rounded-[var(--radius-sm)] font-semibold transition-colors mb-8 ${
                    pkg.recommended 
                      ? "bg-gold text-ink hover:bg-gold-deep" 
                      : "bg-paper-dim text-text-main hover:bg-paper-dim/80 border border-hairline"
                  }`}
                >
                  Choose {pkg.name}
                </Link>

                <div className="flex-grow">
                  <div className="text-small font-semibold text-text-main mb-4 uppercase tracking-wider">Included</div>
                  <ul className="space-y-3 mb-8">
                    {pkg.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-small text-text-muted">
                        <CheckCircle2 className="w-5 h-5 text-safe shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {pkg.exclusions.length > 0 && (
                    <>
                      <div className="text-small font-semibold text-text-main mb-4 uppercase tracking-wider opacity-60">Not Included</div>
                      <ul className="space-y-3">
                        {pkg.exclusions.map((exclusion, i) => (
                          <li key={i} className="flex items-start gap-3 text-small text-text-muted opacity-60">
                            <X className="w-5 h-5 shrink-0" />
                            <span>{exclusion}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
