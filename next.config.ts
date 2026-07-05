import type { NextConfig } from "next";
import { productionHeaders } from "./backend/lib/security/headers";

const nextConfig: NextConfig = {
  // Standalone only for Docker self-hosting (set DOCKER_BUILD=1 in Dockerfile)
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["better-sqlite3"],
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