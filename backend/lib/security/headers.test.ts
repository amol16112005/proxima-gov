import { describe, expect, it } from "vitest";
import { SECURITY_HEADERS, productionHeaders } from "./headers";

describe("security headers", () => {
  it("includes core hardening headers", () => {
    const keys = SECURITY_HEADERS.map((h) => h.key);
    expect(keys).toContain("X-Frame-Options");
    expect(keys).toContain("X-Content-Type-Options");
    expect(keys).toContain("Referrer-Policy");
  });

  it("adds HSTS in production", () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const keys = productionHeaders().map((h) => h.key);
    expect(keys).toContain("Strict-Transport-Security");
    process.env.NODE_ENV = prev;
  });
});