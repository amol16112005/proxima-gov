import { NextResponse } from "next/server";
import { jsonError } from "@/lib/apiResponse";
import { sessionCookieOptions, signSession } from "@/lib/auth/session";
import { verifyMpCredentials } from "@/data/mpRegistry";
import { checkRateLimit } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, pin } = body as { username: string; pin: string };

    if (!username?.trim() || !pin) {
      return jsonError("Username and PIN are required.", 400);
    }

    const normalizedUser = username.trim().toLowerCase();
    const rate = checkRateLimit(`mp-login:${normalizedUser}`, 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return jsonError("Too many login attempts. Please try again later.", 429, {
        retryAfterSec: rate.retryAfterSec,
      });
    }

    const pinDigits = pin.replace(/\D/g, "");
    if (pinDigits.length !== 6) {
      return jsonError("PIN must be exactly 6 digits.", 400);
    }

    const mp = verifyMpCredentials(username, pinDigits);
    if (!mp) {
      return jsonError("Invalid username or PIN. Contact the Parliamentary Affairs cell.", 401);
    }

    const sessionUser = {
      id: mp.id,
      role: "mp" as const,
      phone: mp.phone,
      name: mp.name,
      email: mp.email,
      constituencyId: mp.constituencyId,
      mpId: mp.id,
    };

    const token = signSession(sessionUser);
    const response = NextResponse.json({
      user: sessionUser,
      redirect: "/mp/dashboard",
    });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}