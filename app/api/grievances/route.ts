import { NextResponse } from "next/server";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { generateGovResponse } from "@/lib/ai/geminiEngine";
import {
  addGrievance,
  getGrievancesByCitizen,
  getGrievancesByConstituency,
  updateGrievanceStatus,
  type GrievanceStatus,
} from "@/lib/store";

const CATEGORIES = [
  "infrastructure",
  "healthcare",
  "education",
  "water-sanitation",
  "employment",
  "safety",
  "other",
] as const;

export async function GET() {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const grievances =
    session.role === "citizen"
      ? getGrievancesByCitizen(session.id)
      : getGrievancesByConstituency(session.constituencyId);

  return NextResponse.json({ grievances });
}

export async function POST(request: Request) {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "citizen") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { category, subject, description, location } = body as {
    category: string;
    subject: string;
    description: string;
    location?: string;
  };

  if (!category || !subject?.trim() || !description?.trim()) {
    return NextResponse.json({ error: "Category, subject, and description are required." }, { status: 400 });
  }

  if (!CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    return NextResponse.json({ error: "Invalid category." }, { status: 400 });
  }

  let aiAcknowledgment: string | undefined;
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (apiKey) {
    try {
      const prompt =
        `A citizen named ${session.name} from constituency ${session.constituencyId} submitted a grievance. ` +
        `Category: ${category}. Subject: ${subject}. Details: ${description}. ` +
        `Write a brief formal acknowledgment (2-3 sentences) with a 7-14 business day response timeline.`;
      aiAcknowledgment = await generateGovResponse(prompt);
    } catch {
      // Non-blocking
    }
  }

  const grievance = addGrievance({
    citizenId: session.id,
    citizenName: session.name,
    constituencyId: session.constituencyId,
    category,
    subject: subject.trim(),
    description: description.trim(),
    location: location?.trim(),
    aiAcknowledgment,
  });

  return NextResponse.json({ grievance }, { status: 201 });
}

export async function PATCH(request: Request) {
  await ensureDataHydrated();
  const session = await getSession();
  if (!session || session.role !== "mp") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, status } = body as { id: string; status: GrievanceStatus };

  const validStatuses: GrievanceStatus[] = ["submitted", "under-review", "in-progress", "resolved"];
  if (!id || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const updated = updateGrievanceStatus(id, status);
  if (!updated || updated.constituencyId !== session.constituencyId) {
    return NextResponse.json({ error: "Grievance not found." }, { status: 404 });
  }

  return NextResponse.json({ grievance: updated });
}