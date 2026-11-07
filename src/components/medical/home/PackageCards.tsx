import type { CSSProperties } from "react";
import { Check } from "lucide-react";
import Cta from "@/components/ui/Cta";
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
      {packages.map((pkg, index) => {
        const features = featureLimit ? pkg.features.slice(0, featureLimit) : pkg.features;
        const dark = pkg.recommended;
        return (
          <article
            key={pkg.id}
            data-spotlight=""
            data-reveal="up"
            style={{ "--delay": `${index * 120}ms`, ...(dark ? { "--spot": "rgba(201,162,75,0.22)" } : {}) } as CSSProperties}
            className={`group relative flex flex-col rounded-[28px] p-7 md:p-9 transition-transform duration-500 hover:-translate-y-1.5 ${
              dark
                ? "bg-ink text-text-on-dark grain shadow-[0_40px_80px_-30px_rgba(8,26,36,0.6)] ring-1 ring-gold/40 lg:-my-3"
                : "surface-premium"
            }`}
          >
            {dark && <span aria-hidden className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gold/20 blur-3xl" />}
            <div className="flex items-center justify-between gap-4">
              <h3 className={`text-h2 font-[family-name:var(--font-instrument)] font-normal ${dark ? "" : "text-ink"}`}>{pkg.name}</h3>
              {pkg.recommended && (
                <span className="text-micro font-semibold uppercase tracking-widest bg-gold text-ink px-3 py-1 rounded-full">Recommended</span>
              )}
            </div>
            <p className={`text-small mt-1 ${dark ? "text-text-on-dark/65" : "text-text-muted"}`}>
              {sessionsLabel(pkg.session_count)} · {pkg.duration_min} min each
            </p>
            <p className={`text-[clamp(3rem,5vw,4.25rem)] leading-none font-[family-name:var(--font-instrument)] tabular-nums mt-8 ${dark ? "" : "text-ink"}`}>₹{pkg.price.toLocaleString("en-IN")}</p>

            <ul className="mt-6 space-y-3 flex-grow">
              {features.map((feature) => (
                <li key={feature} className={`flex items-start gap-3 text-small ${dark ? "text-text-on-dark/85" : "text-text-main"}`}>
                  <Check className={`w-4 h-4 mt-0.5 shrink-0 ${dark ? "text-gold" : "text-safe"}`} aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            <Cta href={`/medical/book?package=${pkg.id}&source=${source}`} variant={dark ? "gold" : "ink"} className="mt-8 w-full">
              Choose {pkg.name}
            </Cta>
          </article>
        );
      })}
    </div>
  );
}
