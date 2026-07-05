import { describe, expect, it } from "vitest";
import {
  assessIssueScope,
  isMpActionableIssue,
  applyTriageToAnalysis,
} from "./issueTriage";

describe("assessIssueScope", () => {
  it("accepts eligible community infrastructure issues", () => {
    const result = assessIssueScope({
      constituencyId: "bangalore-south",
      category: "infrastructure",
      title: "Potholed road in Jayanagar",
      description: "Main road damaged affecting school access",
      location: "Jayanagar 4th Block, Bangalore South",
    });
    expect(result.mpEligible).toBe(true);
    expect(result.scopeVerdict).toBe("eligible");
  });

  it("declines passport and central-service matters", () => {
    const result = assessIssueScope({
      constituencyId: "new-delhi",
      category: "other",
      title: "Passport delay",
      description: "My passport renewal is stuck for 3 months",
      location: "Connaught Place",
    });
    expect(result.mpEligible).toBe(false);
    expect(result.scopeVerdict).toBe("not-mp-mandate");
  });

  it("routes police matters to the correct authority", () => {
    const result = assessIssueScope({
      constituencyId: "mumbai-south",
      category: "safety",
      title: "Theft complaint",
      description: "Need to file FIR for mobile phone theft",
      location: "Colaba",
    });
    expect(result.mpEligible).toBe(false);
    expect(result.scopeVerdict).toBe("wrong-authority");
  });

  it("flags out-of-constituency locations", () => {
    const result = assessIssueScope({
      constituencyId: "bangalore-south",
      category: "infrastructure",
      title: "Road repair",
      description: "Damaged road near railway station",
      location: "Lucknow Cantonment",
    });
    expect(result.mpEligible).toBe(false);
    expect(result.scopeVerdict).toBe("out-of-constituency");
    expect(result.suggestedAuthority).toMatch(/Lucknow/i);
  });
});

describe("isMpActionableIssue", () => {
  it("excludes declined and AI-declined issues from MP dashboard", () => {
    expect(isMpActionableIssue({ stage: "declined" })).toBe(false);
    expect(
      isMpActionableIssue({ stage: "submitted", aiAnalysis: { mpEligible: false } })
    ).toBe(false);
    expect(
      isMpActionableIssue({ stage: "mp-approval", aiAnalysis: { mpEligible: true } })
    ).toBe(true);
  });
});

describe("applyTriageToAnalysis", () => {
  it("overrides recommendation when issue is not MP-eligible", () => {
    const triage = assessIssueScope({
      constituencyId: "new-delhi",
      category: "other",
      title: "Income tax refund",
      description: "Refund not credited",
      location: "New Delhi",
    });
    const updated = applyTriageToAnalysis(
      {
        priorityScore: 50,
        similarComplaints: 0,
        populationAffected: "1",
        schoolNearby: false,
        hospitalConnectivity: false,
        estimatedCost: 0,
        reasons: [],
        recommendation: "Approve for MPLADS",
        analyzedAt: "2026-07-01",
      },
      triage
    );
    expect(updated.mpEligible).toBe(false);
    expect(updated.recommendation).toMatch(/Not forwarded to MP/i);
  });
});