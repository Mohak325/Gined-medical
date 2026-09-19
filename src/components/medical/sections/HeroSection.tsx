"use client";

import { useCinematicContext } from "@/lib/medical/CinematicProvider";
import dynamic from "next/dynamic";
import { BlurText } from "@/components/reactbits/BlurText";
import Link from "next/link";
import { useTrack } from "@/lib/medical/TrackProvider";
import { ArrowDown } from "lucide-react";
import TrackToggle from "@/components/medical/shared/TrackToggle";

const HeroCinematic = dynamic(() => import("@/components/medical/cinematic/HeroCinematic"), { ssr: false });

export default function HeroSection({ id }: { id: string }) {
  const cinematic = useCinematicContext();
  
  if (cinematic) {
    return <HeroCinematic id={id} />;
  }

  return <HeroStatic id={id} />;
}

function HeroStatic({ id }: { id: string }) {
  const { track } = useTrack();
  
  return (
    <section id={id} className="relative min-h-[90vh] flex flex-col justify-end pb-20 pt-32">
      <div className="absolute inset-0 z-0 overflow-hidden bg-ink">
        <img
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000"
          alt="Medical Students"
          className="w-full h-full object-cover opacity-60 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-ledger mx-auto px-6 md:px-12 w-full">
        <div className="mb-12">
          <div className="text-small text-gold tracking-[0.2em] uppercase mb-4 font-semibold">
            Medical Counselling 2025
          </div>
          <h1 className="text-display text-text-on-dark mb-6 max-w-5xl">
            <BlurText text="Navigate the medical admission maze with absolute clarity." delay={0.1} />
          </h1>
          <p className="text-body-large text-text-on-dark/80 max-w-2xl mb-8">
            Data-backed cutoff predictions, complete fee structures, and transparent seat matrices for every NMC-recognized institution in India.
          </p>

          <TrackToggle />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link 
            href="#calculator" 
            className="px-8 py-4 bg-gold text-ink font-semibold rounded-[var(--radius-sm)] hover:bg-gold-deep transition-colors"
          >
            Check Your Chances
          </Link>
          
          {track === "pg" && (
            <Link 
              href="/medical/colleges"
              className="text-white/80 hover:text-white underline underline-offset-4 font-medium"
            >
              Browse PG Specialties &rarr;
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
