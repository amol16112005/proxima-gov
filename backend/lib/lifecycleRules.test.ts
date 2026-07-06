import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import {
  applyWorkCompletionRevert,
  canAdvanceToSubStage,
  canMarkWorkComplete,
  canUploadCompletionPhoto,
  canUploadPlanningPhoto,
  canUploadQualityInspectionPhoto,
  hasCompletionPhoto,
  hasPlanningPhoto,
  hasQualityInspectionPhoto,
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
    currentProgress: 20,
    progressSubStage: "planning",
    timeline: [],
    progressImages: images,
    beforeImageLabel: "Before",
    ...overrides,
  };
}

const planningPhoto = {
  week: 1,
  label: "Before Planning",
  caption: "Before planning",
  gps: { lat: 12.9, lng: 77.6 },
  capturedAt: "2026-07-01",
  verified: true,
  milestone: "planning" as const,
};

const qualityPhoto = {
  week: 2,
  label: "After QA",
  caption: "After QA",
  gps: { lat: 12.9, lng: 77.6 },
  capturedAt: "2026-07-02",
  verified: true,
  milestone: "quality-inspection" as const,
};

const completionPhoto = {
  week: 3,
  label: "After",
  caption: "After",
  gps: { lat: 12.9, lng: 77.6 },
  capturedAt: "2026-07-03",
  verified: true,
  isCompletion: true,
};

describe("lifecycleRules", () => {
  it("requires systematic planning, QA, and completion photos for final submission", () => {
    expect(canMarkWorkComplete(issueWithImages([]))).toBe(false);
    expect(canMarkWorkComplete(issueWithImages([planningPhoto]))).toBe(false);
    expect(
      canMarkWorkComplete(issueWithImages([planningPhoto, qualityPhoto]))
    ).toBe(false);
    expect(
      canMarkWorkComplete(
        issueWithImages([planningPhoto, qualityPhoto, completionPhoto])
      )
    ).toBe(true);
  });

  it("gates planning photo upload to work start / planning stage", () => {
    expect(canUploadPlanningPhoto(issueWithImages([], { stage: "work-started" }))).toBe(
      true
    );
    expect(
      canUploadPlanningPhoto(
        issueWithImages([], { stage: "in-progress", progressSubStage: "construction" })
      )
    ).toBe(false);
    expect(canUploadPlanningPhoto(issueWithImages([planningPhoto]))).toBe(false);
  });

  it("gates quality-inspection photo to QA sub-stage after planning photo", () => {
    expect(
      canUploadQualityInspectionPhoto(
        issueWithImages([planningPhoto], { progressSubStage: "quality-inspection" })
      )
    ).toBe(true);
    expect(
      canUploadQualityInspectionPhoto(
        issueWithImages([], { progressSubStage: "quality-inspection" })
      )
    ).toBe(false);
    expect(
      canUploadQualityInspectionPhoto(
        issueWithImages([planningPhoto, qualityPhoto], {
          progressSubStage: "quality-inspection",
        })
      )
    ).toBe(false);
  });

  it("blocks advancing past planning without planning photo", () => {
    const issue = issueWithImages([]);
    expect(canAdvanceToSubStage(issue, "planning")).toBe(true);
    expect(canAdvanceToSubStage(issue, "construction")).toBe(false);
    expect(canAdvanceToSubStage(issueWithImages([planningPhoto]), "construction")).toBe(
      true
    );
  });

  it("reverts completion when required photos are missing in post-work stages", () => {
    expect(shouldRevertWorkCompletion("citizen-verification", false)).toBe(true);
    expect(shouldRevertWorkCompletion("in-progress", false)).toBe(false);
  });

  it("applies in-progress state when work completion is reverted", () => {
    const issue = issueWithImages([planningPhoto, qualityPhoto, completionPhoto], {
      stage: "citizen-verification",
      progressSubStage: "completed",
      currentProgress: 100,
      afterImageLabel: "After — Test road",
    });

    applyWorkCompletionRevert(issue);

    expect(issue.stage).toBe("in-progress");
    expect(issue.progressSubStage).toBe("quality-inspection");
    expect(issue.afterImageLabel).toBeUndefined();
  });

  it("detects milestone and completion photos", () => {
    const issue = issueWithImages([planningPhoto, qualityPhoto, completionPhoto]);
    expect(hasPlanningPhoto(issue)).toBe(true);
    expect(hasQualityInspectionPhoto(issue)).toBe(true);
    expect(hasCompletionPhoto(issue)).toBe(true);
    expect(canUploadCompletionPhoto(issue)).toBe(false);
  });
});