"use client";

import { useState, useEffect } from "react";

/**
 * Evaluates whether the current device should receive the cinematic
 * (GSAP/Lenis/pinned scroll) experience.
 *
 * SSR always returns false — first paint is always the static (fast) path.
 * The cinematic layer hydrates in afterward.
 *
 * Conditions (ALL must be true):
 * - Viewport ≥ 1024px
 * - Fine pointer (not touch-only)
 * - No prefers-reduced-motion
 * - Not on save-data or slow connection
 * - Device memory ≥ 4GB (where available)
 */
export function useCinematic(): boolean {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const conn = (navigator as unknown as Record<string, unknown>).connection as
      | { saveData?: boolean; effectiveType?: string }
      | undefined;
    const cheap = conn?.saveData || /2g/.test(conn?.effectiveType ?? "");

    const mem = (navigator as unknown as Record<string, unknown>).deviceMemory as number | undefined;
    const enoughMem = (mem ?? 8) >= 4;

    setOk(wide && fine && motion && !cheap && enoughMem);
  }, []);

  return ok;
}
