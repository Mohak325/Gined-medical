"use client";

import { useState, useEffect, type CSSProperties } from "react";
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

// Pages whose first screen is a dark photo or ink hero, where the bar starts clear with light text.
const DARK_HEROES = [/^\/medical$/, /^\/medical\/college\//, /^\/medical\/results$/];

/**
 * A floating glass capsule. Over a dark hero it starts clear with light text; once the page
 * scrolls it frosts and tightens.
 */
export default function SiteNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const overDark = DARK_HEROES.some((r) => r.test(pathname)) && !scrolled && !menuOpen;
  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);
  const ink = overDark ? "text-text-on-dark" : "text-ink";

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[var(--z-nav)] px-3 sm:px-4 pt-3 print:hidden">
        <nav
          aria-label="Main"
          className={`mx-auto flex items-center justify-between gap-3 rounded-full transition-[max-width,background-color,box-shadow,padding,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] border ${
            overDark
              ? "max-w-marketing px-3 sm:px-5 py-2 bg-transparent border-transparent"
              : "max-w-5xl px-2 sm:px-3 py-1.5 surface-glass"
          }`}
        >
          <Link href="/medical" className={`pl-2 text-[1.375rem] font-bold tracking-tight ${ink}`} onClick={() => setMenuOpen(false)}>
            gined<span className={overDark ? "text-gold" : "text-gold-deep"}>.in</span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative px-3.5 py-2 rounded-full text-small font-medium transition-colors ${
                    active
                      ? overDark
                        ? "bg-white/15 text-text-on-dark"
                        : "bg-ink text-text-on-dark"
                      : overDark
                        ? "text-text-on-dark/80 hover:text-text-on-dark hover:bg-white/10"
                        : "text-text-muted hover:text-ink hover:bg-ink/[0.05]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <span className={overDark ? "[&_a]:text-text-on-dark [&_a:hover]:bg-white/10" : ""}>
              <ShortlistNavLink onNavigate={() => setMenuOpen(false)} />
            </span>
            <Link
              href="/medical/book?source=nav"
              data-magnetic=""
              className={`group btn-shine hidden sm:inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 font-semibold text-small rounded-full transition-colors ${
                overDark ? "bg-gold text-ink" : "bg-ink text-text-on-dark hover:bg-ink-deep"
              }`}
            >
              Book a session
              <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:rotate-45 ${overDark ? "bg-ink text-gold" : "bg-gold text-ink"}`} aria-hidden>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className={`lg:hidden p-2.5 rounded-full ${ink} ${overDark ? "hover:bg-white/10" : "hover:bg-ink/[0.05]"}`}
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
        <div id="mobile-menu" className="fixed inset-0 z-[calc(var(--z-nav)-1)] bg-ink-deep text-text-on-dark flex flex-col px-6 pt-28 pb-10 lg:hidden grain">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} className="border-b border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: `${i * 60}ms` } as CSSProperties}>
                <Link href={link.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 text-display">
                  {link.label}
                  <ArrowUpRight className="w-6 h-6 text-gold" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            href="/medical/book?source=nav"
            onClick={() => setMenuOpen(false)}
            className="mt-auto inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold text-ink font-semibold text-body rounded-full"
          >
            Book a session
            <ArrowUpRight className="w-5 h-5" aria-hidden />
          </Link>
        </div>
      )}
    </>
  );
}
