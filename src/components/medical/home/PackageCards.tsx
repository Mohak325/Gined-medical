import Link from "next/link";
import { Check, ArrowUpRight } from "lucide-react";
import packagesData from "@/content/packages.json";

export const packages = packagesData.packages;
/** True while package prices in packages.json are placeholders awaiting confirmation. */
export const PRICES_INDICATIVE = packages.some((pkg) => pkg.price_note);

export function sessionsLabel(count: number) {
  return count === -1 ? "Unlimited sessions" : `${count} session${count > 1 ? "s" : ""}`;
}

/** The three package cards, shared by the homepage preview and the pricing page. */
export default function PackageCards({ featureLimit, source }: { featureLimit?: number; source: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3 items-stretch">
      {packages.map((pkg) => {
        const features = featureLimit ? pkg.features.slice(0, featureLimit) : pkg.features;
        const dark = pkg.recommended;
        return (
          <article
            key={pkg.id}
            className={`relative flex flex-col rounded-[var(--radius-lg)] border p-7 md:p-8 ${
              dark ? "bg-ink text-text-on-dark border-ink" : "bg-paper-bright border-hairline"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className={`text-h3 ${dark ? "" : "text-ink"}`}>{pkg.name}</h3>
              {pkg.recommended && (
                <span className="text-micro font-semibold uppercase tracking-widest bg-gold text-ink px-3 py-1 rounded-full">Recommended</span>
              )}
            </div>
            <p className={`text-small mt-1 ${dark ? "text-text-on-dark/65" : "text-text-muted"}`}>
              {sessionsLabel(pkg.session_count)} · {pkg.duration_min} min each
            </p>
            <p className={`text-display tabular-nums mt-6 ${dark ? "" : "text-ink"}`}>₹{pkg.price.toLocaleString("en-IN")}</p>

            <ul className="mt-6 space-y-3 flex-grow">
              {features.map((feature) => (
                <li key={feature} className={`flex items-start gap-3 text-small ${dark ? "text-text-on-dark/85" : "text-text-main"}`}>
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? "text-gold" : "text-safe"}`} aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={`/medical/book?package=${pkg.id}&source=${source}`}
              className={`mt-8 inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full font-semibold text-small transition-colors ${
                dark ? "bg-gold text-ink hover:bg-gold/90" : "bg-ink text-text-on-dark hover:bg-ink-soft"
              }`}
            >
              Choose {pkg.name}
              <ArrowUpRight className="w-4 h-4" aria-hidden />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
