const DEV_FALLBACK = "proxima-dev-secret-change-in-production";
/** Stable fallback for Vercel hackathon demos when SESSION_SECRET is not configured. */
const VERCEL_DEMO_FALLBACK = "proxima-vercel-demo-session-secret-min-32-chars!!";

export function isSessionSecretConfigured(): boolean {
  const secret = process.env.SESSION_SECRET?.trim();
  return Boolean(secret && secret.length >= 32);
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;

  // Vercel production without SESSION_SECRET — use stable demo secret so auth works
  if (process.env.NODE_ENV === "production" && process.env.VERCEL === "1") {
    return VERCEL_DEMO_FALLBACK;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters in production."
    );
  }

  return secret && secret.length > 0 ? secret : DEV_FALLBACK;
}