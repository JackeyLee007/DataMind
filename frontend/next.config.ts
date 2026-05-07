import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  distDir: '.next',
  assetPrefix: process.env.NODE_ENV === 'production' ? undefined : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
