import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import {
  buildPriorityClusters,
  computeCompositePriorityScore,
  computeUrgencyScore,
  extractGeographicHotspot,
  extractThemeCategory,
  refreshConstituencyPriorityRankings,
} from "./priorityEngine";

function mockIssue(overrides: Partial<DevelopmentIssue>): DevelopmentIssue {
  return {
    id: "ED6001",
    citizenId: "c1",
    citizenName: "Test",
    constituencyId: "bangalore-south",
    category: "water-sanitation",
    title: "No drinking water",
    description: "Ward 4 residents have no tap water for 2 weeks",
    location: "Ward 4, Jayanagar",
    submittedAt: "2026-07-01",
    stage: "mp-approval",
    currentProgress: 0,
    progressSubStage: "planning",
    beforeImageLabel: "Before",
    aiAnalysis: {
      priorityScore: 70,
      similarComplaints: 1,
      populationAffected: "2000",
      schoolNearby: true,
      hospitalConnectivity: false,
      estimatedCost: 500000,
      reasons: [],
      recommendation: "Review",
      analyzedAt: "2026-07-01",
      mpEligible: true,
    },
    timeline: [],
    progressImages: [],
    verification: { yesVotes: 0, noVotes: 0, flagged: false, responses: [] },
    ...overrides,
  };
}

describe("priorityEngine", () => {
  it("extracts water theme and ward hotspot", () => {
    expect(
      extractThemeCategory("water-sanitation", "No water", "Drinking water scarcity in ward 4")
    ).toBe("water-infrastructure");
    expect(extractGeographicHotspot("Ward 4, Jayanagar", "")).toMatch(/Ward 4/i);
  });

  it("scores urgent issues higher", () => {
    const urgent = computeUrgencyScore("Collapsed bridge", "Emergency — children cannot cross");
    const routine = computeUrgencyScore("New park request", "Would like a community park");
    expect(urgent).toBeGreaterThan(routine);
  });

  it("clusters similar ward + theme submissions", () => {
    const issues = [
      mockIssue({ id: "WS6001", title: "No water Ward 4" }),
      mockIssue({ id: "WS6002", title: "Water scarcity Ward 4", description: "Drinking water issue ward 4" }),
      mockIssue({
        id: "ED6003",
        category: "education",
        title: "School upgrade",
        description: "Classroom shortage and long travel distance in Indiranagar",
        location: "Indiranagar",
      }),
    ];
    const clusters = buildPriorityClusters(issues);
    const waterCluster = clusters.find((c) => c.themeCategory === "water-infrastructure");
    expect(waterCluster?.citizenDemandCount).toBe(2);
    expect(clusters[0].compositePriorityScore).toBeGreaterThanOrEqual(clusters.at(-1)?.compositePriorityScore ?? 0);
  });

  it("computes composite score with demand and gap weights", () => {
    const high = computeCompositePriorityScore(14, 80, 90);
    const low = computeCompositePriorityScore(1, 40, 40);
    expect(high).toBeGreaterThan(low);
  });

  it("refreshes rankings on pending issues", () => {
    const issues = [
      mockIssue({ id: "WS6001" }),
      mockIssue({ id: "WS6002", title: "Water problem Ward 4" }),
    ];
    refreshConstituencyPriorityRankings(issues, "bangalore-south");
    expect(issues[0].aiAnalysis?.citizenDemandCount).toBe(2);
    expect(issues[0].aiAnalysis?.compositePriorityScore).toBeGreaterThan(0);
  });
});