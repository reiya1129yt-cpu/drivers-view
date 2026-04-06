import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 600,
    },
  },
};

export default nextConfig;
