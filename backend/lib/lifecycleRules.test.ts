import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { canMarkWorkComplete, hasCompletionPhoto } from "./lifecycleRules";

function issueWithImages(
  images: DevelopmentIssue["progressImages"]
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
    currentProgress: 50,
    progressSubStage: "construction",
    timeline: [],
    progressImages: images,
    beforeImageLabel: "Before",
  };
}

describe("lifecycleRules", () => {
  it("detects completion photo", () => {
    const issue = issueWithImages([
      {
        week: 1,
        label: "Before",
        caption: "Before",
        gps: { lat: 12.9, lng: 77.6 },
        capturedAt: "2026-07-01",
        verified: true,
        isCompletion: false,
      },
      {
        week: 2,
        label: "After",
        caption: "After",
        gps: { lat: 12.9, lng: 77.6 },
        capturedAt: "2026-07-02",
        verified: true,
        isCompletion: true,
      },
    ]);
    expect(hasCompletionPhoto(issue)).toBe(true);
  });

  it("requires at least one progress image and a completion photo", () => {
    expect(canMarkWorkComplete(issueWithImages([]))).toBe(false);
    expect(
      canMarkWorkComplete(
        issueWithImages([
          {
            week: 1,
            label: "Progress",
            caption: "Progress",
            gps: { lat: 12.9, lng: 77.6 },
            capturedAt: "2026-07-01",
            verified: true,
            isCompletion: false,
          },
        ])
      )
    ).toBe(false);
    expect(
      canMarkWorkComplete(
        issueWithImages([
          {
            week: 1,
            label: "Done",
            caption: "Done",
            gps: { lat: 12.9, lng: 77.6 },
            capturedAt: "2026-07-01",
            verified: true,
            isCompletion: true,
          },
        ])
      )
    ).toBe(true);
  });
});