"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OtpPurpose, UserRole } from "@/lib/auth/types";
import styles from "@/app/shared.module.css";

interface OtpAuthFlowProps {
  role: UserRole;
  purpose: OtpPurpose;
  title: string;
  subtitle: string;
  registrationFields?: React.ReactNode;
  onBeforeSend?: () => boolean;
  onBeforeVerify?: () => Record<string, string> | null;
  footer?: React.ReactNode;
  redirectTo?: string | null;
  blocked?: boolean;
}

export default function OtpAuthFlow({
  role,
  purpose,
  title,
  subtitle,
  registrationFields,
  onBeforeSend,
  onBeforeVerify,
  footer,
  redirectTo,
  blocked = false,
}: OtpAuthFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [demoNote, setDemoNote] = useState<string | null>(null);

  const sendOtp = async () => {
    if (blocked) return;
    setError(null);
    if (onBeforeSend && !onBeforeSend()) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, role, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to send OTP.");
        return;
      }
      setMaskedPhone(data.maskedPhone);
      setDemoOtp(data.demoOtp ?? null);
      setDemoNote(data.demoNote ?? null);
      setOtp("");
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (blocked) return;
    setError(null);
    setLoading(true);
    try {
      const extra = onBeforeVerify?.();
      if (onBeforeVerify && !extra) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp, role, purpose, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed.");
        return;
      }
      router.push(redirectTo ?? data.redirect);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={styles.card}
      style={blocked ? { opacity: 0.55, pointerEvents: "none" } : undefined}
      aria-hidden={blocked}
    >
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        {subtitle}
      </p>

      <form
        autoComplete="off"
        aria-busy={loading}
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "phone") sendOtp();
          else verifyOtp();
        }}
      >
        {step === "phone" && (
          <>
            {purpose === "register" && registrationFields}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="proxima-mobile">
                Mobile Number<span className={styles.required}>*</span>
              </label>
              <input
                id="proxima-mobile"
                name="proxima-mobile"
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-1p-ignore="true"
                placeholder="Enter your 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
              />
            </div>
            <p className={styles.infoBox}>
              OTP appears on the next screen (demo mode — SMS not configured). Valid for 5 minutes.
              {purpose === "login" && " You must register first if you are a new user."}
            </p>
          </>
        )}

        {step === "otp" && (
          <>
            <p className={styles.infoBox}>
              {demoOtp
                ? <>Demo OTP for <strong>{maskedPhone}</strong> — enter the code below.</>
                : <>Enter the OTP sent to <strong>{maskedPhone}</strong></>}
            </p>
            {demoOtp && (
              <div className={styles.devOtp} role="status" aria-live="polite">
                <p style={{ fontSize: "0.78rem", color: "#7c8db5", margin: "0 0 0.5rem" }}>
                  {demoNote ?? "Demo verification code"}
                </p>
                <div className={styles.devOtpCode}>{demoOtp}</div>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ marginTop: "0.75rem", fontSize: "0.8rem" }}
                  onClick={() => setOtp(demoOtp)}
                >
                  Fill code automatically
                </button>
              </div>
            )}
            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="proxima-otp">
                One-Time Password<span className={styles.required}>*</span>
              </label>
              <input
                id="proxima-otp"
                name="proxima-otp"
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                autoFocus
              />
            </div>
          </>
        )}

        {error && <p className={styles.errorMsg} role="alert">{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {step === "phone" ? (
            <button
              className={styles.btnPrimary}
              type="submit"
              disabled={loading || phone.length < 10}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  <span className="sr-only">Sending OTP</span>
                </>
              ) : (
                "Send OTP"
              )}
            </button>
          ) : (
            <>
              <button
                className={styles.btnPrimary}
                type="submit"
                disabled={loading || otp.length !== 6}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    <span className="sr-only">Verifying OTP</span>
                  </>
                ) : (
                  "Verify & Continue"
                )}
              </button>
              <button
                className={styles.btnSecondary}
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setDemoOtp(null); setError(null); }}
                disabled={loading}
              >
                Change Number
              </button>
              <button
                className={styles.btnSecondary}
                type="button"
                onClick={sendOtp}
                disabled={loading}
              >
                Resend OTP
              </button>
            </>
          )}
        </div>
      </form>

      {footer && <div style={{ marginTop: "1.5rem" }}>{footer}</div>}
    </div>
  );
}