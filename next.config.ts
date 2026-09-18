import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // any /images/** path with any cache-busting query (?v=2, ?v=3, ...)
    localPatterns: [{ pathname: "/images/**" }],
  },
  // Bundle the deploy ZIP with the download route's serverless function so
  // the admin panel download button also works on Vercel.
  outputFileTracingIncludes: {
    "/api/admin/download-project": ["./assets/**"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
