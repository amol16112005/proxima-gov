const DEV_FALLBACK = "proxima-dev-secret-change-in-production";

export function isSessionSecretConfigured(): boolean {
  const secret = process.env.SESSION_SECRET?.trim();
  return Boolean(secret && secret.length >= 32);
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret && secret.length >= 32) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters in production."
    );
  }

  return secret && secret.length > 0 ? secret : DEV_FALLBACK;
}