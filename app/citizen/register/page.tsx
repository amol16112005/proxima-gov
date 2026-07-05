"use client";

import Link from "next/link";
import { useState } from "react";
import AuthPageShell from "@/components/AuthPageShell";
import OtpAuthFlow from "@/components/OtpAuthFlow";
import { CONSTITUENCIES } from "@/data/constituencies";
import styles from "@/app/shared.module.css";

export default function CitizenRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [constituencyId, setConstituencyId] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);

  const validateBeforeSend = (): boolean => {
    if (!name.trim()) { setFieldError("Please enter your full name."); return false; }
    if (!email.trim() || !email.includes("@")) { setFieldError("Please enter a valid email."); return false; }
    if (!constituencyId) { setFieldError("Please select your constituency."); return false; }
    setFieldError(null);
    return true;
  };

  const validateFields = (): Record<string, string> | null => {
    if (!name.trim()) {
      setFieldError("Please enter your full name.");
      return null;
    }
    if (!email.trim() || !email.includes("@")) {
      setFieldError("Please enter a valid email address.");
      return null;
    }
    if (!constituencyId) {
      setFieldError("Please select your constituency.");
      return null;
    }
    setFieldError(null);
    return { name: name.trim(), email: email.trim(), constituencyId };
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