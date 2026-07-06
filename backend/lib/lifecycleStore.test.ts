import { describe, expect, it, beforeEach } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { removeProgressImage } from "./lifecycleStore";

declare global {
  // eslint-disable-next-line no-var
  var __proximaIssues: DevelopmentIssue[] | undefined;
  // eslint-disable-next-line no-var
  var __proximaHydrated: boolean | undefined;
}

function baseIssue(): DevelopmentIssue {
  return {
    id: "TEST-1",
    citizenId: "c1",
    citizenName: "Test Citizen",
    constituencyId: "bangalore-south",
    category: "infrastructure",
    title: "Test road",
    description: "Test",
    location: "Test area",
    submittedAt: new Date().toISOString(),
    stage: "in-progress",
    currentProgress: 50,
    progressSubStage: "construction",
    beforeImageLabel: "Before",
    timeline: [],
    progressImages: [
      {
        week: 1,
        label: "Planning",
        caption: "Before work",
        gps: { lat: 12.9, lng: 77.6 },
        capturedAt: "2026-01-01T00:00:00.000Z",
        verified: true,
        milestone: "planning",
        imageUrl: "data:image/jpeg;base64,abc",
      },
      {
        week: 2,
        label: "QA",
        caption: "Inspection",
        gps: { lat: 12.9, lng: 77.6 },
        capturedAt: "2026-01-02T00:00:00.000Z",
        verified: true,
        milestone: "quality-inspection",
        imageUrl: "data:image/jpeg;base64,def",
      },
    ],
    verification: { yesVotes: 0, noVotes: 0, flagged: false, responses: [] },
  };
}

describe("removeProgressImage", () => {
  beforeEach(() => {
    global.__proximaHydrated = true;
    global.__proximaIssues = [baseIssue()];
    process.env.PROXIMA_STORAGE = "off";
  });

  it("removes the photo from progressImages and renumbers weeks", async () => {
    const updated = await removeProgressImage("TEST-1", 0);
    expect(updated).toBeDefined();
    expect(updated!.progressImages).toHaveLength(1);
    expect(updated!.progressImages[0]?.milestone).toBe("quality-inspection");
    expect(updated!.progressImages[0]?.week).toBe(1);

    const reloaded = global.__proximaIssues?.find((i) => i.id === "TEST-1");
    expect(reloaded?.progressImages).toHaveLength(1);
    expect(reloaded?.progressImages[0]?.imageUrl).toBe("data:image/jpeg;base64,def");
  });

  it("returns undefined for an invalid index", async () => {
    const updated = await removeProgressImage("TEST-1", 99);
    expect(updated).toBeUndefined();
  });

  it("resets WIP, inspection, and after-work when before-work photo is removed", async () => {
    global.__proximaIssues = [
      {
        ...baseIssue(),
        progressSubStage: "quality-inspection",
        currentProgress: 90,
        progressImages: [
          {
            week: 1,
            label: "Before",
            caption: "Before work",
            gps: { lat: 12.9, lng: 77.6 },
            capturedAt: "2026-01-01T00:00:00.000Z",
            verified: true,
            milestone: "planning",
            imageUrl: "data:image/jpeg;base64,before",
          },
          {
            week: 2,
            label: "After",
            caption: "After work",
            gps: { lat: 12.9, lng: 77.6 },
            capturedAt: "2026-01-03T00:00:00.000Z",
            verified: true,
            isCompletion: true,
            imageUrl: "data:image/jpeg;base64,after",
          },
        ],
      },
    ];

    const updated = await removeProgressImage("TEST-1", 0);
    expect(updated).toBeDefined();
    expect(updated!.progressImages).toHaveLength(0);
    expect(updated!.progressSubStage).toBe("planning");
    expect(updated!.currentProgress).toBe(0);
    expect(updated!.progressImages.some((img) => img.isCompletion)).toBe(false);
  });
});