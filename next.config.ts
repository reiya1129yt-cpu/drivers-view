import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    // High stale times reduce how often the client tries to refetch RSC
    // payloads, which is what triggers the premature router dispatch on
    // sandbox env-var reloads.
    staleTimes: {
      dynamic: 60,
      static: 600,
    },
  },
};

export default nextConfig;
