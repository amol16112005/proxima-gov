import type { SessionPayload } from "./types";

function getSecret(): string {
  return process.env.SESSION_SECRET ?? "proxima-dev-secret-change-in-production";
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

export async function parseSessionTokenEdge(token: string): Promise<SessionPayload | null> {
  const [data, sig] = token.split(".");
  if (!data || !sig) return null;

  const expected = await sign(data);
  if (sig !== expected) return null;

  try {
    const json = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as SessionPayload;
    if (!payload.expiresAt || Date.now() > payload.expiresAt) return null;
    return payload;
  } catch {
    return null;
  }
}