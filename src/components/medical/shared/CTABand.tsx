import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import Cta from "@/components/ui/Cta";
import type { PhotoKey } from "@/content/images";

interface CTABandProps {
  id?: string;
  /** Sent to the booking form, so the leads sheet shows which band a booking came from. */
  source: string;
  headline?: string;
  compact?: boolean;
  photo?: PhotoKey;
}

/** The closing booking band: a photo with a slow parallax, a split headline, and two actions. */
export default function CTABand({ id, source, headline = "Your rank is set. Your choice list isn't yet.", compact = false, photo = "graduation" }: CTABandProps) {
  return (
    <section id={id} className="px-3 sm:px-4 py-6 print:hidden">
      <div className={`relative overflow-hidden max-w-[1400px] mx-auto rounded-[28px] bg-ink-deep text-text-on-dark ${compact ? "min-h-[340px]" : "min-h-[520px]"} flex items-end`}>
        <Photo name={photo} parallax overlay="left" decorative sizes="(min-width: 1400px) 1400px, 100vw" />
        <div className={`relative z-[2] w-full px-6 sm:px-10 md:px-16 ${compact ? "py-12" : "py-16 md:py-24"} grid gap-10 lg:grid-cols-12 lg:items-end`}>
          <div className="lg:col-span-8">
            <p className="text-eyebrow text-gold mb-5" data-reveal="fade">One conversation away</p>
            <SplitWords text={headline} className={compact ? "text-h1 md:text-display" : "text-display-xl"} />
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end" data-reveal="up" style={{ ["--delay" as string]: "250ms" }}>
            <Cta href={`/medical/book?source=${source}`} variant="gold" size="lg">Book a 1-to-1 session</Cta>
            <Cta href="/medical#finder" variant="glass" size="lg">Check my chances first</Cta>
          </div>
        </div>
      </div>
    </section>
  );
}
