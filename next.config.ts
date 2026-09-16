import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // any /images/** path with any cache-busting query (?v=2, ?v=3, ...)
    localPatterns: [{ pathname: "/images/**" }],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
