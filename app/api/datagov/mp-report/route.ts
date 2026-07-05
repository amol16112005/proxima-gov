import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { buildMpTransparencyReport } from "@/lib/datagovindia/mpReport";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await buildMpTransparencyReport(session.constituencyId);
  if (!report) {
    return NextResponse.json({ error: "Report not available" }, { status: 404 });
  }

  return NextResponse.json({ report });
}