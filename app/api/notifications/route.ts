import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getNotificationsByCitizen, markAllRead, markNotificationRead } from "@/lib/notifications";

export async function GET() {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ notifications: getNotificationsByCitizen(session.id) });
}

export async function PATCH(request: Request) {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (body.all) {
    markAllRead(session.id);
    return NextResponse.json({ success: true });
  }
  if (body.id) {
    markNotificationRead(body.id, session.id);
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}