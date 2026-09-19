"use client";

import { useEffect, useRef, ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/motion/gsapContext";
import { useCinematicContext } from "@/lib/medical/CinematicProvider";

export default function SmoothScrollRoot({ children }: { children: ReactNode }) {
  const cinematic = useCinematicContext();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cinematic || !rootRef.current) return;

    // 1. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // 2. Share RAF loop with ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 3. Create scoped context for landing page animations
    const ctx = gsap.context(() => {}, rootRef);

    // 4. Handle hash navigation for Lenis
    const handleHashClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;
      
      const href = anchor.getAttribute('href');
      if (href && href.includes('#')) {
        const hash = href.substring(href.indexOf('#'));
        const element = document.querySelector(hash) as HTMLElement;
        if (element) {
          // Only prevent default if we are on the same page
          if (window.location.pathname === href.split('#')[0] || href.startsWith('#') || window.location.pathname === '/' || href.startsWith('/medical#')) {
            e.preventDefault();
            lenis.scrollTo(element, { offset: -80 });
          }
        }
      }
    };
    
    document.addEventListener('click', handleHashClick);

    // 5. Scroll to hash on mount if present
    if (window.location.hash) {
      setTimeout(() => {
        const hashElement = document.querySelector(window.location.hash) as HTMLElement;
        if (hashElement) {
          lenis.scrollTo(hashElement, { immediate: true, offset: -80 });
        }
      }, 100);
    }

    // 6. Listeners for refresh
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener('click', handleHashClick);
      lenis.destroy();
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000);
      });
      ctx.revert();
    };
  }, [cinematic]);

  if (!cinematic) {
    return <div id="smooth-scroll-root">{children}</div>;
  }

  return (
    <div id="smooth-scroll-root" ref={rootRef}>
      {children}
    </div>
  );
}
