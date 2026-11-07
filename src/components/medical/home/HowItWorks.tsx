"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { FileText } from "lucide-react";
import roadmap from "@/content/roadmap.ug.json";
import Photo from "@/components/motion/Photo";
import SplitWords from "@/components/motion/SplitWords";
import Cta from "@/components/ui/Cta";
import type { PhotoKey } from "@/content/images";

const STEP_PHOTOS: PhotoKey[] = ["libraryStudy", "laptopStethoscope", "doctorsTablet", "grandLibrary", "hospitalCorridor", "wardPractice", "graduation"];

/**
 * The seven counselling steps as a scroll story: the steps scroll on the right while a sticky
 * panel on the left cross-fades to each step's photo and number. On small screens each step
 * carries its own photo.
 */
export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="how-it-works" className="relative bg-ink-deep text-text-on-dark py-24 md:py-32 scroll-mt-16 grain">
      <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="max-w-3xl mb-14 md:mb-20">
          <p className="text-eyebrow text-gold mb-4" data-reveal="fade">How NEET UG counselling works</p>
          <SplitWords text="Seven steps, from result to reporting." className="text-display-xl" />
        </header>

        <div className="grid gap-10 lg:grid-cols-12">
          {/* Sticky photo panel (large screens) */}
          <div className="hidden lg:block lg:col-span-6">
            <div className="sticky top-24 h-[calc(100svh-8rem)] rounded-[28px] overflow-hidden">
              {STEP_PHOTOS.map((photo, i) => (
                <div key={photo} aria-hidden={i !== active} className={`absolute inset-0 transition-opacity duration-700 ease-out ${i === active ? "opacity-100" : "opacity-0"}`}>
                  <Photo name={photo} overlay="bottom" decorative sizes="50vw" className={`transition-transform duration-[2000ms] ease-out ${i === active ? "scale-100" : "scale-110"}`} />
                </div>
              ))}
              <div className="absolute inset-x-0 bottom-0 z-[3] p-8 flex items-end justify-between">
                <span className="font-[family-name:var(--font-instrument)] text-[9rem] leading-[0.8] text-text-on-dark/90 tabular-nums" aria-hidden>
                  {String(active + 1).padStart(2, "0")}
                </span>
                <span className="text-small text-text-on-dark/70 text-right max-w-[12rem]">{roadmap.steps[active].timing_window}</span>
              </div>
              {/* progress dots */}
              <div className="absolute top-6 left-6 z-[3] flex gap-1.5" aria-hidden>
                {STEP_PHOTOS.map((_, i) => (
                  <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-gold" : i < active ? "w-3 bg-text-on-dark/60" : "w-3 bg-text-on-dark/25"}`} />
                ))}
              </div>
            </div>
          </div>

          {/* Scrolling steps */}
          <ol className="lg:col-span-6 relative">
            <span aria-hidden className="absolute left-[1.15rem] top-2 bottom-2 w-px bg-white/10" />
            <span aria-hidden className="scroll-progress absolute left-[1.15rem] top-2 bottom-2 w-px bg-gold" />
            {roadmap.steps.map((step, i) => (
              <li
                key={step.step_order}
                data-step={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                className="relative pl-14 pb-16 lg:min-h-[62svh] last:pb-0"
              >
                <span
                  className={`absolute left-0 top-0 w-[2.35rem] h-[2.35rem] rounded-full flex items-center justify-center text-small font-semibold tabular-nums transition-colors duration-500 ${
                    i <= active ? "bg-gold text-ink" : "bg-white/10 text-text-on-dark/70"
                  }`}
                >
                  {step.step_order}
                </span>
                <div className="lg:hidden relative h-52 rounded-2xl overflow-hidden mb-6">
                  <Photo name={STEP_PHOTOS[i]} overlay="soft" decorative sizes="100vw" />
                </div>
                <p className="text-eyebrow text-gold" data-reveal="fade">{step.timing_window}</p>
                <h3 className={`text-h1 mt-3 transition-colors duration-500 ${i === active ? "text-text-on-dark" : "lg:text-text-on-dark/70"}`} data-reveal="up">
                  {step.title}
                </h3>
                <p className="text-body-large text-text-on-dark/70 mt-4 max-w-xl" data-reveal="up" style={{ "--delay": "100ms" } as CSSProperties}>
                  {step.body}
                </p>
                {step.documents.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2" data-reveal="up" style={{ "--delay": "180ms" } as CSSProperties}>
                    {step.documents.map((doc) => (
                      <li key={doc} className="inline-flex items-center gap-1.5 rounded-full surface-ink-glass px-3 py-1.5 text-small text-text-on-dark/85">
                        <FileText className="w-3.5 h-3.5 text-gold" aria-hidden />
                        {doc}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-16 flex flex-wrap gap-3" data-reveal="up">
          <Cta href="/medical/guide" variant="gold" size="lg">Read the full counselling guide</Cta>
          <Cta href="/medical/book?source=how-it-works" variant="glass" size="lg">Get help with these steps</Cta>
        </div>
      </div>
    </section>
  );
}
