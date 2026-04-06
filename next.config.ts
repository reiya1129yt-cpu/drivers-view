import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable React strict mode — double-invocation causes timing issues
  // where the router receives HMR actions before the second render cycle
  // completes initialization in the sandbox environment.
  reactStrictMode: false,
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
};

export default nextConfig;
