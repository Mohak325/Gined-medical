import Link from "next/link";

const footerLinks = {
  Tools: [
    { label: "College Finder", href: "/medical#calculator" },
    { label: "All Colleges", href: "/medical/colleges" },
    { label: "Seat Matrix", href: "/medical/seat-matrix" },
    { label: "Compare Colleges", href: "/medical/compare" },
  ],
  Counselling: [
    { label: "Pricing & Packages", href: "/medical/pricing" },
    { label: "Book a Session", href: "/medical/book" },
    { label: "Success Stories", href: "/medical/success-stories" },
  ],
  Resources: [
    { label: "NEET UG Roadmap", href: "/medical#roadmap" },
    { label: "FAQ", href: "/medical#faq" },
  ],
};

/**
 * SiteFooter — ink background, structured columns.
 * Design Guidelines v2 §10.13
 */
export default function SiteFooter() {
  return (
    <footer className="bg-ink-deep border-t border-white/5">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-16">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/medical"
              className="text-h2 font-bold text-text-on-dark tracking-tight"
            >
              gined<span className="text-gold">.in</span>
            </Link>
            <p className="text-small text-text-on-dark/50 mt-4 max-w-xs">
              Data-backed medical counselling for NEET aspirants. Real cutoffs.
              Real guidance.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-micro text-text-on-dark/40 uppercase tracking-widest mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-small text-text-on-dark/60 hover:text-text-on-dark transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-micro text-text-on-dark/30">
            © {new Date().getFullYear()} gined.in. Not affiliated with NTA or
            MCC. Cutoff data from MCC official publications.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-micro text-text-on-dark/30 hover:text-text-on-dark/50 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-micro text-text-on-dark/30 hover:text-text-on-dark/50 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
