import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Compress responses
  compress: true,

  // Optimise images served through next/image
  images: {
    remotePatterns: [
      // Django media server (local dev)
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/media/**",
      },
      // Django media server (production — update hostname before go-live)
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_MEDIA_HOSTNAME ?? "api.thegranite.co.zw",
        pathname: "/media/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 3600,
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Feed alias redirects — most readers use /feed or /rss by default
  async redirects() {
    return [
      { source: "/feed",    destination: "/feed.xml", permanent: true },
      { source: "/rss",     destination: "/feed.xml", permanent: true },
      { source: "/rss.xml", destination: "/feed.xml", permanent: true },
    ];
  },

  // Silence the noisy x-powered-by header
  poweredByHeader: false,
};

export default nextConfig;
