export type UserRole = "citizen" | "mp";

export interface SessionUser {
  id: string;
  role: UserRole;
  phone: string;
  name: string;
  email?: string;
  constituencyId: string;
  mpId?: string;
}

export interface SessionPayload extends SessionUser {
  expiresAt: number;
}

export type OtpPurpose = "login" | "register";

export interface OtpRecord {
  phone: string;
  otp: string;
  purpose: OtpPurpose;
  role: UserRole;
  expiresAt: number;
  attempts: number;
}