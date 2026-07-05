import { existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const envPath = resolve(root, ".env.local");

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(envPath);

if (process.env.PROXIMA_STORAGE === "off") {
  console.error("❌ Storage disabled (PROXIMA_STORAGE=off)");
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI?.trim();

if (mongoUri) {
  const { MongoClient } = await import("mongodb");
  const dbName = process.env.MONGODB_DB?.trim() || "proxima_gov";
  const client = new MongoClient(mongoUri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();
    const citizens = await db.collection("citizens").countDocuments();
    const issues = await db.collection("issues").countDocuments();
    const activity = await db.collection("activity_log").countDocuments();

    console.log("✅ MongoDB storage ready");
    console.log(`   Database: ${dbName}`);
    console.log(`   URI: ${mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")}`);
    console.log(`   Collections: ${collections.length}`);
    console.log(`   Citizens: ${citizens}`);
    console.log(`   Issues: ${issues}`);
    console.log(`   Activity entries: ${activity}`);
  } catch (err) {
    console.error("❌ MongoDB connection failed");
    console.error(`   ${err?.message ?? err}`);
    console.error("   Check Atlas: user password, IP whitelist (0.0.0.0/0 for dev).");
    process.exit(1);
  } finally {
    await client.close();
  }
} else {
  const Database = (await import("better-sqlite3")).default;
  const dbPath = resolve(root, "backend", "data", "proxima.sqlite");

  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS citizens (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS issues (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS grievances (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS notifications (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS activity_log (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);

  const citizens = db.prepare("SELECT COUNT(*) AS count FROM citizens").get();
  const issues = db.prepare("SELECT COUNT(*) AS count FROM issues").get();
  const activity = db.prepare("SELECT COUNT(*) AS count FROM activity_log").get();

  console.log("✅ SQLite storage ready (default)");
  console.log(`   Database: ${dbPath}`);
  console.log(`   Citizens: ${citizens.count}`);
  console.log(`   Issues: ${issues.count}`);
  console.log(`   Activity entries: ${activity.count}`);
  db.close();
}