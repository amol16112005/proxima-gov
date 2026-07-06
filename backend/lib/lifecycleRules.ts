import type {
  DevelopmentIssue,
  LifecycleStage,
  ProgressPhotoMilestone,
  ProgressSubStage,
} from "@/data/lifecycleTypes";

const REVERTIBLE_AFTER_PHOTO_REMOVAL: LifecycleStage[] = [
  "citizen-verification",
  "mp-review",
  "completed",
  "impact-analysis",
];

export function isActiveWorkStage(issue: DevelopmentIssue): boolean {
  return issue.stage === "work-started" || issue.stage === "in-progress";
}

/** Before-work site photo (stored as planning milestone). */
export function hasBeforeWorkPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.milestone === "planning");
}

/** After-work / completion site photo. */
export function hasAfterWorkPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.isCompletion);
}

/** @deprecated Use hasBeforeWorkPhoto */
export function hasPlanningPhoto(issue: DevelopmentIssue): boolean {
  return hasBeforeWorkPhoto(issue);
}

/** @deprecated Use hasAfterWorkPhoto */
export function hasCompletionPhoto(issue: DevelopmentIssue): boolean {
  return hasAfterWorkPhoto(issue);
}

export function hasQualityInspectionPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.milestone === "quality-inspection");
}

export function hasMilestonePhoto(
  issue: DevelopmentIssue,
  milestone: ProgressPhotoMilestone
): boolean {
  return issue.progressImages.some((img) => img.milestone === milestone);
}

/** Before + after work photos required before citizen verification. */
export function canMarkWorkComplete(issue: DevelopmentIssue): boolean {
  return hasBeforeWorkPhoto(issue) && hasAfterWorkPhoto(issue);
}

export function canUploadBeforeWorkPhoto(issue: DevelopmentIssue): boolean {
  if (hasBeforeWorkPhoto(issue) || !isActiveWorkStage(issue)) return false;
  return true;
}

/** @deprecated Use canUploadBeforeWorkPhoto */
export function canUploadPlanningPhoto(issue: DevelopmentIssue): boolean {
  return canUploadBeforeWorkPhoto(issue);
}

export function canUploadAfterWorkPhoto(issue: DevelopmentIssue): boolean {
  return (
    hasBeforeWorkPhoto(issue) &&
    !hasAfterWorkPhoto(issue) &&
    isActiveWorkStage(issue)
  );
}

/** @deprecated Use canUploadAfterWorkPhoto */
export function canUploadCompletionPhoto(issue: DevelopmentIssue): boolean {
  return canUploadAfterWorkPhoto(issue);
}

/** QA milestone removed from simplified work flow. */
export function canUploadQualityInspectionPhoto(_issue: DevelopmentIssue): boolean {
  return false;
}

export function requiresPlanningPhotoForSubStage(_subStage: ProgressSubStage): boolean {
  return false;
}

/** MPs no longer advance sub-stages manually — only mark complete when photos are ready. */
export function canAdvanceToSubStage(issue: DevelopmentIssue, target: ProgressSubStage): boolean {
  return target === "completed" && canMarkWorkComplete(issue);
}

export function shouldRevertWorkCompletion(stage: LifecycleStage, canComplete: boolean): boolean {
  return REVERTIBLE_AFTER_PHOTO_REMOVAL.includes(stage) && !canComplete;
}

export function applyWorkCompletionRevert(issue: DevelopmentIssue): void {
  issue.stage = "in-progress";
  issue.progressSubStage = "planning";
  issue.currentProgress = hasBeforeWorkPhoto(issue) ? 50 : 0;
  issue.afterImageLabel = undefined;
  if (issue.budget && issue.approval) {
    const pct = issue.currentProgress / 100;
    issue.budget.spent = Math.round(issue.approval.budget * pct);
  }
}

export function renumberProgressImageWeeks(issue: DevelopmentIssue): void {
  issue.progressImages.forEach((img, index) => {
    img.week = index + 1;
  });
}