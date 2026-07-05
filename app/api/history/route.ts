import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  cloudStatus,
  ensureDataHydrated,
  getActivityForCitizen,
  getActivityForConstituency,
} from "@/lib/cloud";

export async function GET(request: Request) {
  await ensureDataHydrated();

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 50)));

  const entries =
    session.role === "citizen"
      ? getActivityForCitizen(session.id, limit)
      : getActivityForConstituency(session.constituencyId, limit);

  return NextResponse.json({
    entries,
    cloud: cloudStatus(),
    scope: session.role === "citizen" ? "citizen" : "constituency",
  });
}