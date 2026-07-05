import { afterEach, describe, expect, it } from "vitest";
import { checkRateLimit, resetRateLimits } from "./rateLimit";

afterEach(() => resetRateLimits());

describe("rateLimit", () => {
  it("allows requests within the window", () => {
    expect(checkRateLimit("otp:9999999999", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("otp:9999999999", 3, 60_000).allowed).toBe(true);
  });

  it("blocks after max requests", () => {
    checkRateLimit("otp:8888888888", 2, 60_000);
    checkRateLimit("otp:8888888888", 2, 60_000);
    const blocked = checkRateLimit("otp:8888888888", 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});