import { afterEach, describe, expect, it } from "vitest";
import { getSessionSecret, isSessionSecretConfigured } from "./sessionSecret";

describe("sessionSecret", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
  });

  it("uses configured secret when long enough", () => {
    process.env.SESSION_SECRET = "a".repeat(32);
    expect(getSessionSecret()).toBe("a".repeat(32));
    expect(isSessionSecretConfigured()).toBe(true);
  });

  it("uses Vercel demo fallback in production on Vercel without secret", () => {
    process.env.NODE_ENV = "production";
    process.env.VERCEL = "1";
    delete process.env.SESSION_SECRET;
    expect(getSessionSecret()).toContain("proxima-vercel-demo");
    expect(isSessionSecretConfigured()).toBe(false);
  });
});