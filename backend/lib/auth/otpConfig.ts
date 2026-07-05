/** Show OTP on screen when no real SMS gateway is configured (hackathon / Vercel demo). */
export function shouldExposeDemoOtp(): boolean {
  if (process.env.SMS_PROVIDER_API_KEY?.trim()) return false;
  if (process.env.PROXIMA_DEMO_OTP === "false") return false;
  return true;
}