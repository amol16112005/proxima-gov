import { NextResponse } from "next/server";
import { isSessionSecretConfigured } from "@/lib/auth/sessionSecret";
import { getStorageProvider } from "@/lib/cloud/provider";

export const dynamic = "force-dynamic";

export async function GET() {
  const storage = getStorageProvider();
  return NextResponse.json(
    {
      status: "ok",
      service: "proxima-gov",
      version: process.env.npm_package_version ?? "0.1.0",
      storage,
      sessionSecretConfigured: isSessionSecretConfigured(),
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}