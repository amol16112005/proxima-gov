import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import type { SessionUser } from "./types";

/** Citizens may only open private issue detail for issues they submitted. */
export function citizenOwnsIssue(issue: DevelopmentIssue, citizenId: string): boolean {
  return !!issue.citizenId && issue.citizenId === citizenId;
}

export function mpCanAccessIssue(issue: DevelopmentIssue, constituencyId: string): boolean {
  return issue.constituencyId === constituencyId;
}

export function sanitizeIssueForPublic(issue: DevelopmentIssue): DevelopmentIssue {
  const { citizenId: _citizenId, ...rest } = issue;
  return rest;
}

export function canCitizenAccessIssueApi(
  issue: DevelopmentIssue,
  session: SessionUser
): boolean {
  return citizenOwnsIssue(issue, session.id);
}

export function canMpAccessIssueApi(issue: DevelopmentIssue, session: SessionUser): boolean {
  return mpCanAccessIssue(issue, session.constituencyId);
}

/** Safe internal redirect target after login (citizen portal only). */
export function safeCitizenNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/citizen/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}

/** Safe internal redirect target after MP login. */
export function safeMpNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/mp/")) return null;
  if (next.startsWith("//")) return null;
  return next;
}