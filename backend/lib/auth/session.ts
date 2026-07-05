import crypto from "crypto";
import { cookies } from "next/headers";
import type { SessionPayload, SessionUser } from "./types";

const COOKIE_NAME = "proxima_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

const DEV_FALLBACK = "proxima-dev-secret-change-in-production";

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters in production."
    );
  }
  return secret ?? DEV_FALLBACK;
}

export function signSession(user: SessionUser): string {
  const payload: SessionPayload = {
    ...user,
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function parseSessionToken(token: string): SessionPayload | null {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
  if (sig.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    if (!payload.expiresAt || Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = parseSessionToken(token);
  if (!payload) return null;
  const { expiresAt: _, ...user } = payload;
  return user;
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export function clearSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}