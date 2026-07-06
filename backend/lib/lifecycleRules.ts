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

function rawProgressSubStage(stage: ProgressSubStage): boolean {
  return stage === "construction" || stage === "quality-inspection" || stage === "completed";
}

export function hasWorkInProgressConfirmed(issue: DevelopmentIssue): boolean {
  if (!hasBeforeWorkPhoto(issue)) return false;
  return rawProgressSubStage(issue.progressSubStage);
}

export function hasInspectionConfirmed(issue: DevelopmentIssue): boolean {
  if (!hasBeforeWorkPhoto(issue)) return false;
  const stage = issue.progressSubStage;
  return stage === "quality-inspection" || stage === "completed";
}

export function canUndoWorkInProgress(issue: DevelopmentIssue): boolean {
  return isActiveWorkStage(issue) && hasWorkInProgressConfirmed(issue);
}

export function canUndoInspection(issue: DevelopmentIssue): boolean {
  return isActiveWorkStage(issue) && hasInspectionConfirmed(issue);
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

function syncBudgetSpent(issue: DevelopmentIssue): void {
  if (issue.budget && issue.approval) {
    issue.budget.spent = Math.round(issue.approval.budget * (issue.currentProgress / 100));
  }
}

function stripAfterWorkPhotos(issue: DevelopmentIssue): void {
  const beforeCount = issue.progressImages.length;
  issue.progressImages = issue.progressImages.filter((img) => !img.isCompletion);
  if (issue.progressImages.length !== beforeCount) {
    renumberProgressImageWeeks(issue);
    issue.afterImageLabel = undefined;
  }
}

/** Undo WIP, inspection, and after-work photo when the before-work photo is removed. */
export function applyBeforeWorkPhotoRemovalCascade(issue: DevelopmentIssue): boolean {
  const hadAfterWork = hasAfterWorkPhoto(issue);
  const hadProcessProgress =
    rawProgressSubStage(issue.progressSubStage) ||
    issue.currentProgress > 0 ||
    hadAfterWork;

  stripAfterWorkPhotos(issue);

  issue.progressSubStage = "planning";
  issue.currentProgress = 0;
  issue.afterImageLabel = undefined;
  syncBudgetSpent(issue);

  if (shouldRevertWorkCompletion(issue.stage, canMarkWorkComplete(issue))) {
    issue.stage = "in-progress";
  } else if (isActiveWorkStage(issue)) {
    issue.stage = "in-progress";
  }

  return hadProcessProgress || hadAfterWork;
}

export function applyUndoInspection(issue: DevelopmentIssue): void {
  issue.progressSubStage = "construction";
  issue.currentProgress = 65;
  stripAfterWorkPhotos(issue);
  syncBudgetSpent(issue);
}

export function applyUndoWorkInProgress(issue: DevelopmentIssue): void {
  issue.progressSubStage = "planning";
  issue.currentProgress = hasBeforeWorkPhoto(issue) ? 20 : 0;
  stripAfterWorkPhotos(issue);
  syncBudgetSpent(issue);
}

/** Fix stale DB rows where process advanced without a before-work photo. */
export function needsWorkProcessRepair(issue: DevelopmentIssue): boolean {
  if (hasBeforeWorkPhoto(issue)) {
    return hasAfterWorkPhoto(issue) && !hasInspectionConfirmed(issue);
  }
  return (
    rawProgressSubStage(issue.progressSubStage) ||
    hasAfterWorkPhoto(issue) ||
    issue.currentProgress > 0
  );
}

export function repairWorkProcessState(issue: DevelopmentIssue): boolean {
  if (!needsWorkProcessRepair(issue)) return false;

  if (!hasBeforeWorkPhoto(issue)) {
    applyBeforeWorkPhotoRemovalCascade(issue);
    return true;
  }

  stripAfterWorkPhotos(issue);
  if (issue.progressSubStage === "quality-inspection" || issue.progressSubStage === "completed") {
    issue.progressSubStage = "construction";
    issue.currentProgress = 65;
  }
  syncBudgetSpent(issue);
  return true;
}

export function renumberProgressImageWeeks(issue: DevelopmentIssue): void {
  issue.progressImages.forEach((img, index) => {
    img.week = index + 1;
  });
}