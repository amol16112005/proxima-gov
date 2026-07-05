import type { UserRole } from "@/lib/auth/types";
import type { LifecycleStage } from "@/data/lifecycleTypes";
import { isStorageEnabled } from "./provider";
import { saveActivity } from "./storage";

export type ActivityType =
  | "citizen.registered"
  | "citizen.constituency_changed"
  | "issue.created"
  | "issue.stage_changed"
  | "issue.mp_action"
  | "issue.citizen_verify"
  | "issue.progress_photo"
  | "grievance.created"
  | "grievance.status_changed"
  | "notification.sent";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  summary: string;
  entityType: "citizen" | "issue" | "grievance" | "notification";
  entityId: string;
  actorId?: string;
  actorRole?: UserRole;
  constituencyId?: string;
  citizenId?: string;
  issueId?: string;
  stage?: LifecycleStage;
  metadata?: Record<string, string | number | boolean>;
  createdAt: string;
}

declare global {
   
  var __proximaActivityLog: ActivityEntry[] | undefined;
}

function memoryLog(): ActivityEntry[] {
  if (!global.__proximaActivityLog) {
    global.__proximaActivityLog = [];
  }
  return global.__proximaActivityLog;
}

function newId(): string {
  return `ACT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function logActivityLocal(entry: Omit<ActivityEntry, "id" | "createdAt">): ActivityEntry {
  const record: ActivityEntry = {
    ...entry,
    id: newId(),
    createdAt: new Date().toISOString(),
  };
  memoryLog().unshift(record);
  if (memoryLog().length > 500) memoryLog().length = 500;
  if (isStorageEnabled()) saveActivity(record);
  return record;
}

export async function logActivity(
  entry: Omit<ActivityEntry, "id" | "createdAt">
): Promise<ActivityEntry> {
  return logActivityLocal(entry);
}

export function scheduleActivity(
  entry: Omit<ActivityEntry, "id" | "createdAt">
): void {
  logActivityLocal(entry);
}

export { loadActivityLog as loadActivityFromStorage } from "./storage";

/** @deprecated Use loadActivityFromStorage */
export async function loadActivityFromCloud(): Promise<ActivityEntry[]> {
  const { loadActivityLog } = await import("./storage");
  return loadActivityLog();
}

export function getActivityForCitizen(citizenId: string, limit = 50): ActivityEntry[] {
  return memoryLog()
    .filter(
      (e) =>
        e.citizenId === citizenId ||
        e.actorId === citizenId ||
        (e.entityType === "issue" && e.actorId === citizenId)
    )
    .slice(0, limit);
}

export function getActivityForConstituency(constituencyId: string, limit = 50): ActivityEntry[] {
  return memoryLog()
    .filter((e) => e.constituencyId === constituencyId)
    .slice(0, limit);
}

export function getActivityForIssue(issueId: string): ActivityEntry[] {
  return memoryLog().filter((e) => e.issueId === issueId || e.entityId === issueId);
}

export function replaceActivityLog(entries: ActivityEntry[]): void {
  global.__proximaActivityLog = entries.slice(0, 500);
}

export function isActivityCloudBacked(): boolean {
  return isStorageEnabled();
}