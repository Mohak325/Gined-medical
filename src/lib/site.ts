/**
 * The site's public address, for canonical links, the sitemap and share images.
 * Set NEXT_PUBLIC_SITE_URL to override; on Vercel the production domain is used automatically.
 */
const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? (vercelDomain ? `https://${vercelDomain}` : "https://gined.in")
).replace(/\/$/, "");

export const SITE_NAME = "gined.in";
