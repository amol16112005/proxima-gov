import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { stripMongoId } from "@/lib/omit";
import type { CitizenAccount, Grievance } from "@/lib/store";
import type { Notification } from "@/lib/notifications";
import type { Document } from "mongodb";
import type { ActivityEntry } from "./activityLog";
import { COLLECTIONS, META_DOCS } from "./collections";
import { getMongoDb } from "./mongo";
import { getStorageProvider } from "./provider";
import { getDb, getDbPath } from "./sqlite";

type StoredDoc<T> = Document & T & { _id: string };

function runAsync(label: string, fn: () => Promise<void>): void {
  void fn().catch((err) => console.error(`[storage] ${label} failed:`, err));
}

function sqliteUpsert(table: string, id: string, data: unknown): void {
  const database = getDb();
  if (!database) return;
  database
    .prepare(`INSERT OR REPLACE INTO ${table} (id, data) VALUES (?, ?)`)
    .run(id, JSON.stringify(data));
}

function sqliteLoadAll<T>(table: string): T[] {
  const database = getDb();
  if (!database) return [];
  const rows = database.prepare(`SELECT data FROM ${table}`).all() as { data: string }[];
  return rows.map((row) => JSON.parse(row.data) as T);
}

export function saveCitizen(citizen: CitizenAccount): void {
  if (getStorageProvider() === "mongodb") {
    runAsync("saveCitizen", async () => {
      const db = await getMongoDb();
      if (!db) return;
      await db
        .collection<StoredDoc<CitizenAccount>>(COLLECTIONS.citizens)
        .replaceOne({ _id: citizen.id }, { ...citizen, _id: citizen.id }, { upsert: true });
    });
    return;
  }
  sqliteUpsert("citizens", citizen.id, citizen);
}

export function saveIssue(issue: DevelopmentIssue): void {
  if (getStorageProvider() === "mongodb") {
    runAsync("saveIssue", async () => {
      const db = await getMongoDb();
      if (!db) return;
      await db
        .collection<StoredDoc<DevelopmentIssue>>(COLLECTIONS.issues)
        .replaceOne({ _id: issue.id }, { ...issue, _id: issue.id }, { upsert: true });
    });
    return;
  }
  sqliteUpsert("issues", issue.id, issue);
}

export function saveGrievance(grievance: Grievance): void {
  if (getStorageProvider() === "mongodb") {
    runAsync("saveGrievance", async () => {
      const db = await getMongoDb();
      if (!db) return;
      await db
        .collection<StoredDoc<Grievance>>(COLLECTIONS.grievances)
        .replaceOne({ _id: grievance.id }, { ...grievance, _id: grievance.id }, { upsert: true });
    });
    return;
  }
  sqliteUpsert("grievances", grievance.id, grievance);
}

export function saveNotification(notification: Notification): void {
  if (getStorageProvider() === "mongodb") {
    runAsync("saveNotification", async () => {
      const db = await getMongoDb();
      if (!db) return;
      await db
        .collection<StoredDoc<Notification>>(COLLECTIONS.notifications)
        .replaceOne(
          { _id: notification.id },
          { ...notification, _id: notification.id },
          { upsert: true }
        );
    });
    return;
  }
  sqliteUpsert("notifications", notification.id, notification);
}

export function saveIssueCounter(value: number): void {
  if (getStorageProvider() === "mongodb") {
    runAsync("saveIssueCounter", async () => {
      const db = await getMongoDb();
      if (!db) return;
      await db
        .collection<StoredDoc<{ value: number }>>(COLLECTIONS.meta)
        .replaceOne(
          { _id: META_DOCS.issueCounter },
          { _id: META_DOCS.issueCounter, value },
          { upsert: true }
        );
    });
    return;
  }

  const database = getDb();
  if (!database) return;
  database
    .prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)")
    .run(META_DOCS.issueCounter, JSON.stringify({ value }));
}

