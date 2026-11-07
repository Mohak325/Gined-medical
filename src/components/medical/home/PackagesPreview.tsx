import PackageCards, { PRICES_INDICATIVE } from "./PackageCards";
import SplitWords from "@/components/motion/SplitWords";
import Cta from "@/components/ui/Cta";

export default function PackagesPreview() {
  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-paper-bright border-y border-hairline overflow-hidden">
      <div aria-hidden className="absolute left-1/2 top-0 -translate-x-1/2 w-[60rem] h-[24rem] rounded-full bg-gold/10 blur-[120px]" />
      <div className="relative max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-gold-deep mb-4" data-reveal="fade">Counselling packages</p>
            <SplitWords text="A counsellor beside you, round by round." className="text-display text-ink" />
          </div>
          <div data-reveal="up">
            <Cta href="/medical/pricing" variant="outline">Compare every feature</Cta>
          </div>
        </header>
        <PackageCards featureLimit={4} source="home-pricing" />
        {PRICES_INDICATIVE && <p className="mt-8 text-small text-text-muted">Prices shown are indicative while packages are being finalised.</p>}
      </div>
    </section>
  );
}
