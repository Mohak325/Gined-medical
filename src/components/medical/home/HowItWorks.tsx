"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import roadmap from "@/content/roadmap.ug.json";

/** The 7 counselling steps as a compact stepper: pick a step, read its detail. */
export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const step = roadmap.steps[active];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-paper-bright border-y border-hairline scroll-mt-16">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10">
        <header className="max-w-2xl mb-10 md:mb-14">
          <p className="text-eyebrow text-gold-deep mb-4">How NEET UG counselling works</p>
          <h2 className="text-display text-ink">Seven steps, from result to reporting.</h2>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          <ol className="lg:col-span-5 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 lg:pb-0 snap-x">
            {roadmap.steps.map((s, i) => {
              const isActive = i === active;
              return (
                <li key={s.step_order} className="snap-start shrink-0 lg:shrink">
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={isActive}
                    className={`w-60 lg:w-full text-left flex items-center gap-4 rounded-[var(--radius-md)] border px-4 py-3.5 transition-colors ${
                      isActive ? "border-ink bg-ink text-text-on-dark" : "border-hairline bg-paper hover:border-border-strong"
                    }`}
                  >
                    <span
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-small font-semibold tabular-nums ${
                        isActive ? "bg-gold text-ink" : "bg-paper-dim text-ink"
                      }`}
                    >
                      {s.step_order}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-body font-semibold truncate">{s.title}</span>
                      <span className={`block text-micro font-normal tracking-normal ${isActive ? "text-text-on-dark/65" : "text-text-muted"}`}>
                        {s.timing_window}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <article aria-live="polite" className="lg:col-span-7 rounded-[var(--radius-lg)] border border-hairline bg-paper p-6 md:p-10">
            <p className="text-eyebrow text-gold-deep">Step {step.step_order} · {step.timing_window}</p>
            <h3 className="text-h1 text-ink mt-3">{step.title}</h3>
            <p className="text-body-large text-text-muted mt-4">{step.body}</p>
            {step.documents.length > 0 && (
              <div className="mt-8">
                <h4 className="text-small font-semibold text-ink mb-3">Keep ready</h4>
                <ul className="flex flex-wrap gap-2">
                  {step.documents.map((doc) => (
                    <li key={doc} className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-paper-bright px-3 py-1.5 text-small text-text-main">
                      <FileText className="w-3.5 h-3.5 text-gold-deep" aria-hidden />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
