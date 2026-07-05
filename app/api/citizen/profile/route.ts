import { NextResponse } from "next/server";
import { getConstituencyById } from "@/data/constituencies";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession, sessionCookieOptions, signSession } from "@/lib/auth/session";
import {
  getCitizenById,
  sessionFromCitizen,
  updateCitizenConstituency,
} from "@/lib/store";

export async function GET() {
  await ensureDataHydrated();

  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const citizen = getCitizenById(session.id);
  if (!citizen) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const constituency = getConstituencyById(citizen.constituencyId);
  return NextResponse.json({
    citizen,
    constituency: constituency
      ? { id: constituency.id, name: constituency.name, state: constituency.state }
      : null,
  });
}

export async function PATCH(request: Request) {
  await ensureDataHydrated();

  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { constituencyId } = body as { constituencyId?: string };

  if (!constituencyId?.trim()) {
    return NextResponse.json({ error: "Constituency is required." }, { status: 400 });
  }

  const constituency = getConstituencyById(constituencyId);
  if (!constituency) {
    return NextResponse.json({ error: "Invalid constituency selected." }, { status: 400 });
  }

  const citizen = getCitizenById(session.id);
  if (!citizen) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  if (citizen.constituencyId === constituencyId) {
    return NextResponse.json({
      citizen,
      constituency: { id: constituency.id, name: constituency.name, state: constituency.state },
      message: "Constituency is already set to this seat.",
    });
  }

  const updated = updateCitizenConstituency(session.id, constituencyId);
  if (!updated) {
    return NextResponse.json({ error: "Could not update constituency." }, { status: 500 });
  }

  const sessionUser = sessionFromCitizen(updated);
  const token = signSession(sessionUser);
  const response = NextResponse.json({
    citizen: updated,
    user: sessionUser,
    constituency: { id: constituency.id, name: constituency.name, state: constituency.state },
    message: `Your constituency is now ${constituency.name}, ${constituency.state}.`,
  });
  response.cookies.set(sessionCookieOptions(token));
  return response;
}