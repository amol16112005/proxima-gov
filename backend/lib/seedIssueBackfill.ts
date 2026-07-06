import { SEED_ISSUES } from "@/data/seedIssues";
import type { DevelopmentIssue, LifecycleStage, ProgressImage } from "@/data/lifecycleTypes";
import {
  ACTIVE_MP_WORKFLOW_SEED_IDS,
  hasAfterWorkPhoto,
  hasBeforeWorkPhoto,
  renumberProgressImageWeeks,
} from "./lifecycleRules";

/** Minimal 1×1 JPEG — valid for display; demo backfill only. */
export const DEMO_PLACEHOLDER_IMAGE =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

export const SEED_ISSUE_IDS = new Set(SEED_ISSUES.map((issue) => issue.id));

const CROSSED_WORK_STAGES: LifecycleStage[] = [
  "work-started",
  "in-progress",
  "citizen-verification",
  "mp-review",
  "completed",
  "impact-analysis",
];

const POST_WORK_STAGES: LifecycleStage[] = [
  "citizen-verification",
  "mp-review",
  "completed",
  "impact-analysis",
];

export function hasCrossedWorkStages(issue: DevelopmentIssue): boolean {
  return CROSSED_WORK_STAGES.includes(issue.stage) || issue.currentProgress > 0;
}

/** Old weekly progress photos without milestone / completion tags (RD1024, WS2041, etc.). */
export function hasLegacyUntaggedPhotos(issue: DevelopmentIssue): boolean {
  return issue.progressImages.some(
    (img) => !img.demoBackfill && !img.milestone && !img.isCompletion
  );
}

export function isEligibleSeedBackfill(issue: DevelopmentIssue): boolean {
  if (!SEED_ISSUE_IDS.has(issue.id) || ACTIVE_MP_WORKFLOW_SEED_IDS.has(issue.id)) {
    return false;
  }
  return hasCrossedWorkStages(issue) && hasLegacyUntaggedPhotos(issue);
}

function needsAfterWorkBackfill(issue: DevelopmentIssue): boolean {
  return (
    POST_WORK_STAGES.includes(issue.stage) || issue.progressSubStage === "completed"
  );
}

function defaultGps(issue: DevelopmentIssue): { lat: number; lng: number } {
  const bases: Record<string, { lat: number; lng: number }> = {
    "mumbai-south": { lat: 18.922, lng: 72.8347 },
    "pune-city": { lat: 18.5074, lng: 73.8077 },
    "new-delhi": { lat: 28.6139, lng: 77.209 },
    "bangalore-south": { lat: 12.9141, lng: 77.6101 },
    "chennai-central": { lat: 13.0827, lng: 80.2707 },
  };
  return bases[issue.constituencyId] ?? { lat: 19.0, lng: 73.0 };
}

function cloneAsBackfill(
  source: ProgressImage,
  overrides: Partial<ProgressImage>
): ProgressImage {
  return {
    ...source,
    milestone: undefined,
    isCompletion: undefined,
    demoBackfill: true,
    verified: true,
    ...overrides,
  };
}

function placeholderImage(issue: DevelopmentIssue, label: string, caption: string): ProgressImage {
  const gps = defaultGps(issue);
  return {
    week: 0,
    label,
    caption,
    gps,
    capturedAt: issue.submittedAt,
    verified: true,
    imageUrl: DEMO_PLACEHOLDER_IMAGE,
    demoBackfill: true,
  };
}

function pickSourceImage(issue: DevelopmentIssue, preferLast: boolean): ProgressImage | undefined {
  if (issue.progressImages.length === 0) return undefined;
  const nonBackfill = issue.progressImages.filter((img) => !img.demoBackfill);
  const pool = nonBackfill.length > 0 ? nonBackfill : issue.progressImages;
  return preferLast ? pool[pool.length - 1] : pool[0];
}

/**
 * Legacy demo seed issues that advanced past work-start without milestone photos
 * receive duplicate/synthetic before-work and (when applicable) after-work entries.
 * Non-seed and pre-work seed issues are unchanged.
 */
export function backfillSeedIssuePhotos(issue: DevelopmentIssue): {
  issue: DevelopmentIssue;
  changed: boolean;
} {
  if (!isEligibleSeedBackfill(issue)) {
    return { issue, changed: false };
  }

  let changed = false;

  if (!hasBeforeWorkPhoto(issue)) {
    const source = pickSourceImage(issue, false);
    const before = source
      ? cloneAsBackfill(source, {
          label: issue.beforeImageLabel ?? "Before Work (demo)",
          caption: source.caption || "Demo backfill — before-work site photo",
          milestone: "planning",
        })
      : placeholderImage(
          issue,
          issue.beforeImageLabel ?? "Before Work (demo)",
          "Demo backfill — before-work site photo"
        );

    if (!before.milestone) before.milestone = "planning";
    issue.progressImages.push(before);
    changed = true;
  }

  if (needsAfterWorkBackfill(issue) && !hasAfterWorkPhoto(issue)) {
    const source = pickSourceImage(issue, true);
    const after = source
      ? cloneAsBackfill(source, {
          label: issue.afterImageLabel ?? "After Work (demo)",
          caption: source.caption || "Demo backfill — after-work site photo",
          isCompletion: true,
        })
      : placeholderImage(
          issue,
          issue.afterImageLabel ?? "After Work (demo)",
          "Demo backfill — after-work site photo"
        );

    after.isCompletion = true;
    issue.progressImages.push(after);
    changed = true;
  }

  if (changed) {
    renumberProgressImageWeeks(issue);
  }

  return { issue, changed };
}

export async function backfillAndPersistSeedIssues(
  issues: DevelopmentIssue[],
  persist: (issue: DevelopmentIssue) => Promise<void>
): Promise<DevelopmentIssue[]> {
  const updated: DevelopmentIssue[] = [];
  for (const issue of issues) {
    const { issue: next, changed } = backfillSeedIssuePhotos(issue);
    updated.push(next);
    if (changed) {
      await persist(next);
    }
  }
  return updated;
}