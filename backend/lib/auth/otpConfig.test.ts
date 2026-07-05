import { describe, expect, it } from "vitest";
import { shouldExposeDemoOtp } from "./otpConfig";

describe("shouldExposeDemoOtp", () => {
  it("exposes demo OTP when no SMS provider is configured", () => {
    const prevSms = process.env.SMS_PROVIDER_API_KEY;
    const prevDemo = process.env.PROXIMA_DEMO_OTP;
    delete process.env.SMS_PROVIDER_API_KEY;
    delete process.env.PROXIMA_DEMO_OTP;
    expect(shouldExposeDemoOtp()).toBe(true);
    process.env.SMS_PROVIDER_API_KEY = prevSms;
    process.env.PROXIMA_DEMO_OTP = prevDemo;
  });

  it("hides demo OTP when SMS provider is set", () => {
    const prev = process.env.SMS_PROVIDER_API_KEY;
    process.env.SMS_PROVIDER_API_KEY = "test-key";
    expect(shouldExposeDemoOtp()).toBe(false);
    process.env.SMS_PROVIDER_API_KEY = prev;
  });
});