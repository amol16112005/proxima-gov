import { NextResponse } from "next/server";
import {
  cloudStatus,
  ensureDataHydrated,
  getStorageLocation,
  getStorageProvider,
} from "@/lib/cloud";
import { getMongoDb } from "@/lib/cloud/mongo";
import { getDb } from "@/lib/cloud/sqlite";

export async function GET() {
  const status = cloudStatus();

  if (process.env.NODE_ENV !== "development" || !status.enabled) {
    return NextResponse.json(status);
  }

  try {
    await ensureDataHydrated();

    if (getStorageProvider() === "mongodb") {
      const db = await getMongoDb();
      if (!db) {
        return NextResponse.json({ ...status, connected: false });
      }
      await db.listCollections().toArray();
      return NextResponse.json({
        ...status,
        connected: true,
        location: getStorageLocation(),
      });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ ...status, connected: false });
    }

    db.prepare("SELECT value FROM meta WHERE key = ?").get("issue_counter");
    return NextResponse.json({
      ...status,
      connected: true,
      location: getStorageLocation(),
    });
  } catch (err) {
    return NextResponse.json({
      ...status,
      connected: false,
      error: err instanceof Error ? err.message : "Storage ping failed",
    });
  }
}