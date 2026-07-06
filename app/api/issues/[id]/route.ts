import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { getMpById } from "@/data/mpRegistry";
import type { MpReviewDecision, ProgressSubStage } from "@/data/lifecycleTypes";
import {
  canCitizenAccessIssueApi,
  canMpAccessIssueApi,
  sanitizeIssueForPublic,
} from "@/lib/auth/issueAccess";
import { getSession } from "@/lib/auth/session";
import {
  addProgressImage,
  getIssueById,
  removeProgressImage,
  mpApproveIssue,
  mpAssignWork,
  mpReleaseTender,
  mpReviewIssue,
  mpStartWork,
  updateProgress,
} from "@/lib/lifecycleStore";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDataHydrated();
  const session = await getSession();
  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.role === "citizen") {
    if (!canCitizenAccessIssueApi(issue, session)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ issue });
  }

  if (session.role === "mp") {
    if (!canMpAccessIssueApi(issue, session)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ issue: sanitizeIssueForPublic(issue) });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "mp") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue || issue.constituencyId !== session.constituencyId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const { action } = body as { action: string };
  const mp = getMpById(session.mpId ?? session.id);

  let updated;
  switch (action) {
    case "approve":
      updated = mpApproveIssue(
        id,
        mp?.name ?? session.name,
        (body.fund as string) ?? "MPLADS",
        (body.budget as number) ?? issue.aiAnalysis?.estimatedCost ?? 10_00_000
      );
      break;
    case "assign":
      updated = mpAssignWork(
        id,
        body.contractor as string,
        body.officer as string,
        body.estimatedDays as number,
        body.deadline as string
      );
      break;
    case "tender":
      updated = mpReleaseTender(id);
      break;
    case "start":
      updated = mpStartWork(id);
      break;
    case "progress":
      updated = updateProgress(id, body.subStage as ProgressSubStage);
      if (!updated && body.subStage === "completed") {
        return NextResponse.json(
          {
            error:
              "Upload at least one progress photo and a completion (after-work) photo before marking work complete.",
            code: "PHOTOS_REQUIRED",
          },
          { status: 400 }
        );
      }
      break;
    case "addImage": {
      const imageUrl = body.imageUrl as string | undefined;
      if (!imageUrl || !/^data:image\/(jpeg|png|webp);base64,/.test(imageUrl)) {
        return NextResponse.json(
          { error: "Please select a valid photo to upload.", code: "IMAGE_REQUIRED" },
          { status: 400 }
        );
      }
      if (imageUrl.length > 700_000) {
        return NextResponse.json(
          { error: "Photo is too large. Please use a smaller image.", code: "IMAGE_TOO_LARGE" },
          { status: 400 }
        );
      }
      updated = addProgressImage(
        id,
        body.label as string,
        body.caption as string,
        Boolean(body.isCompletion),
        imageUrl
      );
      if (!updated && body.isCompletion) {
        return NextResponse.json(
          { error: "Completion photo already uploaded for this issue.", code: "COMPLETION_EXISTS" },
          { status: 400 }
        );
      }
      break;
    }
    case "removeImage": {
      const imageIndex = body.imageIndex;
      if (typeof imageIndex !== "number" || !Number.isInteger(imageIndex) || imageIndex < 0) {
        return NextResponse.json(
          { error: "Please specify which photo to remove.", code: "IMAGE_INDEX_REQUIRED" },
          { status: 400 }
        );
      }
      updated = removeProgressImage(id, imageIndex);
      if (!updated) {
        return NextResponse.json(
          { error: "Photo not found or could not be removed.", code: "IMAGE_NOT_FOUND" },
          { status: 400 }
        );
      }
      break;
    }
    case "mpReview":
      updated = mpReviewIssue(
        id,
        body.decision as MpReviewDecision,
        mp?.name ?? session.name,
        body.note as string | undefined
      );
      if (!updated) {
        return NextResponse.json(
          { error: "Issue is not awaiting MP review.", code: "NOT_IN_REVIEW" },
          { status: 400 }
        );
      }
      break;
    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  if (!updated) {
    return NextResponse.json({ error: "Action could not be applied." }, { status: 400 });
  }

  return NextResponse.json({ issue: updated });
}