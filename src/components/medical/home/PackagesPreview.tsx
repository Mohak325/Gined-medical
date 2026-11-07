import Link from "next/link";
import PackageCards, { PRICES_INDICATIVE } from "./PackageCards";

export default function PackagesPreview() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-paper-bright border-y border-hairline">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-gold-deep mb-4">Counselling packages</p>
            <h2 className="text-display text-ink">A counsellor beside you, round by round.</h2>
          </div>
          <Link href="/medical/pricing" className="text-small font-semibold text-ink underline underline-offset-4 hover:text-gold-deep">
            Compare every feature
          </Link>
        </header>
        <PackageCards featureLimit={4} source="home-pricing" />
        {PRICES_INDICATIVE && (
          <p className="mt-6 text-small text-text-muted">Prices shown are indicative while packages are being finalised.</p>
        )}
      </div>
    </section>
  );
}
