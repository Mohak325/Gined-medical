import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

// Headline serif; interface text stays in Switzer (loaded in globals.css).
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

const DESCRIPTION =
  "See which MBBS and BDS colleges your NEET rank can reach, from official 2025 and 2026 cutoffs, seat counts and published fees. Then plan choice filling with a counsellor.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "gined.in — NEET Medical Counselling",
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_IN", description: DESCRIPTION },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={serif.variable}>
      <head>
        {/* Interface font. Linked here, not @import-ed from CSS, so it downloads in parallel with the page's styles. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600,700&display=swap" />
      </head>
      <body className="font-sans antialiased">
        {children}
        {/* Vercel Web Analytics: cookieless page views, plus the finder and booking events. */}
        <Analytics />
      </body>
    </html>
  );
}
