import { SEED_ISSUES } from "@/data/seedIssues";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import type { CitizenAccount, Grievance } from "@/lib/store";
import type { Notification } from "@/lib/notifications";
import { logActivityLocal, replaceActivityLog } from "./activityLog";
import { loadActivityLog } from "./storage";
import { cloudStatus } from "./config";
import { isStorageEnabled, getStorageProvider } from "./provider";
import { persistIssueCounter, seedIssuesToStorage } from "./persist";
import {
  loadCitizens,
  loadGrievances,
  loadIssueCounter,
  loadIssues,
  loadNotifications,
} from "./storage";

declare global {
   
  var __proximaHydrated: boolean | undefined;
   
  var __proximaHydratePromise: Promise<void> | undefined;
}

function setCitizens(map: Map<string, CitizenAccount>): void {
  global.__proximaCitizens = map;
}

function setGrievances(list: Grievance[]): void {
  global.__proximaGrievances = list;
}

function setIssues(list: DevelopmentIssue[]): void {
  global.__proximaIssues = list;
}

function setNotifications(list: Notification[]): void {
  global.__proximaNotifications = list;
}

function setIssueCounter(value: number): void {
  global.__proximaIssueCounter = value;
}

async function hydrateFromStorage(): Promise<void> {
  const citizenMap = new Map<string, CitizenAccount>();
  for (const citizen of await loadCitizens()) {
    citizenMap.set(citizen.id, citizen);
  }
  setCitizens(citizenMap);

  let issues = await loadIssues();
  if (issues.length === 0) {
    issues = SEED_ISSUES.map((i) => ({ ...i }));
    await seedIssuesToStorage(issues);
    for (const issue of issues) {
      logActivityLocal({
        type: "issue.created",
        summary: `Demo issue seeded: ${issue.title}`,
        entityType: "issue",
        entityId: issue.id,
        issueId: issue.id,
        constituencyId: issue.constituencyId,
        citizenId: issue.citizenId,
        stage: issue.stage,
      });
    }
  }
  setIssues(issues);

  setGrievances(await loadGrievances());
  setNotifications(await loadNotifications());

  const existingCounter = await loadIssueCounter();
  const counterValue = existingCounter ?? 6000;
  setIssueCounter(counterValue);
  if (existingCounter === null) {
    persistIssueCounter(counterValue);
  }

  const activity = await loadActivityLog();
  if (activity.length > 0) {
    replaceActivityLog(activity);
  }
}

function seedDemoActivityFromIssues(): void {
  const issues = global.__proximaIssues;
  if (!issues?.length) return;

  for (const issue of issues) {
    logActivityLocal({
      type: "issue.created",
      summary: `Issue tracked: ${issue.title}`,
      entityType: "issue",
      entityId: issue.id,
      issueId: issue.id,
      constituencyId: issue.constituencyId,
      citizenId: issue.citizenId,
      stage: issue.stage,
    });
    const latest = issue.timeline[issue.timeline.length - 1];
    if (latest) {
      logActivityLocal({
        type: "issue.stage_changed",
        summary: latest.label,
        entityType: "issue",
        entityId: issue.id,
        issueId: issue.id,
        constituencyId: issue.constituencyId,
        citizenId: issue.citizenId,
        stage: latest.stage,
      });
    }
  }
}

async function doHydrate(): Promise<void> {
  if (global.__proximaHydrated) return;

  if (!isStorageEnabled()) {
    if (!global.__proximaActivityLog?.length) {
      if (!global.__proximaIssues) {
        global.__proximaIssues = SEED_ISSUES.map((i) => ({ ...i }));
      }
      seedDemoActivityFromIssues();
    }
    global.__proximaHydrated = true;
    return;
  }

  try {
    await hydrateFromStorage();
    console.info(`[storage] Data hydrated from ${getStorageProvider()}`);
  } catch (err) {
    console.error("[storage] Hydration failed, using in-memory fallback:", err);
  }

  global.__proximaHydrated = true;
}

export async function ensureDataHydrated(): Promise<void> {
  if (global.__proximaHydrated) return;
  if (!global.__proximaHydratePromise) {
    global.__proximaHydratePromise = doHydrate();
  }
  await global.__proximaHydratePromise;
}

export { cloudStatus };