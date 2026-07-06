import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import {
  applyBeforeWorkPhotoRemovalCascade,
  applyWorkCompletionRevert,
  canAdvanceToSubStage,
  canConfirmInspection,
  canConfirmWorkInProgress,
  canUndoInspection,
  canUndoWorkInProgress,
  canMarkWorkComplete,
  canUploadAfterWorkPhoto,
  canUploadBeforeWorkPhoto,
  canUploadQualityInspectionPhoto,
  hasAfterWorkPhoto,
  hasBeforeWorkPhoto,
  hasInspectionConfirmed,
  hasWorkInProgressConfirmed,
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

  it("requires work in progress and inspection before after-work photo", () => {
    expect(canUploadAfterWorkPhoto(issueWithImages([beforeWorkPhoto]))).toBe(false);
    expect(
      canUploadAfterWorkPhoto(
        issueWithImages([beforeWorkPhoto], { progressSubStage: "construction" })
      )
    ).toBe(false);
    expect(
      canUploadAfterWorkPhoto(
        issueWithImages([beforeWorkPhoto], { progressSubStage: "quality-inspection" })
      )
    ).toBe(true);
    expect(canUploadAfterWorkPhoto(issueWithImages([]))).toBe(false);
    expect(
      canUploadAfterWorkPhoto(issueWithImages([beforeWorkPhoto, afterWorkPhoto]))
    ).toBe(false);
  });

  it("gates work process confirmations in order", () => {
    const base = issueWithImages([beforeWorkPhoto]);
    expect(canConfirmWorkInProgress(base)).toBe(true);
    expect(canConfirmInspection(base)).toBe(false);

    const wip = issueWithImages([beforeWorkPhoto], { progressSubStage: "construction" });
    expect(hasWorkInProgressConfirmed(wip)).toBe(true);
    expect(canConfirmWorkInProgress(wip)).toBe(false);
    expect(canConfirmInspection(wip)).toBe(true);

    const inspected = issueWithImages([beforeWorkPhoto], {
      progressSubStage: "quality-inspection",
    });
    expect(hasInspectionConfirmed(inspected)).toBe(true);
    expect(canConfirmInspection(inspected)).toBe(false);
  });

  it("allows only the two process checkpoints and completion advancement", () => {
    expect(canUploadQualityInspectionPhoto(issueWithImages([beforeWorkPhoto]))).toBe(false);
    expect(
      canAdvanceToSubStage(issueWithImages([beforeWorkPhoto]), "construction")
    ).toBe(true);
    expect(canAdvanceToSubStage(issueWithImages([]), "construction")).toBe(false);
    expect(
      canAdvanceToSubStage(
        issueWithImages([beforeWorkPhoto], { progressSubStage: "construction" }),
        "quality-inspection"
      )
    ).toBe(true);
    expect(
      canAdvanceToSubStage(issueWithImages([beforeWorkPhoto, afterWorkPhoto]), "completed")
    ).toBe(true);
    expect(canAdvanceToSubStage(issueWithImages([]), "material-procurement")).toBe(false);
  });

  it("reverts completion when required photos are missing in post-work stages", () => {
    expect(shouldRevertWorkCompletion("citizen-verification", false)).toBe(true);
    expect(shouldRevertWorkCompletion("in-progress", false)).toBe(false);
  });

  it("restores post-inspection state when work completion is reverted with before photo", () => {
    const issue = issueWithImages([beforeWorkPhoto], {
      stage: "citizen-verification",
      progressSubStage: "completed",
      currentProgress: 100,
      afterImageLabel: "After — Test road",
    });

    applyWorkCompletionRevert(issue);

    expect(issue.stage).toBe("in-progress");
    expect(issue.progressSubStage).toBe("quality-inspection");
    expect(issue.currentProgress).toBe(90);
    expect(issue.afterImageLabel).toBeUndefined();
  });

  it("resets to planning when work completion is reverted without before photo", () => {
    const issue = issueWithImages([], {
      stage: "citizen-verification",
      progressSubStage: "completed",
      currentProgress: 100,
    });

    applyWorkCompletionRevert(issue);

    expect(issue.stage).toBe("in-progress");
    expect(issue.progressSubStage).toBe("planning");
    expect(issue.currentProgress).toBe(0);
  });

  it("detects before and after work photos", () => {
    const issue = issueWithImages([beforeWorkPhoto, afterWorkPhoto]);
    expect(hasBeforeWorkPhoto(issue)).toBe(true);
    expect(hasAfterWorkPhoto(issue)).toBe(true);
    expect(canUploadAfterWorkPhoto(issue)).toBe(false);
  });

  it("treats WIP and inspection as incomplete when before-work photo is missing", () => {
    const issue = issueWithImages([], {
      progressSubStage: "quality-inspection",
      currentProgress: 90,
    });

    expect(hasWorkInProgressConfirmed(issue)).toBe(false);
    expect(hasInspectionConfirmed(issue)).toBe(false);
  });

  it("allows undo clicks for confirmed WIP and inspection steps", () => {
    const wip = issueWithImages([beforeWorkPhoto], { progressSubStage: "construction" });
    const inspected = issueWithImages([beforeWorkPhoto, afterWorkPhoto], {
      progressSubStage: "quality-inspection",
    });

    expect(canUndoWorkInProgress(wip)).toBe(true);
    expect(canUndoInspection(inspected)).toBe(true);
    expect(canUndoWorkInProgress(issueWithImages([], { progressSubStage: "construction" }))).toBe(
      false
    );
  });

  it("cascades undo of WIP, inspection, and after-work when before photo is gone", () => {
    const issue = issueWithImages([afterWorkPhoto], {
      progressSubStage: "quality-inspection",
      currentProgress: 90,
      afterImageLabel: "After — Test road",
      stage: "citizen-verification",
    });

    applyBeforeWorkPhotoRemovalCascade(issue);

    expect(issue.stage).toBe("in-progress");
    expect(issue.progressSubStage).toBe("planning");
    expect(issue.currentProgress).toBe(0);
    expect(hasAfterWorkPhoto(issue)).toBe(false);
    expect(hasWorkInProgressConfirmed(issue)).toBe(false);
    expect(hasInspectionConfirmed(issue)).toBe(false);
    expect(issue.afterImageLabel).toBeUndefined();
  });
});