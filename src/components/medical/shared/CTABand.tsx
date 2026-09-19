"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowDownRight } from "lucide-react";

interface CTABandProps {
  id?: string;
  source: string;
  headline?: string;
  compact?: boolean;
}

/**
 * CTABand — One component, every placement.
 * Only source, headline, and compact vary.
 * Design Guidelines v2 §10.12
 */
export default function CTABand({
  id,
  source,
  headline = "Ready to build your college list?",
  compact = false,
}: CTABandProps) {
  return (
    <section
      id={id}
      className={`w-full bg-ink ${compact ? "py-16" : "py-24 md:py-32"}`}
    >
      <div className="max-w-marketing mx-auto px-6 md:px-16 text-center">
        <h2
          className={`${
            compact ? "text-h1" : "text-display"
          } text-text-on-dark mb-8`}
        >
          {headline}
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={`/medical/book?source=${source}`}>
            <Button className="bg-gold hover:bg-gold/90 text-ink font-bold px-8 py-6 text-[16px] rounded-[var(--radius-md)] gap-2">
              Book a 1-to-1 Session
              <ArrowDownRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link
            href="/medical#calculator"
            className="text-text-on-dark/70 hover:text-text-on-dark text-body font-medium underline underline-offset-4 transition-colors"
          >
            Or try the College Finder for free
          </Link>
        </div>
      </div>
    </section>
  );
}
