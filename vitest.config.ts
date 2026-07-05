import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e"],
  },
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "frontend/components"),
      "@/context": path.resolve(__dirname, "frontend/context"),
      "@/lib": path.resolve(__dirname, "backend/lib"),
      "@/data": path.resolve(__dirname, "backend/data"),
      "@/app": path.resolve(__dirname, "frontend/styles"),
      "@/frontend": path.resolve(__dirname, "frontend"),
      "@/backend": path.resolve(__dirname, "backend"),
      "@": path.resolve(__dirname, "."),
    },
  },
});