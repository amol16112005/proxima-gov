import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import {
  applyWorkCompletionRevert,
  canAdvanceToSubStage,
  canMarkWorkComplete,
  canUploadAfterWorkPhoto,
  canUploadBeforeWorkPhoto,
  canUploadQualityInspectionPhoto,
  hasAfterWorkPhoto,
  hasBeforeWorkPhoto,
  shouldRevertWorkCompletion,
} from "./lifecycleRules";

function issueWithImages(
  images: DevelopmentIssue["progressImages"],
  overrides: Partial<DevelopmentIssue> = {}
): DevelopmentIssue {
  return {
    id: "test-1",
    citizenId: "c-1",
    citizenName: "Test Citizen",
    constituencyId: "bangalore-south",
    category: "infrastructure",
    title: "Test road",
    description: "Test",
    location: "Jayanagar",
    stage: "in-progress",
    submittedAt: "2026-07-01",
    currentProgress: 0,
    progressSubStage: "planning",
    timeline: [],
    progressImages: images,
    beforeImageLabel: "Before",
    ...overrides,
  };
}

const beforeWorkPhoto = {
  week: 1,
  label: "Before Work",
  caption: "Before work",
  gps: { lat: 12.9, lng: 77.6 },
  capturedAt: "2026-07-01",
  verified: true,
  milestone: "planning" as const,
};

const afterWorkPhoto = {
  week: 2,
  label: "After Work",
  caption: "After work",
  gps: { lat: 12.9, lng: 77.6 },
  capturedAt: "2026-07-03",
  verified: true,
  isCompletion: true,
};

describe("lifecycleRules", () => {
  it("requires before-work and after-work photos for final submission", () => {
    expect(canMarkWorkComplete(issueWithImages([]))).toBe(false);
    expect(canMarkWorkComplete(issueWithImages([beforeWorkPhoto]))).toBe(false);
    expect(
      canMarkWorkComplete(issueWithImages([beforeWorkPhoto, afterWorkPhoto]))
    ).toBe(true);
  });

  it("allows before-work photo upload when work is active", () => {
    expect(canUploadBeforeWorkPhoto(issueWithImages([], { stage: "work-started" }))).toBe(
      true
    );
    expect(canUploadBeforeWorkPhoto(issueWithImages([beforeWorkPhoto]))).toBe(false);
    expect(canUploadBeforeWorkPhoto(issueWithImages([], { stage: "approved" }))).toBe(false);
  });

  it("allows after-work photo only after before-work photo", () => {
    expect(canUploadAfterWorkPhoto(issueWithImages([beforeWorkPhoto]))).toBe(true);
    expect(canUploadAfterWorkPhoto(issueWithImages([]))).toBe(false);
    expect(
      canUploadAfterWorkPhoto(issueWithImages([beforeWorkPhoto, afterWorkPhoto]))
    ).toBe(false);
  });

  it("disables QA milestone and manual sub-stage advancement", () => {
    expect(canUploadQualityInspectionPhoto(issueWithImages([beforeWorkPhoto]))).toBe(false);
    expect(canAdvanceToSubStage(issueWithImages([]), "construction")).toBe(false);
    expect(
      canAdvanceToSubStage(issueWithImages([beforeWorkPhoto, afterWorkPhoto]), "completed")
    ).toBe(true);
  });

  it("reverts completion when required photos are missing in post-work stages", () => {
    expect(shouldRevertWorkCompletion("citizen-verification", false)).toBe(true);
    expect(shouldRevertWorkCompletion("in-progress", false)).toBe(false);
  });

  it("applies in-progress state when work completion is reverted", () => {
    const issue = issueWithImages([beforeWorkPhoto, afterWorkPhoto], {
      stage: "citizen-verification",
      progressSubStage: "completed",
      currentProgress: 100,
      afterImageLabel: "After — Test road",
    });

    applyWorkCompletionRevert(issue);

    expect(issue.stage).toBe("in-progress");
    expect(issue.progressSubStage).toBe("planning");
    expect(issue.currentProgress).toBe(50);
    expect(issue.afterImageLabel).toBeUndefined();
  });

  it("detects before and after work photos", () => {
    const issue = issueWithImages([beforeWorkPhoto, afterWorkPhoto]);
    expect(hasBeforeWorkPhoto(issue)).toBe(true);
    expect(hasAfterWorkPhoto(issue)).toBe(true);
    expect(canUploadAfterWorkPhoto(issue)).toBe(false);
  });
});