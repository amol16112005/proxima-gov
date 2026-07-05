export type StorageProvider = "mongodb" | "sqlite" | "memory";

export function getStorageProvider(): StorageProvider {
  if (process.env.PROXIMA_STORAGE === "off") return "memory";
  if (process.env.MONGODB_URI?.trim()) return "mongodb";
  return "sqlite";
}

export function isStorageEnabled(): boolean {
  return getStorageProvider() !== "memory";
}

/** @deprecated Use isStorageEnabled */
export function isCloudEnabled(): boolean {
  return isStorageEnabled();
}