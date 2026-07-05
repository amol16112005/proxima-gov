"use client";

import Link from "next/link";
import { useState } from "react";
import AuthPageShell from "@/components/AuthPageShell";
import OtpAuthFlow from "@/components/OtpAuthFlow";
import { useAccessibility } from "@/context/AccessibilityContext";
import { CONSTITUENCIES } from "@/data/constituencies";
import { validateRegistrationFields as validateRegistration } from "@/lib/validation";
import styles from "@/app/shared.module.css";

export default function CitizenRegisterPage() {
  const { translate: t } = useAccessibility();
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
    <AuthPageShell portal="citizen" badgeKey="auth.registerBadge">
      <OtpAuthFlow
        role="citizen"
        purpose="register"
        onBeforeSend={validateBeforeSend}
        onBeforeVerify={validateFields}
        registrationFields={
          <>
            {fieldError && <p className={styles.errorMsg} role="alert">{fieldError}</p>}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="name">
                {t("auth.fullName")}<span className={styles.required}>*</span>
              </label>
              <input
                id="name"
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder={t("auth.namePlaceholder")}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="email">
                {t("auth.email")}<span className={styles.required}>*</span>
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="constituency">
                {t("auth.constituency")}<span className={styles.required}>*</span>
              </label>
              <select
                id="constituency"
                className={styles.select}
                value={constituencyId}
                onChange={(e) => setConstituencyId(e.target.value)}
              >
                <option value="">{t("auth.selectConstituency")}</option>
                {CONSTITUENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state} — {t("profile.mpLabel")} {c.mpName}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
        footer={
          <p style={{ fontSize: "0.88rem", color: "#7c8db5" }}>
            {t("auth.alreadyRegistered")}{" "}
            <Link href="/citizen/login" style={{ color: "#a78bfa" }}>
              {t("auth.loginHere")}
            </Link>
            {" · "}
            <Link href="/" className={styles.linkMuted}>
              {t("auth.backHome")}
            </Link>
          </p>
        }
      />
    </AuthPageShell>
  );
}