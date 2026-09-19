"use client";

import { useCinematicContext } from "@/lib/medical/CinematicProvider";
import { useTrack } from "@/lib/medical/TrackProvider";
import dynamic from "next/dynamic";
import TestimonialStack from "@/components/medical/sections/TestimonialStack";
import testimonialsData from "@/content/testimonials.json";

const TestimonialScrub = dynamic(() => import("@/components/medical/cinematic/TestimonialScrub"), { ssr: false });
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function TestimonialsSection({ id }: { id: string }) {
  const cinematic = useCinematicContext();
  const { track } = useTrack();
  
  const subset = testimonialsData.testimonials
    .filter(t => t.track === "both" || t.track === track || !t.track)
    .slice(0, 3);

  return (
    <section id={id} className="py-24 bg-ink overflow-hidden">
      <div className="max-w-ledger mx-auto px-6 md:px-12 mb-16">
        <h2 className="text-h2 text-text-on-dark mb-4">
          Students who trusted the data
        </h2>
      </div>

      {cinematic 
        ? <TestimonialScrub testimonials={subset} />
        : <TestimonialStack testimonials={subset} />
      }

      <div className="max-w-ledger mx-auto px-6 md:px-12 mt-16 text-center md:text-left">
        <Link 
          href="/medical/success-stories"
          className="inline-flex items-center gap-2 text-gold font-semibold hover:text-gold-deep transition-colors"
        >
          View all success stories <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
