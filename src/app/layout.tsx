import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "gined.in — Medical (NEET) Counselling",
  description:
    "Find which MBBS, BDS, MD, MS colleges you can realistically get into based on your NEET rank. Data-backed shortlisting, seat matrix, and 1-to-1 counselling.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Preload the two above-the-fold Switzer weights */}
        <link
          rel="preload"
          href="https://api.fontshare.com/v2/css?f[]=switzer@700&display=swap"
          as="style"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
