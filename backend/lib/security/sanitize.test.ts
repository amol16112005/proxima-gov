import { describe, expect, it } from "vitest";
import { normalizeFreeText, stripHtml } from "./sanitize";

describe("sanitize", () => {
  it("removes HTML tags", () => {
    expect(stripHtml("<script>alert(1)</script>Hello")).toBe("alert(1)Hello");
  });

  it("normalizes and truncates free text", () => {
    expect(normalizeFreeText("  hello   world  ", 20)).toBe("hello world");
    expect(normalizeFreeText("x".repeat(30), 10)).toHaveLength(10);
  });
});