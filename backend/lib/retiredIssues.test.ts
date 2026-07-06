import { describe, expect, it } from "vitest";
import { SEED_ISSUES } from "@/data/seedIssues";
import { isRetiredIssue, RETIRED_ISSUE_IDS, withoutRetiredIssues } from "./retiredIssues";

describe("retiredIssues", () => {
  it("retires SL4012 permanently", () => {
    expect(RETIRED_ISSUE_IDS.has("SL4012")).toBe(true);
    expect(isRetiredIssue("SL4012")).toBe(true);
    expect(SEED_ISSUES.some((issue) => issue.id === "SL4012")).toBe(false);
  });

  it("filters retired issues from loaded lists", () => {
    const issues = [
      { id: "SL4012" },
      { id: "RD1024" },
    ] as Parameters<typeof withoutRetiredIssues>[0];

    const filtered = withoutRetiredIssues(issues);
    expect(filtered.map((issue) => issue.id)).toEqual(["RD1024"]);
  });
});