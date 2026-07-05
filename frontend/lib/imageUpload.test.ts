import { describe, expect, it } from "vitest";
import { validateImageFile } from "./imageUpload";

describe("validateImageFile", () => {
  it("accepts supported image types under size limit", () => {
    const file = new File([new Uint8Array(1024)], "site.jpg", { type: "image/jpeg" });
    expect(validateImageFile(file)).toBeNull();
  });

  it("rejects unsupported types", () => {
    const file = new File([new Uint8Array(10)], "doc.pdf", { type: "application/pdf" });
    expect(validateImageFile(file)).toMatch(/JPG, PNG, or WebP/i);
  });

  it("rejects oversized files", () => {
    const file = new File([new Uint8Array(9 * 1024 * 1024)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(validateImageFile(file)).toMatch(/too large/i);
  });
});