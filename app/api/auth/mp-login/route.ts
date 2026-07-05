import { NextResponse } from "next/server";
import { sessionCookieOptions, signSession } from "@/lib/auth/session";
import { verifyMpCredentials } from "@/data/mpRegistry";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, pin } = body as { username: string; pin: string };

    if (!username?.trim() || !pin) {
      return NextResponse.json({ error: "Username and PIN are required." }, { status: 400 });
    }

    const pinDigits = pin.replace(/\D/g, "");
    if (pinDigits.length !== 6) {
      return NextResponse.json({ error: "PIN must be exactly 6 digits." }, { status: 400 });
    }

    const mp = verifyMpCredentials(username, pinDigits);
    if (!mp) {
      return NextResponse.json(
        { error: "Invalid username or PIN. Contact the Parliamentary Affairs cell." },
        { status: 401 }
      );
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