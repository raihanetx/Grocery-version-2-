import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview panel
  allowedDevOrigins: [
    'localhost',
    '.space.z.ai',
    '.z.ai'
  ],
};

export default nextConfig;
