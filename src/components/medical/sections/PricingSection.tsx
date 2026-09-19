import Link from "next/link";
import packagesData from "@/content/packages.json";

export default function PricingSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-24 bg-paper-bright border-t border-hairline">
      <div className="max-w-ledger mx-auto px-6 md:px-12">
        <header className="mb-16 text-center">
          <h2 className="text-h2 text-text-main mb-4">Counselling Packages</h2>
          <p className="text-body-large text-text-muted">
            Expert guidance tailored to your rank and category.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packagesData.packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`bg-paper border rounded-[var(--radius-lg)] p-8 ${pkg.recommended ? "border-gold shadow-card" : "border-hairline"}`}
            >
              {pkg.recommended && (
                <div className="text-micro font-bold text-gold uppercase tracking-widest mb-4">Recommended</div>
              )}
              <h3 className="text-h3 text-text-main mb-2">{pkg.name}</h3>
              <div className="text-small text-text-muted mb-8">{pkg.session_count === -1 ? 'Unlimited Sessions' : `${pkg.session_count} Session${pkg.session_count > 1 ? 's' : ''}`}</div>
              
              <div className="mb-8">
                <span className="text-h2 text-text-main tabular-nums">₹{pkg.price.toLocaleString("en-IN")}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-grow">
                {pkg.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="text-small text-text-muted flex items-start gap-2 before:content-['✓'] before:text-safe">
                    {f}
                  </li>
                ))}
              </ul>
              
              <Link 
                href={`/medical/book?package=${pkg.id}`}
                className={`block w-full text-center px-4 py-3 rounded-[var(--radius-sm)] font-semibold transition-colors ${
                  pkg.recommended ? "bg-gold text-ink hover:bg-gold-deep" : "bg-paper-dim text-text-main hover:bg-paper-dim/80"
                }`}
              >
                Choose {pkg.name}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/medical/pricing" className="text-gold font-semibold hover:underline">
            View full feature comparison &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
