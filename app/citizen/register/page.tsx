"use client";

import Link from "next/link";
import { useState } from "react";
import AuthPageShell from "@/components/AuthPageShell";
import OtpAuthFlow from "@/components/OtpAuthFlow";
import { CONSTITUENCIES } from "@/data/constituencies";
import { validateRegistrationFields as validateRegistration } from "@/lib/validation";
import styles from "@/app/shared.module.css";

export default function CitizenRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const runValidation = () =>
    validateRegistration({ name, email, constituencyId });

  const validateBeforeSend = (): boolean => {
    const result = runValidation();
    if (!result.ok) {
      setFieldError(result.error);
      return false;
    }
    setFieldError(null);
    return true;
  };

  const validateFields = (): Record<string, string> | null => {
    const result = runValidation();
    if (!result.ok) {
      setFieldError(result.error);
      return null;
    }
    setFieldError(null);
    return result.data;
  };

  return (
    <AuthPageShell portal="citizen" badge="Citizen Portal · New Registration">
      <OtpAuthFlow
        role="citizen"
        purpose="register"
        title="Create Citizen Account"
        subtitle="Register with your mobile number, select your constituency, and verify via OTP."
        onBeforeSend={validateBeforeSend}
        onBeforeVerify={validateFields}
        registrationFields={
          <>
            {fieldError && <p className={styles.errorMsg} role="alert">{fieldError}</p>}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="name">
                Full Name<span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="As per Aadhaar / voter ID"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="email">
                Email Address<span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="constituency">
                Constituency<span className={styles.required}>*</span>
              </label>
              <select
                id="constituency"
                className={styles.select}
                value={constituencyId}
                onChange={(e) => setConstituencyId(e.target.value)}
              >
                <option value="">Select your parliamentary constituency</option>
                {CONSTITUENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state} — MP: {c.mpName}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
        footer={
          <p style={{ fontSize: "0.88rem", color: "#7c8db5" }}>
            Already registered?{" "}
            <Link href="/citizen/login" style={{ color: "#a78bfa" }}>
              Login here
            </Link>
            {" · "}
            <Link href="/" className={styles.linkMuted}>
              Back to home
            </Link>
          </p>
        }
      />
    </AuthPageShell>
  );
}