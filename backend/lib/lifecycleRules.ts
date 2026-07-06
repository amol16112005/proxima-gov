import type { DevelopmentIssue, LifecycleStage } from "@/data/lifecycleTypes";

const REVERTIBLE_AFTER_PHOTO_REMOVAL: LifecycleStage[] = [
  "citizen-verification",
  "mp-review",
  "completed",
  "impact-analysis",
];

export function hasCompletionPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.isCompletion);
}

export function canMarkWorkComplete(issue: DevelopmentIssue): boolean {
  return issue.progressImages.length >= 1 && hasCompletionPhoto(issue);
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