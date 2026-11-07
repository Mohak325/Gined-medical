import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // The success stories page held invented testimonials and was removed; real stories will come back on the homepage.
  async redirects() {
    return [{ source: "/medical/success-stories", destination: "/medical", permanent: false }];
  },
};

export default nextConfig;
