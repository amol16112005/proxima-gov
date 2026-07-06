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

export function hasWorkInProgressConfirmed(issue: DevelopmentIssue): boolean {
  const stage = issue.progressSubStage;
  return stage === "construction" || stage === "quality-inspection" || stage === "completed";
}

export function hasInspectionConfirmed(issue: DevelopmentIssue): boolean {
  const stage = issue.progressSubStage;
  return stage === "quality-inspection" || stage === "completed";
}

export function canConfirmWorkInProgress(issue: DevelopmentIssue): boolean {
  return (
    isActiveWorkStage(issue) &&
    hasBeforeWorkPhoto(issue) &&
    !hasWorkInProgressConfirmed(issue)
  );
}

export function canConfirmInspection(issue: DevelopmentIssue): boolean {
  return (
    isActiveWorkStage(issue) &&
    hasWorkInProgressConfirmed(issue) &&
    !hasInspectionConfirmed(issue)
  );
}

export function canUploadAfterWorkPhoto(issue: DevelopmentIssue): boolean {
  return (
    hasBeforeWorkPhoto(issue) &&
    hasInspectionConfirmed(issue) &&
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

/** MPs advance only the two work-process checkpoints, then mark complete when photos are ready. */
export function canAdvanceToSubStage(issue: DevelopmentIssue, target: ProgressSubStage): boolean {
  if (target === "construction") return canConfirmWorkInProgress(issue);
  if (target === "quality-inspection") return canConfirmInspection(issue);
  if (target === "completed") return canMarkWorkComplete(issue);
  return false;
}

export function shouldRevertWorkCompletion(stage: LifecycleStage, canComplete: boolean): boolean {
  return REVERTIBLE_AFTER_PHOTO_REMOVAL.includes(stage) && !canComplete;
}

export function applyWorkCompletionRevert(issue: DevelopmentIssue): void {
  issue.stage = "in-progress";
  if (!hasBeforeWorkPhoto(issue)) {
    issue.progressSubStage = "planning";
    issue.currentProgress = 0;
  } else {
    issue.progressSubStage = "quality-inspection";
    issue.currentProgress = 90;
  }
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