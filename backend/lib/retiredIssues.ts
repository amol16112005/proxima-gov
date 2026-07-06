import { deleteIssueFromStorage, deleteNotificationsForIssue } from "@/lib/cloud/storage";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";

/** Permanently removed demo issues — purged from memory and MongoDB on every hydrate. */
export const RETIRED_ISSUE_IDS = new Set(["SL4012"]);

export function isRetiredIssue(id: string): boolean {
  return RETIRED_ISSUE_IDS.has(id);
}

export function withoutRetiredIssues(issues: DevelopmentIssue[]): DevelopmentIssue[] {
  return issues.filter((issue) => !isRetiredIssue(issue.id));
}

export async function purgeRetiredIssuesFromStorage(): Promise<void> {
  await Promise.all(
    [...RETIRED_ISSUE_IDS].map(async (issueId) => {
      await deleteIssueFromStorage(issueId);
      await deleteNotificationsForIssue(issueId);
    })
  );
}