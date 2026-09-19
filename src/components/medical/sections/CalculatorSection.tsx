import { Suspense } from "react";
import ChancesCalculatorForm from "@/components/medical/calculator/ChancesCalculatorForm";

export default function CalculatorSection({ id }: { id: string }) {
  return (
    <section id={id} className="py-32 bg-paper relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
      <div className="max-w-ledger mx-auto px-6 md:px-12 text-center">
        <header className="mb-12">
          <h2 className="text-h2 text-text-main mb-4">Discover Your Options</h2>
          <p className="text-body-large text-text-muted max-w-prose mx-auto">
            Input your rank and category to instantly see which colleges fall into your safe, moderate, and ambitious zones.
          </p>
        </header>

        <div className="max-w-4xl mx-auto text-left">
          <Suspense fallback={<div className="h-40 bg-paper-bright/50 animate-pulse rounded-[var(--radius-md)] border border-hairline" />}>
            <ChancesCalculatorForm mode="landing" />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
