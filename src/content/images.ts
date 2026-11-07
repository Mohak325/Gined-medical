/**
 * Site photography. Every photo is from Unsplash under the free Unsplash License (unsplash.com/license),
 * served from images.unsplash.com. Unsplash+ (plus.unsplash.com) photos are paid and must not be added.
 * No photo shows a person presented as a gined.in student, counsellor or testimonial.
 */
export interface SitePhoto {
  /** The part after "photo-" in the images.unsplash.com address. */
  id: string;
  alt: string;
  /** The photo's page on Unsplash, for credit. */
  page: string;
}

const photo = (id: string, alt: string, slug: string): SitePhoto => ({ id, alt, page: `https://unsplash.com/photos/${slug}` });

export const PHOTOS = {
  operatingTheatre: photo("1504439468489-c8920d796a29", "A surgical team at work in a dim operating theatre", "y5hQCIn1c6o"),
  surgeons: photo("1551601651-2a8555f1a136", "Two surgeons operating under bright lights", "tMFeatBSS4s"),
  libraryStudy: photo("1741699428220-65f37f3fbbcb", "A student studying at a long library table", "klbApl9mxr0"),
  laptopStethoscope: photo("1576091160550-2173dba999ef", "Hands typing on a laptop beside a stethoscope", "NFvdKIhxYlU"),
  doctorsTablet: photo("1758691463203-cce9d415b2b5", "Two doctors checking a tablet together", "2kopEHjST-g"),
  grandLibrary: photo("1721702754494-fdd7189f946c", "A grand library hall with rows of readers", "r0U2y0HhdGE"),
  hospitalCorridor: photo("1517120026326-d87759a7b63b", "A doctor in scrubs walking down a hospital corridor", "ZCO_5Y29s8k"),
  wardPractice: photo("1783519890730-3436fd0bf965", "Medical students practising on a training mannequin in a ward", "tz6R39IjUQE"),
  graduation: photo("1541339907198-e08756dedf3f", "Graduates throwing their caps into the sky", "_kd5cxwZOK4"),
  microscope: photo("1630959305790-4c956ce6c0b6", "A researcher looking through a microscope", "JxoWb7wHqnA"),
  heartModel: photo("1623134915837-d2fdb4f59035", "An anatomical model of a human heart", "MhFJNz_D8t4"),
  brainModel: photo("1559757148-5c350d0d3c56", "An anatomical model of a human brain", "3KGF9R_0oHs"),
  anatomyDrawing: photo("1729339984218-1f1e3b0d13ff", "An anatomical drawing of the human skeleton and muscles", "F7_KSrZofbQ"),
} as const;

export type PhotoKey = keyof typeof PHOTOS;

/**
 * Asks Unsplash for a 2400px JPEG rather than the original (often 5 MB or more), so the image
 * optimizer fetches about a tenth as much and never times out on a slow first request.
 */
export const unsplashSrc = (p: SitePhoto) => `https://images.unsplash.com/photo-${p.id}?w=2400&q=80&fm=jpg&fit=max`;
