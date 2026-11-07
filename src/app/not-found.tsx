import type { CSSProperties } from "react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import Cta from "@/components/ui/Cta";

/**
 * Shown for any address that doesn't exist, including a college or state we don't have.
 * not-found files can't export metadata, so the title is set here; Next.js adds noindex itself.
 */
export default function NotFound() {
  return (
    <>
      <title>Page not found — gined.in</title>
      <SiteNavbar />
      <main className="relative min-h-[100svh] flex items-center bg-ink-deep text-text-on-dark overflow-hidden">
        <Photo name="microscope" overlay="full" decorative priority />
        <div aria-hidden className="absolute -right-40 top-1/4 z-[1] w-[40rem] h-[40rem] rounded-full bg-gold/10 blur-[140px]" />
        <p
          aria-hidden
          className="intro-fade absolute z-[1] right-[-2vw] bottom-[-6vw] font-[family-name:var(--font-instrument)] text-[42vw] leading-none text-white/[0.04] select-none pointer-events-none"
        >
          404
        </p>

        <div className="relative z-[2] w-full max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 pb-24">
          <p className="intro-fade text-eyebrow text-gold mb-5 flex items-center gap-3">
            <span aria-hidden className="h-px w-10 bg-gold" /> Error 404
          </p>
          <SplitWords
            as="h1"
            intro
            delay={100}
            className="text-display-xl max-w-3xl [text-wrap:balance]"
            parts={[{ text: "This page isn't on" }, { text: "the list.", className: "italic text-sheen pr-1" }]}
          />
          <p className="intro text-body-large text-text-on-dark/75 mt-6 max-w-xl" style={{ "--delay": "350ms" } as CSSProperties}>
            The link may be old, or the address may have a typo. These will get you back on track.
          </p>
          <div className="intro mt-10 flex flex-wrap gap-3" style={{ "--delay": "500ms" } as CSSProperties}>
            <Cta href="/medical#finder" variant="gold" size="lg">
              Check my chances
            </Cta>
            <Cta href="/medical/colleges" variant="glass" size="lg">
              Browse colleges
            </Cta>
            <Cta href="/medical" variant="glass" size="lg" arrow={false}>
              Home
            </Cta>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
