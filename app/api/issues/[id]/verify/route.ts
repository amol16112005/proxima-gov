import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { citizenOwnsIssue } from "@/lib/auth/issueAccess";
import { getSession } from "@/lib/auth/session";
import { citizenVerify, getIssueById } from "@/lib/lifecycleStore";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const vote = body.vote as "yes" | "no";

  if (vote !== "yes" && vote !== "no") {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const issue = getIssueById(id);
  if (!issue || !citizenOwnsIssue(issue, session.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await citizenVerify(id, session.id, vote);
  if (!updated) {
    return NextResponse.json({ error: "Verification not available for this issue" }, { status: 400 });
  }

  return NextResponse.json({ issue: updated });
}