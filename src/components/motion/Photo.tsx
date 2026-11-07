import Image from "next/image";
import { PHOTOS, unsplashSrc, type PhotoKey } from "@/content/images";

const VEILS = {
  bottom: "bg-gradient-to-t from-ink-deep via-ink-deep/40 to-ink-deep/10",
  full: "bg-ink-deep/72",
  left: "bg-gradient-to-r from-ink-deep/95 via-ink-deep/65 to-ink-deep/15",
  hero: "bg-[linear-gradient(90deg,rgba(8,26,36,0.95)_0%,rgba(8,26,36,0.7)_45%,rgba(8,26,36,0.25)_100%),linear-gradient(0deg,rgba(8,26,36,0.9)_0%,transparent_35%)]",
  tile: "bg-gradient-to-t from-ink-deep via-ink-deep/75 to-ink-deep/5",
  soft: "bg-gradient-to-t from-ink-deep/70 via-transparent to-transparent",
  none: "",
} as const;

/**
 * A site photo with the house treatment: an ink veil, film grain, and optionally a slow scroll
 * parallax and a wipe-in reveal. It fills its positioned parent.
 */
export default function Photo({
  name,
  sizes = "100vw",
  priority = false,
  parallax = false,
  reveal = false,
  overlay = "bottom",
  className = "",
  decorative = false,
}: {
  name: PhotoKey;
  sizes?: string;
  priority?: boolean;
  parallax?: boolean;
  reveal?: boolean;
  overlay?: keyof typeof VEILS;
  className?: string;
  /** Set when the photo is pure atmosphere behind text, so screen readers skip it. */
  decorative?: boolean;
}) {
  const photo = PHOTOS[name];
  return (
    <div className={`absolute inset-0 overflow-hidden grain ${className}`} {...(reveal ? { "data-reveal": "clip" } : {})}>
      <Image
        src={unsplashSrc(photo)}
        alt={decorative ? "" : photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={70}
        className={`object-cover ${parallax ? "parallax" : ""}`}
      />
      {VEILS[overlay] && <div aria-hidden className={`absolute inset-0 ${VEILS[overlay]}`} />}
    </div>
  );
}
