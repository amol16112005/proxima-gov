import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import {
  citizenOwnsIssue,
  safeCitizenNextPath,
  safeMpNextPath,
  sanitizeIssueForPublic,
} from "./issueAccess";

const sampleIssue: DevelopmentIssue = {
  id: "iss-1",
  citizenId: "c-1",
  citizenName: "Asha",
  constituencyId: "bangalore-south",
  category: "infrastructure",
  title: "Road",
  description: "Potholes",
  location: "Jayanagar",
  submittedAt: "2026-07-01",
  stage: "submitted",
  currentProgress: 0,
  progressSubStage: "planning",
  timeline: [],
  progressImages: [],
  beforeImageLabel: "Before",
};

describe("issueAccess", () => {
  it("checks citizen ownership", () => {
    expect(citizenOwnsIssue(sampleIssue, "c-1")).toBe(true);
    expect(citizenOwnsIssue(sampleIssue, "c-2")).toBe(false);
  });

  it("strips citizenId from public views", () => {
    const pub = sanitizeIssueForPublic(sampleIssue);
    expect(pub.citizenId).toBeUndefined();
    expect(pub.title).toBe("Road");
  });

  it("allows only safe internal redirect paths", () => {
    expect(safeCitizenNextPath("/citizen/dashboard")).toBe("/citizen/dashboard");
    expect(safeCitizenNextPath("//evil.com")).toBeNull();
    expect(safeMpNextPath("/mp/dashboard")).toBe("/mp/dashboard");
    expect(safeMpNextPath("/citizen/login")).toBeNull();
  });
});