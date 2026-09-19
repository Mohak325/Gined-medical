"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion/gsapContext";

export default function TestimonialScrub({ testimonials }: { testimonials: any[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!trackRef.current) return;
      
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "center center",
          end: "+=150%",
          pin: true,
          scrub: 1,
        }
      });

      // Calculate how far to translate (track width - viewport width)
      const walk = -(trackRef.current.scrollWidth - window.innerWidth + 200);
      
      tl.to(trackRef.current, {
        x: walk,
        ease: "none"
      });
      
    }, containerRef);
    
    return () => ctx.revert();
  }, [testimonials]);

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div ref={trackRef} className="flex gap-8 px-6 md:px-12 w-max pb-12">
        {testimonials.map((t, i) => (
          <div key={i} className="w-[85vw] md:w-[600px] flex flex-col md:flex-row items-center gap-8 bg-white/5 border border-white/10 p-8 rounded-[var(--radius-lg)] shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
              <img src={t.photo_url} alt={t.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <blockquote className="text-h4 md:text-h3 text-white font-medium italic mb-6">"{t.quote}"</blockquote>
              <div className="text-white font-semibold text-lg">{t.name}</div>
              <div className="text-white/60 text-small mb-2">AIR {t.rank} • {t.college_name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
