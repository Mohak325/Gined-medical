"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";

interface SiteNavbarProps {
  variant?: "cinematic" | "solid";
}

/**
 * SiteNavbar — v2 Design §10.1
 *
 * cinematic: Transparent on hero, frosted glass after scroll-past. Full-viewport overlay menu.
 * solid: Always ink background. Used on tool routes.
 */
export default function SiteNavbar({ variant = "solid" }: SiteNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (variant !== "cinematic") return;

    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const isSolid = variant === "solid" || scrolled;

  const navLinks = [
    { label: "Colleges", href: "/medical/colleges" },
    { label: "Seat Matrix", href: "/medical/seat-matrix" },
    { label: "Compare", href: "/medical/compare" },
    { label: "Success Stories", href: "/medical/success-stories" },
    { label: "Pricing", href: "/medical/pricing" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-[var(--z-nav)] transition-all duration-[var(--dur-base)] ${
          isSolid
            ? "bg-ink-deep/95 backdrop-blur-xl border-b border-white/5"
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/medical"
            className="text-h3 font-bold text-text-on-dark tracking-tight"
          >
            gined<span className="text-gold">.in</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-small text-text-on-dark/70 hover:text-text-on-dark transition-colors font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <Link
              href="/medical#calculator"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 bg-gold text-ink font-semibold text-small rounded-[var(--radius-sm)] hover:bg-gold/90 transition-colors"
            >
              Check my chances
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-text-on-dark p-2"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Overlay Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-[calc(var(--z-nav)-1)] bg-ink-deep flex flex-col items-start justify-center px-10 gap-6 lg:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-display text-text-on-dark hover:text-gold transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8">
            <Link
              href="/medical#calculator"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold text-ink font-bold text-h4 rounded-[var(--radius-md)]"
            >
              Check my chances
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
