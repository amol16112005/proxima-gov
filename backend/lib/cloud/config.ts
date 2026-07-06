import { existsSync } from "fs";
import { getMongoUri } from "./mongo";
import { getStorageProvider } from "./provider";
import { getDbPath } from "./sqlite";

export { isCloudEnabled } from "./provider";

export function cloudStatus(): {
  enabled: boolean;
  provider: "mongodb" | "sqlite" | "memory";
  message: string;
  location?: string;
  ready?: boolean;
} {
  const provider = getStorageProvider();

  if (provider === "memory") {
    return {
      enabled: false,
      provider: "memory",
      message: "Demo mode — data resets when the server restarts.",
    };
  }

  if (provider === "mongodb") {
    const uri = getMongoUri();
    return {
      enabled: true,
      provider: "mongodb",
      message: "MongoDB active — activity history saved in the cloud.",
      location: uri?.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@"),
      ready: Boolean(uri),
    };
  }

  const dbPath = getDbPath();
  return {
    enabled: true,
    provider: "sqlite",
    message:
      "History is saved locally in SQLite — free, no account, persists across restarts.",
    location: dbPath,
    ready: existsSync(dbPath),
  };
}