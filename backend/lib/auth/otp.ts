import {
  deleteOtpRecord,
  loadOtpRecord,
  otpDocumentId,
  saveOtpRecord,
} from "./otpPersistence";
import type { OtpPurpose, OtpRecord, UserRole } from "./types";

const OTP_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

declare global {
  var __proximaOtpStore: Map<string, OtpRecord> | undefined;
}

function getStore(): Map<string, OtpRecord> {
  if (!global.__proximaOtpStore) {
    global.__proximaOtpStore = new Map();
  }
  return global.__proximaOtpStore;
}

function otpKey(phone: string, purpose: OtpPurpose, role: UserRole): string {
  return otpDocumentId(phone, purpose, role);
}

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function normalizePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  return null;
}

export async function createOtp(
  phone: string,
  purpose: OtpPurpose,
  role: UserRole
): Promise<{ otp: string; expiresIn: number }> {
  const store = getStore();
  const otp = generateOtp();
  const key = otpKey(phone, purpose, role);
  const record: OtpRecord = {
    phone,
    otp,
    purpose,
    role,
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
  };
  store.set(key, record);
  await saveOtpRecord(key, record);
  return { otp, expiresIn: OTP_TTL_MS / 1000 };
}

export async function verifyOtp(
  phone: string,
  purpose: OtpPurpose,
  role: UserRole,
  submittedOtp: string
): Promise<{ valid: boolean; error?: string }> {
  const store = getStore();
  const key = otpKey(phone, purpose, role);
  let record = store.get(key);

  if (!record) {
    record = (await loadOtpRecord(key)) ?? undefined;
    if (record) store.set(key, record);
  }

  if (!record) {
    return { valid: false, error: "OTP expired or not found. Please request a new one." };
  }

  if (Date.now() > record.expiresAt) {
    store.delete(key);
    await deleteOtpRecord(key);
    return { valid: false, error: "OTP has expired. Please request a new one." };
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    store.delete(key);
    await deleteOtpRecord(key);
    return { valid: false, error: "Too many failed attempts. Please request a new OTP." };
  }

  if (record.otp !== submittedOtp.trim()) {
    record.attempts += 1;
    store.set(key, record);
    await saveOtpRecord(key, record);
    const remaining = MAX_ATTEMPTS - record.attempts;
    return {
      valid: false,
      error: `Invalid OTP. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
    };
  }

  store.delete(key);
  await deleteOtpRecord(key);
  return { valid: true };
}

export function maskPhone(phone: string): string {
  return `+91 ${phone.slice(0, 2)}****${phone.slice(-4)}`;
}