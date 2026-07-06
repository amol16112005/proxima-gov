import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import type { CitizenAccount, Grievance } from "@/lib/store";
import type { Notification } from "@/lib/notifications";
import type { ActivityEntry } from "./activityLog";
import { isStorageEnabled } from "./provider";
import {
  saveActivity,
  saveCitizen,
  saveGrievance,
  saveIssue,
  saveIssueCounter,
  saveNotification,
  seedIssues,
} from "./storage";

export function persistCitizen(citizen: CitizenAccount): void {
  if (!isStorageEnabled()) return;
  saveCitizen(citizen);
}

export async function persistIssue(issue: DevelopmentIssue): Promise<void> {
  if (!isStorageEnabled()) return;
  await saveIssue(issue);
}

export function persistGrievance(grievance: Grievance): void {
  if (!isStorageEnabled()) return;
  saveGrievance(grievance);
}

export function persistNotification(notification: Notification): void {
  if (!isStorageEnabled()) return;
  saveNotification(notification);
}

export function persistIssueCounter(value: number): void {
  if (!isStorageEnabled()) return;
  saveIssueCounter(value);
}

export function persistActivity(entry: ActivityEntry): void {
  if (!isStorageEnabled()) return;
  saveActivity(entry);
}

export async function seedIssuesToStorage(issues: DevelopmentIssue[]): Promise<void> {
  if (!isStorageEnabled()) return;
  await seedIssues(issues);
}