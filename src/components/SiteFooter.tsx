import Link from "next/link";
import Cta from "@/components/ui/Cta";
import meta from "@/data/meta.json";

const footerLinks = [
  {
    title: "Tools",
    links: [
      { label: "College Finder", href: "/medical#finder" },
      { label: "All colleges", href: "/medical/colleges" },
      { label: "Seat matrix", href: "/medical/seat-matrix" },
      { label: "Compare colleges", href: "/medical/compare" },
      { label: "Your shortlist", href: "/medical/shortlist" },
    ],
  },
  {
    title: "Counselling",
    links: [
      { label: "Packages and pricing", href: "/medical/pricing" },
      { label: "Book a session", href: "/medical/book?source=footer" },
      { label: "Counselling guide", href: "/medical/guide" },
      { label: "Counselling calendar", href: "/medical/guide#calendar" },
      { label: "FAQ", href: "/medical#faq" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-ink-deep text-text-on-dark grain print:hidden">
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[70rem] h-[30rem] rounded-full bg-gold/10 blur-[120px]" />
      <div className="relative z-[2] max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-20 md:pt-28 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/medical" className="text-[1.75rem] font-bold tracking-tight">
              gined<span className="text-gold">.in</span>
            </Link>
            <p className="text-display mt-6 max-w-lg text-text-on-dark/90" data-reveal="up">
              Your rank, read properly. Your choices, filled <em className="italic text-gold">with care.</em>
            </p>
            <div className="mt-8">
              <Cta href="/medical/book?source=footer" variant="gold">Book a 1-to-1 session</Cta>
            </div>
          </div>

          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title} className="md:col-span-3">
              <h2 className="text-eyebrow text-text-on-dark/70 mb-5">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="group inline-flex items-center gap-2 text-body text-text-on-dark/75 hover:text-text-on-dark transition-colors">
                      <span aria-hidden className="h-px w-0 bg-gold transition-all duration-300 group-hover:w-4" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p aria-hidden className="mt-20 select-none font-[family-name:var(--font-instrument)] leading-[0.8] tracking-[-0.04em] text-[clamp(5rem,22vw,20rem)] bg-gradient-to-b from-white/[0.14] to-white/[0.02] bg-clip-text text-transparent" data-reveal="up">
          gined.in
        </p>
        <div className="mt-6 pt-8 border-t border-white/10 grid gap-6 md:grid-cols-12 text-micro text-text-on-dark/70 font-normal tracking-normal">
          <p className="md:col-span-9 leading-relaxed">
            Not affiliated with NTA, MCC or any state counselling authority. Cutoffs come from MCC&apos;s and {meta.stateCutoffs.length} state
            authorities&apos; published results, and fees from official fee documents. The college list and seats are adapted from{" "}
            <a href="https://github.com/deekshithvodela/nexdoc" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-on-dark">
              NexDoc
            </a>{" "}
            (open licence). Always check the official portals before you decide.
          </p>
          <div className="md:col-span-3 flex md:justify-end gap-6">
            <Link href="/privacy" className="hover:text-text-on-dark transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text-on-dark transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()} gined.in</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
