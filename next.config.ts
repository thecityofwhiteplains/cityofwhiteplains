import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  turbopack: {
    // Ensure the project root is this repo for Turbopack builds
    root: __dirname,
  },
};

export default nextConfig;
