"use client";

import dynamic from "next/dynamic";

const CoverageDraw = dynamic(
  () => import("@/components/medical/cinematic/CoverageDraw"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-md aspect-square bg-white/5 rounded-full border border-white/10 flex items-center justify-center animate-pulse">
        <span className="text-white/40 font-semibold tracking-widest">Loading Map…</span>
      </div>
    ),
  }
);

export default function CoverageSection({ id }: { id: string }) {
  return (
    <section id={id} className="bg-ink py-32 border-y border-white/10 overflow-hidden relative">
      <div className="max-w-ledger mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 relative z-10">
        
        <div className="md:w-1/2">
          <div className="text-small text-gold tracking-widest uppercase mb-4 font-semibold">
            National Coverage
          </div>
          <h2 className="text-h2 text-text-on-dark mb-6">
            Every College. Every State. Every Category.
          </h2>
          <p className="text-body-large text-text-on-dark/80 mb-12">
            Our database tracks every NMC-recognized institution across India, bringing AIQ, State, Deemed, and Central counselling quotas into a single unified platform.
          </p>

          <div className="grid grid-cols-2 gap-8">
            <div className="border-l border-white/20 pl-6">
              <div className="text-display text-white mb-2 font-tabular-nums">680+</div>
              <div className="text-small text-white/60">Medical Colleges</div>
            </div>
            <div className="border-l border-white/20 pl-6">
              <div className="text-display text-white mb-2 font-tabular-nums">1.1L+</div>
              <div className="text-small text-white/60">Total MBBS Seats</div>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <CoverageDraw />
        </div>

      </div>
    </section>
  );
}
