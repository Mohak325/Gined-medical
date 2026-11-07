"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Turns on the site's motion once, for every page:
 * - marks html.motion-ready so [data-reveal] / [data-split] elements start hidden, then reveals
 *   each one the first time it scrolls into view (elements added later are picked up too);
 * - inertia scrolling (Lenis) for mouse and trackpad;
 * - pointer effects: [data-spotlight] glow position and [data-magnetic] lean.
 * With reduced motion, only the reveal marking runs, and the CSS shows everything at once.
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;

    const reveal = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-in", "");
          reveal.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    const selector = "[data-reveal]:not([data-in]), [data-split]:not([data-in])";
    const watch = (root: Element | Document) => {
      if (root instanceof Element && root.matches(selector)) reveal.observe(root);
      root.querySelectorAll(selector).forEach((el) => reveal.observe(el));
    };
    watch(document);
    html.classList.add("motion-ready");
    (window as Window & { __motion?: boolean }).__motion = true;

    const added = new MutationObserver((records) => {
      for (const record of records) record.addedNodes.forEach((node) => node instanceof Element && watch(node));
    });
    added.observe(document.body, { childList: true, subtree: true });

    let lenis: Lenis | undefined;
    if (!reduce && window.matchMedia("(pointer: fine)").matches) {
      lenis = new Lenis({ autoRaf: true, anchors: { offset: -80 }, lerp: 0.11 });
    }

    const onMove = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const spot = target?.closest<HTMLElement>("[data-spotlight]");
      if (spot) {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
      if (reduce) return;
      const mag = target?.closest<HTMLElement>("[data-magnetic]");
      if (mag) {
        const r = mag.getBoundingClientRect();
        mag.style.setProperty("--tx", `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
        mag.style.setProperty("--ty", `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
      }
    };
    const onOut = (e: PointerEvent) => {
      const mag = e.target instanceof Element ? e.target.closest<HTMLElement>("[data-magnetic]") : null;
      if (mag && !(e.relatedTarget instanceof Node && mag.contains(e.relatedTarget))) {
        mag.style.setProperty("--tx", "0px");
        mag.style.setProperty("--ty", "0px");
      }
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onOut, { passive: true });

    return () => {
      reveal.disconnect();
      added.disconnect();
      lenis?.destroy();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
    };
  }, []);

  // A new page starts at the top, unless the link points at a section.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
