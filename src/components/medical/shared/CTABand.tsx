import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CTABandProps {
  id?: string;
  /** Sent to the booking form, so the leads sheet shows which band a booking came from. */
  source: string;
  headline?: string;
  compact?: boolean;
}

/** The closing booking band: one component for every placement. */
export default function CTABand({ id, source, headline = "Your rank is set. Your choice list isn't yet.", compact = false }: CTABandProps) {
  return (
    <section id={id} className="px-4 sm:px-6 md:px-10 py-10">
      <div className={`relative overflow-hidden max-w-marketing mx-auto rounded-[var(--radius-lg)] bg-ink text-text-on-dark ${compact ? "px-6 py-12 md:px-12" : "px-6 py-16 md:px-16 md:py-24"}`}>
        <div aria-hidden className="absolute -left-20 -bottom-32 w-96 h-96 rounded-full bg-gold/15 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className={`${compact ? "text-h1" : "text-display"} lg:col-span-8`}>{headline}</h2>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
            <Link
              href={`/medical/book?source=${source}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold text-ink font-semibold rounded-full hover:bg-gold/90 transition-colors"
            >
              Book a 1-to-1 session
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              href="/medical#finder"
              className="inline-flex items-center justify-center px-6 py-3.5 border border-white/20 text-text-on-dark font-semibold rounded-full hover:bg-white/5 transition-colors"
            >
              Check my chances first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
