import Link from "next/link";
import { Plus } from "lucide-react";
import faqData from "@/content/faq.ug.json";
import SplitWords from "@/components/motion/SplitWords";

/** FAQ as native disclosure widgets, so it works without JavaScript and is keyboard-friendly. */
export default function HomeFAQ() {
  return (
    <section id="faq" className="py-24 md:py-32 scroll-mt-16">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 grid gap-10 lg:grid-cols-12">
        <header className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
          <p className="text-eyebrow text-gold-deep mb-4" data-reveal="fade">Questions</p>
          <SplitWords text="Before you start." className="text-display text-ink" />
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
            <details key={faq.question} className="group border-b border-hairline" open={i === 0} data-reveal="up">
              <summary className="flex items-start justify-between gap-6 py-5 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-h4 text-ink transition-colors group-hover:text-gold-deep">{faq.question}</span>
                <span className="w-8 h-8 shrink-0 rounded-full border border-hairline flex items-center justify-center transition-all duration-500 group-open:rotate-45 group-open:bg-ink group-open:text-gold group-open:border-ink" aria-hidden><Plus className="w-4 h-4" /></span>
              </summary>
              <p className="pb-6 pr-10 text-body text-text-muted">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