export function saveActivity(entry: ActivityEntry): void {
  if (getStorageProvider() === "mongodb") {
    runAsync("saveActivity", async () => {
      const db = await getMongoDb();
      if (!db) return;
      await db
        .collection<StoredDoc<ActivityEntry>>(COLLECTIONS.activityLog)
        .replaceOne({ _id: entry.id }, { ...entry, _id: entry.id }, { upsert: true });
    });
    return;
  }

  const database = getDb();
  if (!database) return;
  database
    .prepare(
      "INSERT OR REPLACE INTO activity_log (id, created_at, data) VALUES (?, ?, ?)"
    )
    .run(entry.id, entry.createdAt, JSON.stringify(entry));
}

export async function seedIssues(issues: DevelopmentIssue[]): Promise<void> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return;
    const col = db.collection<StoredDoc<DevelopmentIssue>>(COLLECTIONS.issues);
    await Promise.all(
      issues.map((issue) =>
        col.replaceOne({ _id: issue.id }, { ...issue, _id: issue.id }, { upsert: true })
      )
    );
    return;
  }

  const database = getDb();
  if (!database) return;
  const insert = database.prepare(
    "INSERT OR REPLACE INTO issues (id, data) VALUES (?, ?)"
  );
  const seedAll = database.transaction((rows: DevelopmentIssue[]) => {
    for (const issue of rows) {
      insert.run(issue.id, JSON.stringify(issue));
    }
  });
  seedAll(issues);
}

export async function loadCitizens(): Promise<CitizenAccount[]> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return [];
    const docs = await db
      .collection<StoredDoc<CitizenAccount>>(COLLECTIONS.citizens)
      .find()
      .toArray();
    return docs.map((doc) => stripMongoId(doc) as CitizenAccount);
  }
  return sqliteLoadAll<CitizenAccount>("citizens");
}

export async function loadIssues(): Promise<DevelopmentIssue[]> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return [];
    const docs = await db
      .collection<StoredDoc<DevelopmentIssue>>(COLLECTIONS.issues)
      .find()
      .toArray();
    return docs.map((doc) => stripMongoId(doc) as DevelopmentIssue);
  }
  return sqliteLoadAll<DevelopmentIssue>("issues");
}

export async function loadGrievances(): Promise<Grievance[]> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return [];
    const docs = await db
      .collection<StoredDoc<Grievance>>(COLLECTIONS.grievances)
      .find()
      .toArray();
    return docs.map((doc) => stripMongoId(doc) as Grievance);
  }
  return sqliteLoadAll<Grievance>("grievances");
}

export async function loadNotifications(): Promise<Notification[]> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return [];
    const docs = await db
      .collection<StoredDoc<Notification>>(COLLECTIONS.notifications)
      .find()
      .toArray();
    return docs.map((doc) => stripMongoId(doc) as Notification);
  }
  return sqliteLoadAll<Notification>("notifications");
}

export async function loadIssueCounter(): Promise<number | null> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return null;
    const doc = await db
      .collection<StoredDoc<{ value: number }>>(COLLECTIONS.meta)
      .findOne({ _id: META_DOCS.issueCounter });
    return typeof doc?.value === "number" ? doc.value : null;
  }

  const database = getDb();
  if (!database) return null;
  const counterRow = database
    .prepare("SELECT value FROM meta WHERE key = ?")
    .get(META_DOCS.issueCounter) as { value: string } | undefined;
  if (!counterRow) return null;
  return (JSON.parse(counterRow.value) as { value?: number }).value ?? null;
}

export async function loadActivityLog(): Promise<ActivityEntry[]> {
  if (getStorageProvider() === "mongodb") {
    const db = await getMongoDb();
    if (!db) return [];
    const docs = await db
      .collection<StoredDoc<ActivityEntry>>(COLLECTIONS.activityLog)
      .find()
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return docs.map((doc) => stripMongoId(doc) as ActivityEntry);
  }

  const database = getDb();
  if (!database) return [];
  const rows = database
    .prepare("SELECT data FROM activity_log ORDER BY created_at DESC LIMIT 500")
    .all() as { data: string }[];
  return rows.map((row) => JSON.parse(row.data) as ActivityEntry);
}

export function getStorageLocation(): string {
  if (getStorageProvider() === "mongodb") {
    const uri = process.env.MONGODB_URI?.trim() ?? "";
    return uri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  }
  return getDbPath();
}