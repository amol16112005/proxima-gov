import type {
  DevelopmentIssue,
  LifecycleStage,
  ProgressPhotoMilestone,
  ProgressSubStage,
} from "@/data/lifecycleTypes";
import { SUB_STAGE_CONFIG } from "@/data/lifecycleTypes";

const REVERTIBLE_AFTER_PHOTO_REMOVAL: LifecycleStage[] = [
  "citizen-verification",
  "mp-review",
  "completed",
  "impact-analysis",
];

const SUB_STAGE_ORDER = SUB_STAGE_CONFIG.map((s) => s.key);

export function hasPlanningPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.milestone === "planning");
}

export function hasQualityInspectionPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.milestone === "quality-inspection");
}

export function hasCompletionPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.isCompletion);
}

export function hasMilestonePhoto(
  issue: DevelopmentIssue,
  milestone: ProgressPhotoMilestone
): boolean {
  return issue.progressImages.some((img) => img.milestone === milestone);
}

/** All three systematic photos required before final submission to citizens. */
export function canMarkWorkComplete(issue: DevelopmentIssue): boolean {
  return (
    hasPlanningPhoto(issue) && hasQualityInspectionPhoto(issue) && hasCompletionPhoto(issue)
  );
}

export function canUploadPlanningPhoto(issue: DevelopmentIssue): boolean {
  if (hasPlanningPhoto(issue)) return false;
  // Allow catch-up uploads at any active work stage (e.g. after photo removal or legacy issues).
  return issue.stage === "work-started" || issue.stage === "in-progress";
}

export function canUploadQualityInspectionPhoto(issue: DevelopmentIssue): boolean {
  if (!hasPlanningPhoto(issue) || hasQualityInspectionPhoto(issue)) return false;
  return issue.stage === "in-progress" && issue.progressSubStage === "quality-inspection";
}

export function canUploadCompletionPhoto(issue: DevelopmentIssue): boolean {
  return (
    hasPlanningPhoto(issue) &&
    hasQualityInspectionPhoto(issue) &&
    !hasCompletionPhoto(issue) &&
    (issue.stage === "work-started" || issue.stage === "in-progress")
  );
}

export function requiresPlanningPhotoForSubStage(subStage: ProgressSubStage): boolean {
  const planningIndex = SUB_STAGE_ORDER.indexOf("planning");
  const targetIndex = SUB_STAGE_ORDER.indexOf(subStage);
  return targetIndex > planningIndex;
}

export function canAdvanceToSubStage(issue: DevelopmentIssue, target: ProgressSubStage): boolean {
  if (target === "completed") return canMarkWorkComplete(issue);
  if (requiresPlanningPhotoForSubStage(target) && !hasPlanningPhoto(issue)) {
    return false;
  }
  return true;
}

/** True when MP photo removal should move the issue back to in-progress (not complete). */
export function shouldRevertWorkCompletion(stage: LifecycleStage, canComplete: boolean): boolean {
  return REVERTIBLE_AFTER_PHOTO_REMOVAL.includes(stage) && !canComplete;
}

export function applyWorkCompletionRevert(issue: DevelopmentIssue): void {
  issue.stage = "in-progress";
  issue.progressSubStage = "quality-inspection";
  issue.currentProgress = 90;
  issue.afterImageLabel = undefined;
  if (issue.budget && issue.approval) {
    issue.budget.spent = Math.round(issue.approval.budget * 0.9);
  }
}

export function renumberProgressImageWeeks(issue: DevelopmentIssue): void {
  issue.progressImages.forEach((img, index) => {
    img.week = index + 1;
  });
}