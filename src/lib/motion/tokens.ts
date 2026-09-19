/**
 * Motion tokens — Design Guidelines v2 §5.2
 *
 * These are the JS equivalents of the CSS custom properties,
 * for use with Framer Motion and GSAP.
 */

export const duration = {
  instant: 0.12,
  fast: 0.2,
  base: 0.32,
  slow: 0.6,
  hero: 0.8,
} as const;

export const easing = {
  out: [0.16, 1, 0.3, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
  soft: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
} as const;

/**
 * Standard entry animation for marketing sections (Register B).
 * One-shot, desktop only.
 */
export const sectionEntry = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: duration.slow, ease: easing.out },
} as const;

/**
 * Stagger children for marketing section entries.
 */
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
} as const;

/**
 * Card hover lift — 200ms, ease-out. Must feel instant.
 */
export const cardHover = {
  whileHover: { y: -2 },
  transition: { duration: duration.fast, ease: easing.out },
} as const;
