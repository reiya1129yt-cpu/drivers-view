import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Give the router a 30-second grace period before treating a cached RSC
    // response as stale. This prevents 5 simultaneous RSC refetch attempts
    // during the Turbopack recompile window on hot-reload.
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
