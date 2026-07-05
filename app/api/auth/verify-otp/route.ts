import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { normalizePhone, verifyOtp } from "@/lib/auth/otp";
import { sessionCookieOptions, signSession } from "@/lib/auth/session";
import type { OtpPurpose, UserRole } from "@/lib/auth/types";
import { getConstituencyById } from "@/data/constituencies";
import { createCitizen, findCitizenByPhone, sessionFromCitizen } from "@/lib/store";

export async function POST(request: Request) {
  try {
    await ensureDataHydrated();
    const body = await request.json();
    const {
      phone: rawPhone,
      otp,
      role,
      purpose,
      name,
      email,
      constituencyId,
    } = body as {
      phone: string;
      otp: string;
      role: UserRole;
      purpose: OtpPurpose;
      name?: string;
      email?: string;
      constituencyId?: string;
    };

    if (!rawPhone || !otp || !role || !purpose) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (role === "mp") {
      return NextResponse.json(
        { error: "MP portal uses username and PIN login. Go to /mp/login instead." },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json({ error: "Invalid phone number." }, { status: 400 });
    }

    const result = await verifyOtp(phone, purpose, role, otp);
    if (!result.valid) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    let sessionUser;

    if (purpose === "register") {
      if (!name?.trim() || !email?.trim() || !constituencyId) {
        return NextResponse.json(
          { error: "Name, email, and constituency are required for registration." },
          { status: 400 }
        );
      }
      if (!getConstituencyById(constituencyId)) {
        return NextResponse.json({ error: "Invalid constituency selected." }, { status: 400 });
      }
      if (findCitizenByPhone(phone)) {
        return NextResponse.json(
          {
            error: "An account with this number already exists. Please log in instead.",
            code: "ALREADY_EXISTS",
          },
          { status: 409 }
        );
      }

      const citizenId = `CIT-${Date.now()}`;
      sessionUser = sessionFromCitizen({
        id: citizenId,
        phone,
        name: name.trim(),
        email: email.trim(),
        constituencyId,
        createdAt: new Date().toISOString(),
      });

      const token = signSession(sessionUser);
      createCitizen({
        id: citizenId,
        phone,
        name: name.trim(),
        email: email.trim(),
        constituencyId,
      });

      const response = NextResponse.json({
        user: sessionUser,
        redirect: "/citizen/dashboard",
      });
      response.cookies.set(sessionCookieOptions(token));
      return response;
    }

    const citizen = findCitizenByPhone(phone);
    if (!citizen) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }
    sessionUser = sessionFromCitizen(citizen);

    const token = signSession(sessionUser);
    const response = NextResponse.json({
      user: sessionUser,
      redirect: "/citizen/dashboard",
    });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (err) {
    console.error("[verify-otp]", err);
    const message = err instanceof Error ? err.message : "";
    if (message.includes("SESSION_SECRET")) {
      return NextResponse.json(
        {
          error:
            "Server session is not configured. Set SESSION_SECRET (32+ characters) in Vercel environment variables.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}