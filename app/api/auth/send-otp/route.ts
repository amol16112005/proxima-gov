import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { createOtp, maskPhone, normalizePhone } from "@/lib/auth/otp";
import type { OtpPurpose, UserRole } from "@/lib/auth/types";
import { findCitizenByPhone } from "@/lib/store";

export async function POST(request: Request) {
  try {
    await ensureDataHydrated();
    const body = await request.json();
    const { phone: rawPhone, role, purpose } = body as {
      phone: string;
      role: UserRole;
      purpose: OtpPurpose;
    };

    if (!rawPhone || !role || !purpose) {
      return NextResponse.json({ error: "Phone, role, and purpose are required." }, { status: 400 });
    }

    const phone = normalizePhone(rawPhone);
    if (!phone) {
      return NextResponse.json(
        { error: "Enter a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    if (role === "mp") {
      return NextResponse.json(
        {
          error: "MP portal uses username and PIN login. Go to /mp/login instead.",
        },
        { status: 400 }
      );
    }

    if (role === "citizen" && purpose === "login") {
      const citizen = findCitizenByPhone(phone);
      if (!citizen) {
        return NextResponse.json(
          { error: "No account found. Please register first.", code: "NOT_REGISTERED" },
          { status: 404 }
        );
      }
    }

    if (role === "citizen" && purpose === "register") {
      const existing = findCitizenByPhone(phone);
      if (existing) {
        return NextResponse.json(
          { error: "An account with this number already exists. Please log in.", code: "ALREADY_EXISTS" },
          { status: 409 }
        );
      }
    }

    const { otp, expiresIn } = createOtp(phone, purpose, role);

    const response: Record<string, string | number> = {
      message: `OTP sent to ${maskPhone(phone)}`,
      maskedPhone: maskPhone(phone),
      expiresIn,
    };

    // Demo / hackathon: no SMS gateway — expose OTP only in development for testing.
    if (process.env.NODE_ENV === "development") {
      response.demoOtp = otp;
      response.demoNote =
        "Demo mode: SMS is not configured. Use the 6-digit code shown below (not sent to your phone).";
      console.info(`[Proxima Gov dev OTP] ${maskPhone(phone)} → ${otp}`);
    }

    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Failed to send OTP." }, { status: 500 });
  }
}