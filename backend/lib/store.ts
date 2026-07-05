import { scheduleActivity } from "./cloud/activityLog";
import { persistCitizen, persistGrievance } from "./cloud/persist";
import type { SessionUser } from "./auth/types";

export type GrievanceStatus = "submitted" | "under-review" | "in-progress" | "resolved";

export interface CitizenAccount {
  id: string;
  phone: string;
  name: string;
  email: string;
  constituencyId: string;
  createdAt: string;
}

export interface Grievance {
  id: string;
  citizenId: string;
  citizenName: string;
  constituencyId: string;
  category: string;
  subject: string;
  description: string;
  location?: string;
  status: GrievanceStatus;
  submittedAt: string;
  aiAcknowledgment?: string;
}

declare global {
   
  var __proximaCitizens: Map<string, CitizenAccount> | undefined;
   
  var __proximaGrievances: Grievance[] | undefined;
}

function citizens(): Map<string, CitizenAccount> {
  if (!global.__proximaCitizens) {
    global.__proximaCitizens = new Map();
  }
  return global.__proximaCitizens;
}

function grievances(): Grievance[] {
  if (!global.__proximaGrievances) {
    global.__proximaGrievances = [];
  }
  return global.__proximaGrievances;
}

export function findCitizenByPhone(phone: string): CitizenAccount | undefined {
  for (const c of citizens().values()) {
    if (c.phone === phone) return c;
  }
  return undefined;
}

export function createCitizen(data: {
  phone: string;
  name: string;
  email: string;
  constituencyId: string;
  id?: string;
}): CitizenAccount {
  const account: CitizenAccount = {
    id: data.id ?? `CIT-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
  };
  citizens().set(account.id, account);
  persistCitizen(account);
  scheduleActivity({
    type: "citizen.registered",
    summary: `${account.name} registered in constituency ${account.constituencyId}`,
    entityType: "citizen",
    entityId: account.id,
    actorId: account.id,
    actorRole: "citizen",
    constituencyId: account.constituencyId,
    citizenId: account.id,
  });
  return account;
}

export function getCitizenById(id: string): CitizenAccount | undefined {
  return citizens().get(id);
}

export function updateCitizenConstituency(
  citizenId: string,
  constituencyId: string
): CitizenAccount | undefined {
  const citizen = citizens().get(citizenId);
  if (!citizen || citizen.constituencyId === constituencyId) return citizen;

  const previous = citizen.constituencyId;
  const updated: CitizenAccount = { ...citizen, constituencyId };
  citizens().set(citizenId, updated);
  persistCitizen(updated);
  scheduleActivity({
    type: "citizen.constituency_changed",
    summary: `Constituency updated: ${previous} → ${constituencyId}`,
    entityType: "citizen",
    entityId: citizenId,
    actorId: citizenId,
    actorRole: "citizen",
    constituencyId,
    citizenId,
    metadata: { previousConstituencyId: previous, newConstituencyId: constituencyId },
  });
  return updated;
}

export function addGrievance(
  data: Omit<Grievance, "id" | "submittedAt" | "status">
): Grievance {
  const g: Grievance = {
    ...data,
    id: `GRV-${Date.now()}`,
    status: "submitted",
    submittedAt: new Date().toISOString(),
  };
  grievances().unshift(g);
  persistGrievance(g);
  scheduleActivity({
    type: "grievance.created",
    summary: `Grievance submitted: ${g.subject}`,
    entityType: "grievance",
    entityId: g.id,
    actorId: g.citizenId,
    actorRole: "citizen",
    constituencyId: g.constituencyId,
    citizenId: g.citizenId,
  });
  return g;
}

export function getGrievancesByConstituency(constituencyId: string): Grievance[] {
  return grievances().filter((g) => g.constituencyId === constituencyId);
}

export function getGrievancesByCitizen(citizenId: string): Grievance[] {
  return grievances().filter((g) => g.citizenId === citizenId);
}

export function updateGrievanceStatus(
  id: string,
  status: GrievanceStatus
): Grievance | undefined {
  const list = grievances();
  const idx = list.findIndex((g) => g.id === id);
  if (idx === -1) return undefined;
  const prev = list[idx].status;
  list[idx] = { ...list[idx], status };
  persistGrievance(list[idx]);
  scheduleActivity({
    type: "grievance.status_changed",
    summary: `Grievance ${id}: ${prev} → ${status}`,
    entityType: "grievance",
    entityId: id,
    actorRole: "mp",
    constituencyId: list[idx].constituencyId,
    citizenId: list[idx].citizenId,
    metadata: { previousStatus: prev, newStatus: status },
  });
  return list[idx];
}

export function sessionFromCitizen(c: CitizenAccount): SessionUser {
  return {
    id: c.id,
    role: "citizen",
    phone: c.phone,
    name: c.name,
    email: c.email,
    constituencyId: c.constituencyId,
  };
}