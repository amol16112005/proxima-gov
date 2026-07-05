import { NextResponse } from "next/server";
import { getConstituencyById } from "@/data/constituencies";
import { getSession } from "@/lib/auth/session";
import { getLiveProjectsForConstituency } from "@/lib/datagovindia";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const constituencyId = searchParams.get("constituencyId");

  const session = await getSession();
  const id = constituencyId ?? session?.constituencyId;

  if (!id) {
    return NextResponse.json({ error: "constituencyId required" }, { status: 400 });
  }

  const constituency = getConstituencyById(id);
  if (!constituency) {
    return NextResponse.json({ error: "Unknown constituency" }, { status: 404 });
  }

  const { projects, source } = await getLiveProjectsForConstituency(id);

  return NextResponse.json({
    constituency: constituency.name,
    source,
    projects,
    // Merge with static seed when live data is sparse
    merged: [...projects, ...constituency.projects],
  });
}