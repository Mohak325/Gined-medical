import type { CollegePhoto } from "@/lib/medical/mockData";
import CollegeCover from "./CollegeCover";

// Wikimedia only serves thumbnails at these widths; any other width fails.
const WIDTHS = [330, 500, 960, 1280, 1920];

/** The image addresses for a photo: thumbnails narrower than the original, or the original itself. */
export function photoSources(photo: CollegePhoto) {
  const widths = photo.thumb ? WIDTHS.filter((w) => w < photo.width) : [];
  if (!photo.thumb || widths.length === 0) return { src: photo.src ?? photo.thumb!.replace("{w}", "960"), srcSet: undefined };
  return {
    src: photo.thumb.replace("{w}", String(widths.includes(960) ? 960 : widths[widths.length - 1])),
    srcSet: widths.map((w) => `${photo.thumb!.replace("{w}", String(w))} ${w}w`).join(", "),
  };
}

/** "Author · Licence", with talk-page clutter removed from Commons user names. */
export function creditText(photo: CollegePhoto) {
  const author = (photo.author ?? "Unknown author").replace(/\s*\((talk|contribs?)[^)]*\)/gi, "").trim();
  return `${author.length > 48 ? author.slice(0, 46) + "…" : author} · ${photo.license}`;
}

/**
 * A college's photo when one has been found and checked, otherwise its generated cover. Photos
 * are linked from Wikimedia Commons and always carry their credit, as their licences require.
 * Fills its positioned parent.
 */
export default function CollegeImage({
  college,
  sizes,
  priority = false,
  credit = "chip",
  className = "",
  coverLabel = true,
  imgClassName = "",
}: {
  college: { id: string; name: string; type: string; stateCode: string; established?: number; photo?: CollegePhoto | null };
  sizes: string;
  priority?: boolean;
  /** "chip": a small credit on the photo; "none": the page shows the credit elsewhere. */
  credit?: "chip" | "none";
  className?: string;
  coverLabel?: boolean;
  /** Extra classes for the photo itself, such as the scroll parallax. */
  imgClassName?: string;
}) {
  const { photo } = college;
  if (!photo) {
    return <CollegeCover id={college.id} type={college.type} stateCode={college.stateCode} established={college.established} showLabel={coverLabel} className={`w-full h-full ${className} ${imgClassName}`} />;
  }
  const { src, srcSet } = photoSources(photo);
  return (
    <span className={`relative block w-full h-full overflow-hidden bg-ink ${className}`}>
      {/* Linked straight from Wikimedia's image servers at their standard widths, so no optimiser is needed. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={`${college.name}`}
        width={photo.width}
        height={photo.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="no-referrer"
        className={`absolute inset-0 w-full h-full object-cover ${imgClassName}`}
      />
      {credit === "chip" && (
        <span className="absolute right-2 bottom-2 z-[1] max-w-[85%] truncate rounded-full bg-ink-deep/60 backdrop-blur-sm px-2 py-0.5 text-[10px] leading-4 text-white/85">
          {creditText(photo)}
        </span>
      )}
    </span>
  );
}
