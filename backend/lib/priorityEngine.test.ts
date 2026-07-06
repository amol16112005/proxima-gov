import { describe, expect, it } from "vitest";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import {
  buildPriorityClusters,
  computeCompositePriorityScore,
  computeInfrastructureGapWeight,
  computeUrgencyBoost,
  computeUrgencyScore,
  extractGeographicHotspot,
  extractThemeCategory,
  refreshConstituencyPriorityRankings,
  URGENCY_BOOST_HIGH,
  URGENCY_BOOST_LIFE_SAFETY,
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

  it("applies flat urgency boost tiers", () => {
    expect(computeUrgencyBoost("Collapsed bridge", "Emergency near school")).toBe(
      URGENCY_BOOST_LIFE_SAFETY
    );
    expect(computeUrgencyBoost("No drinking water", "Ward 4 scarcity")).toBe(URGENCY_BOOST_HIGH);
    expect(computeUrgencyBoost("Park beautification", "Nice to have")).toBe(0);
  });

  it("computes composite score with demand, gap, and flat urgency boost", () => {
    const high = computeCompositePriorityScore(14, 80, URGENCY_BOOST_LIFE_SAFETY);
    const low = computeCompositePriorityScore(1, 40, 0);
    expect(high).toBeGreaterThan(low);
  });

  it("falls back to demographic weights when DATAGOVINDIA_API_KEY is absent", () => {
    const prev = process.env.DATAGOVINDIA_API_KEY;
    delete process.env.DATAGOVINDIA_API_KEY;
    expect(() =>
      computeInfrastructureGapWeight(
        "bangalore-south",
        "education",
        "School overcrowding",
        "Enrollment exceeds classroom capacity"
      )
    ).not.toThrow();
    const { weight, signals } = computeInfrastructureGapWeight(
      "bangalore-south",
      "education",
      "School overcrowding",
      "Enrollment exceeds classroom capacity"
    );
    expect(weight).toBeGreaterThan(0);
    expect(signals.some((s) => s.includes("demographic"))).toBe(true);
    if (prev) process.env.DATAGOVINDIA_API_KEY = prev;
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