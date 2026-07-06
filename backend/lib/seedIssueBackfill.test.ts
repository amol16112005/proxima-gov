import { describe, expect, it } from "vitest";
import { SEED_ISSUES } from "@/data/seedIssues";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { hasAfterWorkPhoto, hasBeforeWorkPhoto } from "./lifecycleRules";
import {
  backfillSeedIssuePhotos,
  isEligibleSeedBackfill,
  SEED_ISSUE_IDS,
} from "./seedIssueBackfill";

describe("seedIssueBackfill", () => {
  it("only targets seed issues that crossed work stages", () => {
    const sl4012 = SEED_ISSUES.find((i) => i.id === "SL4012")!;
    const rd1024 = SEED_ISSUES.find((i) => i.id === "RD1024")!;
    const hc5018 = SEED_ISSUES.find((i) => i.id === "HC5018")!;

    expect(SEED_ISSUE_IDS.has("SL4012")).toBe(true);
    expect(isEligibleSeedBackfill(sl4012)).toBe(false);
    expect(isEligibleSeedBackfill(hc5018)).toBe(false);
    expect(isEligibleSeedBackfill(rd1024)).toBe(true);
  });

  it("backfills before-work photo for legacy in-progress seed issues", () => {
    const rd1024 = structuredClone(SEED_ISSUES.find((i) => i.id === "RD1024")!);
    const beforeCount = rd1024.progressImages.length;

    const { issue, changed } = backfillSeedIssuePhotos(rd1024);

    expect(changed).toBe(true);
    expect(issue.progressImages.length).toBe(beforeCount + 1);
    expect(hasBeforeWorkPhoto(issue)).toBe(true);
    expect(issue.progressImages.some((img) => img.demoBackfill && img.milestone === "planning")).toBe(
      true
    );
  });

  it("backfills before and after photos for completed legacy seed issues", () => {
    const ws2041 = structuredClone(SEED_ISSUES.find((i) => i.id === "WS2041")!);
    const beforeCount = ws2041.progressImages.length;

    const { issue, changed } = backfillSeedIssuePhotos(ws2041);

    expect(changed).toBe(true);
    expect(issue.progressImages.length).toBe(beforeCount + 2);
    expect(hasBeforeWorkPhoto(issue)).toBe(true);
    expect(hasAfterWorkPhoto(issue)).toBe(true);
  });

  it("does not modify pre-work seed issues or non-seed issues", () => {
    const sl4012 = structuredClone(SEED_ISSUES.find((i) => i.id === "SL4012")!);
    const custom: DevelopmentIssue = {
      ...sl4012,
      id: "SL6999",
      stage: "in-progress",
      currentProgress: 50,
      progressImages: [],
    };

    expect(backfillSeedIssuePhotos(sl4012).changed).toBe(false);
    expect(backfillSeedIssuePhotos(custom).changed).toBe(false);
  });

  it("does not duplicate backfill when milestone photos already exist", () => {
    const issue = structuredClone(SEED_ISSUES.find((i) => i.id === "RD1024")!);
    issue.progressImages.push({
      week: 99,
      label: "Before",
      caption: "Already tagged",
      gps: { lat: 1, lng: 2 },
      capturedAt: "2026-07-01",
      verified: true,
      milestone: "planning",
    });

    const { changed } = backfillSeedIssuePhotos(issue);
    expect(changed).toBe(false);
  });
});