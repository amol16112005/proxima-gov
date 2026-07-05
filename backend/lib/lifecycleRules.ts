import type { DevelopmentIssue } from "@/data/lifecycleTypes";

export function hasCompletionPhoto(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some((img) => img.isCompletion);
}

export function canMarkWorkComplete(issue: DevelopmentIssue): boolean {
  return issue.progressImages.length >= 1 && hasCompletionPhoto(issue);
}