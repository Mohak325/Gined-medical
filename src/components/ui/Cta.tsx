import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

const VARIANTS = {
  /** Ink pill with a gold arrow disc: the main action on light backgrounds. */
  ink: "bg-ink text-text-on-dark hover:bg-ink-deep shadow-[0_10px_30px_-10px_rgba(8,26,36,0.6)]",
  /** Gold pill: the main action on dark backgrounds. */
  gold: "bg-gold text-ink hover:bg-[#d4b05c] shadow-[0_10px_30px_-10px_rgba(201,162,75,0.7)]",
  /** Outline on light backgrounds. */
  outline: "border border-border-strong text-ink bg-paper-bright/60 hover:bg-paper-bright",
  /** Outline on dark backgrounds and photos. */
  glass: "border border-white/25 text-text-on-dark bg-white/[0.06] backdrop-blur-md hover:bg-white/[0.12]",
} as const;

const DISC = {
  ink: "bg-gold text-ink",
  gold: "bg-ink text-gold",
  outline: "bg-ink text-gold",
  glass: "bg-white/15 text-text-on-dark",
} as const;

/**
 * The site's call-to-action: a pill with a sliding arrow disc, a light sweep, and a slight lean
 * toward the pointer. One component so every page's buttons feel the same.
 */
export default function Cta({
  href,
  children,
  variant = "ink",
  size = "md",
  arrow = true,
  external = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: "md" | "lg";
  arrow?: boolean;
  external?: boolean;
  className?: string;
}) {
  const sizing = size === "lg" ? "pl-6 pr-2 py-2 text-body" : "pl-5 pr-1.5 py-1.5 text-small";
  const disc = size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const content = (
    <>
      <span className="py-1.5">{children}</span>
      {arrow ? (
        <span className={`${disc} rounded-full flex items-center justify-center transition-transform duration-500 group-hover:rotate-45 ${DISC[variant]}`} aria-hidden>
          <ArrowUpRight className="w-4 h-4" />
        </span>
      ) : (
        <span className="w-1" aria-hidden />
      )}
    </>
  );
  const classes = `group btn-shine inline-flex items-center justify-between gap-3 rounded-full font-semibold transition-colors duration-300 ${sizing} ${VARIANTS[variant]} ${className}`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" data-magnetic="" className={classes}>
      {content}
    </a>
  ) : (
    <Link href={href} data-magnetic="" className={classes}>
      {content}
    </Link>
  );
}
