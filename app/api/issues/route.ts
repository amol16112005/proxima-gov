import { NextResponse } from "next/server";
import { jsonError, withCacheHeaders } from "@/lib/apiResponse";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import {
  createIssue,
  getAllIssues,
  getIssuesByCitizen,
  getMpDashboardIssues,
} from "@/lib/lifecycleStore";
import { validateIssueSubmission } from "@/lib/validation";

export async function GET(request: Request) {
  await ensureDataHydrated();
  const { searchParams } = new URL(request.url);
  const publicView = searchParams.get("public") === "true";

  if (publicView) {
    return withCacheHeaders(
      NextResponse.json({ issues: getAllIssues() }),
      60
    );
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
  const parsed = validateIssueSubmission(body);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  const { category, title, description, location, submissionPhotoUrl } = parsed.data;
  const issue = await createIssue({
    citizenId: session.id,
    citizenName: session.name,
    constituencyId: session.constituencyId,
    category,
    title,
    description,
    location,
    submissionPhotoUrl,
  });

  return NextResponse.json({ issue }, { status: 201 });
}