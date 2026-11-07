import Link from "next/link";
import { Plus } from "lucide-react";
import faqData from "@/content/faq.ug.json";

/** FAQ as native disclosure widgets, so it works without JavaScript and is keyboard-friendly. */
export default function HomeFAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 scroll-mt-16">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-4">
          <p className="text-eyebrow text-gold-deep mb-4">Questions</p>
          <h2 className="text-display text-ink">Before you start.</h2>
          <p className="text-body text-text-muted mt-4">
            Still unsure about your situation?{" "}
            <Link href="/medical/book?source=faq" className="text-ink font-semibold underline underline-offset-4 hover:text-gold-deep">
              Ask a counsellor
            </Link>
            .
          </p>
        </header>
        <div className="lg:col-span-8 border-t border-hairline">
          {faqData.questions.map((faq, i) => (
            <details key={faq.question} className="group border-b border-hairline" open={i === 0}>
              <summary className="flex items-start justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-h4 text-ink">{faq.question}</span>
                <Plus className="w-5 h-5 mt-0.5 shrink-0 text-text-muted transition-transform duration-[var(--dur-base)] group-open:rotate-45" aria-hidden />
              </summary>
              <p className="pb-6 pr-10 text-body text-text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
