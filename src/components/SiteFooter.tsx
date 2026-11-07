import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import meta from "@/data/meta.json";

const footerLinks = [
  {
    title: "Tools",
    links: [
      { label: "College Finder", href: "/medical#finder" },
      { label: "All colleges", href: "/medical/colleges" },
      { label: "Seat matrix", href: "/medical/seat-matrix" },
      { label: "Compare colleges", href: "/medical/compare" },
    ],
  },
  {
    title: "Counselling",
    links: [
      { label: "Packages and pricing", href: "/medical/pricing" },
      { label: "Book a session", href: "/medical/book?source=footer" },
      { label: "How counselling works", href: "/medical#how-it-works" },
      { label: "FAQ", href: "/medical#faq" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink-deep text-text-on-dark">
      <div className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 pt-16 md:pt-20 pb-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <Link href="/medical" className="text-[1.75rem] font-bold tracking-tight">
              gined<span className="text-gold">.in</span>
            </Link>
            <p className="text-h1 mt-6 max-w-md text-text-on-dark/90">
              Your rank, read properly. Your choices, filled with care.
            </p>
            <Link
              href="/medical/book?source=footer"
              className="mt-8 inline-flex items-center gap-2 pl-5 pr-4 py-3 bg-gold text-ink font-semibold text-small rounded-full hover:bg-gold/90 transition-colors"
            >
              Book a 1-to-1 session
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>

          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title} className="md:col-span-3">
              <h2 className="text-eyebrow text-text-on-dark/45 mb-5">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-body text-text-on-dark/75 hover:text-text-on-dark transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 grid gap-6 md:grid-cols-12 text-micro text-text-on-dark/45 font-normal tracking-normal">
          <p className="md:col-span-9 leading-relaxed">
            Not affiliated with NTA, MCC or any state counselling authority. Cutoffs come from MCC&apos;s and {meta.stateCutoffs.length} state
            authorities&apos; published results, and fees from official fee documents. The college list and seats are adapted from{" "}
            <a href="https://github.com/deekshithvodela/nexdoc" target="_blank" rel="noopener noreferrer" className="underline hover:text-text-on-dark/70">
              NexDoc
            </a>{" "}
            (open licence). Always check the official portals before you decide.
          </p>
          <div className="md:col-span-3 flex md:justify-end gap-6">
            <Link href="/privacy" className="hover:text-text-on-dark/70 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-text-on-dark/70 transition-colors">Terms</Link>
            <span>© {new Date().getFullYear()} gined.in</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
