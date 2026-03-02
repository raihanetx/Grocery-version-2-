import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Force webpack instead of turbopack
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
