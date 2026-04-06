import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  // Disable the HMR server-component cache. When enabled (the default),
  // Next.js dispatches a router action to the client on every env-var reload
  // to invalidate the RSC cache. That action arrives before the App Router's
  // async initialize() resolves when the page has been idle, causing the
  // "Router action dispatched before initialization" error. Disabling this
  // cache means env reloads no longer trigger a router dispatch.
  serverComponentsHmrCache: false,
  experimental: {
    staleTimes: {
      dynamic: 60,
      static: 600,
    },
  },
};

export default nextConfig;
