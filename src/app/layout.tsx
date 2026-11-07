import type { Metadata } from "next";
import { Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// Headline serif; interface text stays in Switzer (loaded in globals.css).
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "gined.in — NEET Medical Counselling",
  description:
    "See which MBBS and BDS colleges your NEET rank can reach, from official 2025 and 2026 cutoffs, seat counts and published fees. Then plan choice filling with a counsellor.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={serif.variable}>
      <body className="font-sans antialiased">
        {children}
        {/* Vercel Web Analytics: cookieless page views, plus the finder and booking events. */}
        <Analytics />
      </body>
    </html>
  );
}
