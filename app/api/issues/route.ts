import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import {
  createIssue,
  getAllIssues,
  getIssuesByCitizen,
  getMpDashboardIssues,
} from "@/lib/lifecycleStore";

export async function GET(request: Request) {
  await ensureDataHydrated();
  const { searchParams } = new URL(request.url);
  const publicView = searchParams.get("public") === "true";

  if (publicView) {
    return NextResponse.json({ issues: getAllIssues() });
  }

  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const issues =
    session.role === "citizen"
      ? getIssuesByCitizen(session.id)
      : getMpDashboardIssues(session.constituencyId);

  return NextResponse.json({ issues });
}

export async function POST(request: Request) {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { category, title, description, location } = body as {
    category: string;
    title: string;
    description: string;
    location: string;
  };

  if (!category || !title?.trim() || !description?.trim() || !location?.trim()) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }

  const issue = createIssue({
    citizenId: session.id,
    citizenName: session.name,
    constituencyId: session.constituencyId,
    category,
    title: title.trim(),
    description: description.trim(),
    location: location.trim(),
  });

  return NextResponse.json({ issue }, { status: 201 });
}