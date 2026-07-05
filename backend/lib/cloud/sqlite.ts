import { mkdirSync } from "fs";
import { dirname, isAbsolute, resolve } from "path";
import type Database from "better-sqlite3";

const DEFAULT_DB_PATH = resolve(process.cwd(), "backend", "data", "proxima.sqlite");

let db: Database.Database | undefined;

export function getDbPath(): string {
  const raw = process.env.PROXIMA_DB_PATH?.trim();
  if (!raw) return DEFAULT_DB_PATH;
  const cleaned = raw.replace(/^["']|["']$/g, "");
  return isAbsolute(cleaned) ? cleaned : resolve(process.cwd(), cleaned);
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS citizens (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS grievances (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS activity_log (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_activity_created
      ON activity_log (created_at DESC);
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function loadSqlite(): typeof import("better-sqlite3") {
  // Lazy load — avoids bundling native module on Vercel when using MongoDB
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("better-sqlite3") as typeof import("better-sqlite3");
}

export function getDb(): Database.Database | null {
  if (process.env.PROXIMA_STORAGE === "off") return null;
  if (process.env.VERCEL === "1" && !process.env.MONGODB_URI?.trim()) return null;
  if (db) return db;

  const path = getDbPath();
  mkdirSync(dirname(path), { recursive: true });
  const Database = loadSqlite();
  db = new Database(path);
  db.pragma("journal_mode = WAL");
  initSchema(db);
  return db;
}