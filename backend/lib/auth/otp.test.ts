import { beforeEach, describe, expect, it } from "vitest";
import { createOtp, normalizePhone, verifyOtp } from "./otp";

beforeEach(() => {
  global.__proximaOtpStore = new Map();
});

describe("normalizePhone", () => {
  it("accepts 10-digit Indian mobile numbers", () => {
    expect(normalizePhone("9876543210")).toBe("9876543210");
    expect(normalizePhone("+91 98765 43210")).toBe("9876543210");
  });

  it("rejects invalid numbers", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("")).toBeNull();
  });
});

describe("OTP flow", () => {
  it("creates and verifies a valid OTP", () => {
    const { otp } = createOtp("9876543210", "login", "citizen");
    const result = verifyOtp("9876543210", "login", "citizen", otp);
    expect(result.valid).toBe(true);
  });

  it("rejects wrong OTP and tracks attempts", () => {
    createOtp("9876543210", "login", "citizen");
    const result = verifyOtp("9876543210", "login", "citizen", "000000");
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid OTP/i);
  });
});