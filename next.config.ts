import type { NextConfig } from "next";
import { productionHeaders } from "./backend/lib/security/headers";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["mongodb", "@google/generative-ai"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 96, 128, 256],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [...productionHeaders()],
      },
      {
        source: "/faq",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=7200" }],
      },
      {
        source: "/transparency",
        headers: [{ key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=120" }],
      },
    ];
  },
};

export default nextConfig;