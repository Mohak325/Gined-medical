"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsapContext";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function RoadmapPinned({ steps }: { steps: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);
  const visualsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".roadmap-panel");
      const visuals = gsap.utils.toArray<HTMLElement>(".roadmap-visual");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: `+=${panels.length * 100}%`,
          pin: true,
          scrub: true,
          pinSpacing: true,
        }
      });

      // Progress rail
      tl.fromTo(".progress-fill", 
        { scaleY: 0 },
        { scaleY: 1, ease: "none" },
        0
      );

      // Animate the panels and visuals as we scroll
      panels.forEach((panel: any, i) => {
        if (i === 0) return; // First one is visible by default

        // Crossfade timeline placement
        const startTime = i - 0.5;

        // Previous panel fades out
        tl.to(panels[i - 1], { opacity: 0, y: -50, duration: 0.5, ease: "power2.inOut" }, startTime);
        tl.to(visuals[i - 1], { opacity: 0, scale: 1.1, duration: 0.5, ease: "power2.inOut" }, startTime);

        // Current panel fades in
        tl.fromTo(
          panel,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.inOut" },
          startTime
        );
        tl.fromTo(
          visuals[i],
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1, duration: 0.5, ease: "power2.inOut" },
          startTime
        );
      });

    }, containerRef);

    return () => ctx.revert();
  }, [steps]);

  return (
    <div ref={containerRef} className="h-screen bg-paper flex flex-col justify-center overflow-hidden">
      <div className="max-w-ledger mx-auto px-6 md:px-12 w-full flex items-center h-full">
        
        {/* Left Side: Content */}
        <div className="w-1/2 relative h-full flex flex-col justify-center" ref={panelsRef}>
          <div className="absolute left-0 top-0 bottom-0 w-px bg-hairline ml-4 hidden md:block">
            <div className="progress-fill w-full h-full bg-gold scale-y-0 origin-top" />
          </div>

          <div className="relative h-[60vh]">
            {steps.map((step, idx) => (
              <div 
                key={step.step_order} 
                className="roadmap-panel absolute inset-0 flex flex-col justify-center pr-12 md:pl-16"
                style={{ opacity: idx === 0 ? 1 : 0, zIndex: steps.length - idx, pointerEvents: "none" }}
              >
                <div className="absolute left-[-1.5rem] top-1/2 -mt-3 flex items-center justify-center w-6 h-6 rounded-full bg-paper border-2 border-gold z-10 hidden md:flex">
                  <div className="w-2 h-2 rounded-full bg-gold" />
                </div>
                
                <div className="text-small text-gold tracking-widest uppercase mb-4 font-semibold">
                  Step {step.step_order}
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-paper-dim text-micro text-text-muted mb-3 w-max">
                  <Calendar className="w-3.5 h-3.5" /> {step.timing_window}
                </div>
                <h3 className="text-h2 text-text-main mb-4 pointer-events-auto">{step.title}</h3>
                <p className="text-body-large text-text-muted pointer-events-auto">{step.body}</p>
                
                {step.documents && step.documents.length > 0 && (
                  <div className="mt-8 pointer-events-auto">
                    <div className="text-small font-semibold text-text-main mb-3">Required Documents:</div>
                    <ul className="text-small text-text-muted space-y-2">
                      {step.documents.map((doc: string, i: number) => (
                        <li key={i} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-safe" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Visuals */}
        <div className="w-1/2 h-full flex items-center justify-center relative pl-12" ref={visualsRef}>
          <div className="relative w-full aspect-square max-h-[60vh] rounded-[var(--radius-lg)] overflow-hidden bg-ink border border-hairline shadow-card">
            {steps.map((step, idx) => (
              <div 
                key={step.step_order}
                className="roadmap-visual absolute inset-0 flex items-center justify-center"
                style={{ opacity: idx === 0 ? 1 : 0, zIndex: steps.length - idx }}
              >
                <img 
                  src={`https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800&sig=${idx}`} 
                  alt={step.title} 
                  className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
                />
                <div className="absolute inset-0 bg-ink/30 flex items-center justify-center">
                  <div className="text-[120px] font-bold text-white/90 tabular-nums drop-shadow-xl">
                    {step.step_order}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
