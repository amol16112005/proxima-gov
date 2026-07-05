import { COLLECTIONS } from "@/lib/cloud/collections";
import { getMongoDb } from "@/lib/cloud/mongo";
import { getStorageProvider } from "@/lib/cloud/provider";
import type { Document } from "mongodb";
import type { OtpPurpose, OtpRecord, UserRole } from "./types";

type StoredOtpDoc = Document & OtpRecord & { _id: string; updatedAt?: string };

export function otpDocumentId(
  phone: string,
  purpose: OtpPurpose,
  role: UserRole
): string {
  return `${role}:${purpose}:${phone}`;
}

export async function saveOtpRecord(
  key: string,
  record: OtpRecord
): Promise<void> {
  if (getStorageProvider() !== "mongodb") return;
  try {
    const db = await getMongoDb();
    if (!db) return;
    await db.collection<StoredOtpDoc>(COLLECTIONS.otps).updateOne(
      { _id: key },
      { $set: { ...record, _id: key, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("[otp] save failed:", err);
  }
}

export async function loadOtpRecord(key: string): Promise<OtpRecord | null> {
  if (getStorageProvider() !== "mongodb") return null;
  try {
    const db = await getMongoDb();
    if (!db) return null;
    const doc = await db.collection<StoredOtpDoc>(COLLECTIONS.otps).findOne({ _id: key });
    if (!doc) return null;
    const { _id, updatedAt, ...record } = doc;
    void _id;
    void updatedAt;
    return record;
  } catch (err) {
    console.error("[otp] load failed:", err);
    return null;
  }
}

export async function deleteOtpRecord(key: string): Promise<void> {
  if (getStorageProvider() !== "mongodb") return;
  try {
    const db = await getMongoDb();
    if (!db) return;
    await db.collection<StoredOtpDoc>(COLLECTIONS.otps).deleteOne({ _id: key });
  } catch (err) {
    console.error("[otp] delete failed:", err);
  }
}