"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import ShortlistNavLink from "./ShortlistNavLink";

export const NAV_LINKS = [
  { label: "College Finder", href: "/medical#finder" },
  { label: "Colleges", href: "/medical/colleges" },
  { label: "Seat Matrix", href: "/medical/seat-matrix" },
  { label: "Compare", href: "/medical/compare" },
  { label: "Pricing", href: "/medical/pricing" },
];

/** One light navigation bar for every page: frosted paper, with a hairline once the page scrolls. */
export default function SiteNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scrolling while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-[var(--z-nav)] transition-[background-color,border-color] duration-[var(--dur-base)] border-b ${
          // Clear only over the homepage hero; other pages (some with dark headers) always get the frosted bar.
          scrolled || menuOpen || pathname !== "/medical" ? "bg-paper/90 backdrop-blur-xl border-hairline" : "bg-paper/0 border-transparent"
        }`}
      >
        <nav aria-label="Main" className="max-w-marketing mx-auto px-4 sm:px-6 md:px-10 flex items-center justify-between h-16 md:h-[72px]">
          <Link href="/medical" className="text-[1.375rem] font-bold text-ink tracking-tight" onClick={() => setMenuOpen(false)}>
            gined<span className="text-gold-deep">.in</span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`px-3.5 py-2 rounded-full text-small font-medium transition-colors ${
                  isActive(link.href) ? "bg-ink/[0.06] text-ink" : "text-text-muted hover:text-ink hover:bg-ink/[0.04]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ShortlistNavLink onNavigate={() => setMenuOpen(false)} />
            <Link
              href="/medical/book?source=nav"
              className="hidden sm:inline-flex items-center gap-1.5 pl-4 pr-3.5 py-2.5 bg-ink text-text-on-dark font-semibold text-small rounded-full hover:bg-ink-soft transition-colors"
            >
              Book a session
              <ArrowUpRight className="w-4 h-4 text-gold" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="lg:hidden text-ink p-2.5 -mr-2 rounded-full hover:bg-ink/[0.05]"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div id="mobile-menu" className="fixed inset-0 top-16 z-[calc(var(--z-nav)-1)] bg-paper flex flex-col px-6 pt-8 pb-10 lg:hidden">
          <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-4 text-h1 text-ink"
                >
                  {link.label}
                  <ArrowUpRight className="w-5 h-5 text-text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/medical/book?source=nav"
            onClick={() => setMenuOpen(false)}
            className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-ink text-text-on-dark font-semibold text-body rounded-full"
          >
            Book a session
            <ArrowUpRight className="w-5 h-5 text-gold" aria-hidden />
          </Link>
        </div>
      )}
    </>
  );
}
