"use client";

import { useState } from "react";
import faqData from "@/content/faq.ug.json";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQSection({ id }: { id: string }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id={id} className="py-24 bg-paper border-t border-hairline">
      <div className="max-w-prose mx-auto px-6 md:px-12">
        <header className="mb-16 text-center">
          <h2 className="text-h2 text-text-main mb-4">Frequently Asked Questions</h2>
          <p className="text-body text-text-muted">
            Everything you need to know about NEET counselling.
          </p>
        </header>

        <div className="space-y-4">
          {faqData.questions.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={idx} 
                className={`border rounded-[var(--radius-md)] overflow-hidden transition-colors duration-[var(--dur-base)] ${isOpen ? 'border-gold bg-paper-bright' : 'border-hairline bg-transparent hover:border-border-strong'}`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-h4 text-text-main pr-8">{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-[var(--dur-base)] ${isOpen ? 'rotate-180 text-gold' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 pb-6 text-body text-text-muted pt-2 border-t border-hairline mx-6">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
