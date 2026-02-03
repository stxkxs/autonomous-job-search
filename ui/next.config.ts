import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Allow reading from output directory for imports
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
