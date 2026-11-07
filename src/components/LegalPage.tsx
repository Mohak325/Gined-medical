import type { CSSProperties } from "react";
import SiteNavbar from "@/components/SiteNavbar";
import SiteFooter from "@/components/SiteFooter";
import SplitWords from "@/components/motion/SplitWords";

/**
 * A plain-reading page (privacy, terms): a short dark header, then numbered sections in one raised
 * card, with a list of sections that stays in view on wide screens.
 */
export default function LegalPage({ eyebrow, title, updated, sections }: { eyebrow: string; title: string; updated: string; sections: { title: string; body: string }[] }) {
  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return (
    <>
      <SiteNavbar />
      <main className="bg-paper min-h-screen">
        <section className="relative overflow-hidden bg-ink-deep text-text-on-dark grain">
          <div aria-hidden className="absolute -right-40 -top-32 w-[34rem] h-[34rem] rounded-full bg-gold/10 blur-[140px]" />
          <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-32 md:pt-40 pb-12 md:pb-16">
            <p className="intro-fade text-eyebrow text-gold mb-5 flex items-center gap-3">
              <span aria-hidden className="h-px w-10 bg-gold" /> {eyebrow}
            </p>
            <SplitWords as="h1" intro delay={100} text={title} className="text-display-xl" />
            <p className="intro text-small text-text-on-dark/70 mt-6" style={{ "--delay": "300ms" } as CSSProperties}>
              Last updated: {updated}
            </p>
          </div>
        </section>

        <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 py-14 md:py-20 grid gap-10 lg:grid-cols-12 items-start">
          <nav aria-label="Sections" className="hidden lg:block lg:col-span-3 lg:sticky lg:top-28">
            <ol className="space-y-1 text-small">
              {sections.map((section, i) => (
                <li key={section.title}>
                  <a href={`#${slug(section.title)}`} className="flex gap-3 rounded-full px-3 py-2 text-text-muted hover:text-ink hover:bg-ink/[0.05] transition-colors">
                    <span className="tabular-nums text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div data-reveal="up" className="lg:col-span-9 rounded-[28px] surface-premium divide-y divide-hairline">
            {sections.map((section, i) => (
              <section key={section.title} className="p-6 md:p-10 grid gap-3 md:grid-cols-12 md:gap-8" aria-labelledby={slug(section.title)}>
                <p className="md:col-span-1 font-[family-name:var(--font-instrument)] text-[1.75rem] leading-none text-gold-deep tabular-nums" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="md:col-span-11">
                  <h2 id={slug(section.title)} className="font-[family-name:var(--font-instrument)] text-[1.75rem] md:text-[2rem] leading-tight text-ink scroll-mt-28">
                    {section.title}
                  </h2>
                  <p className="text-body text-text-muted mt-3 max-w-2xl">{section.body}</p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
