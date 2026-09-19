"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsapContext";
import { BlurText } from "@/components/reactbits/BlurText";
import Link from "next/link";
import { useTrack } from "@/lib/medical/TrackProvider";
import TrackToggle from "@/components/medical/shared/TrackToggle";

export default function HeroCinematic({ id }: { id: string }) {
  const { track } = useTrack();
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Intro animations
      gsap.fromTo(
        ".hero-stagger",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "power3.out", delay: 0.3 }
      );

      // Simple parallax effect
      gsap.to(mediaRef.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id={id} ref={sectionRef} className="relative min-h-[100vh] flex flex-col justify-end pb-20 pt-32 overflow-hidden">
      <div className="absolute inset-0 z-0 bg-ink">
        <img
          ref={mediaRef}
          src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=2000"
          alt="Medical Students"
          className="w-full h-[120%] object-cover opacity-60 mix-blend-luminosity -top-[10%]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-ledger mx-auto px-6 md:px-12 w-full">
        <div className="mb-12">
          <div className="hero-stagger text-small text-gold tracking-[0.2em] uppercase mb-4 font-semibold opacity-0">
            Medical Counselling 2025
          </div>
          <h1 className="text-display text-text-on-dark mb-6 max-w-5xl">
            <BlurText text="Navigate the medical admission maze with absolute clarity." delay={0.1} />
          </h1>
          <p className="hero-stagger text-body-large text-text-on-dark/80 max-w-2xl mb-8 opacity-0">
            Data-backed cutoff predictions, complete fee structures, and transparent seat matrices for every NMC-recognized institution in India.
          </p>

          <div className="hero-stagger opacity-0">
            <TrackToggle />
          </div>
        </div>

        <div className="hero-stagger flex flex-col sm:flex-row items-start sm:items-center gap-6 opacity-0">
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
