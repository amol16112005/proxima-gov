"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import styles from "@/app/shared.module.css";

interface MpPinLoginProps {
  redirectTo?: string;
  blocked?: boolean;
}

export default function MpPinLogin({ redirectTo, blocked = false }: MpPinLoginProps) {
  const router = useRouter();
  const { translate: t } = useAccessibility();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setError(null);

    if (!username.trim()) {
      setError(t("auth.usernameRequired"));
      return;
    }
    if (pin.length !== 6) {
      setError(t("auth.pinInvalid"));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/mp-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("auth.loginFailed"));
        return;
      }
      router.push(redirectTo ?? data.redirect);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
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
      <h1 className={styles.title}>{t("auth.mpLoginTitle")}</h1>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        {t("auth.mpLoginSubtitle")}
      </p>

      <form autoComplete="off" onSubmit={login} aria-busy={loading}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="mp-username">
            {t("auth.username")}<span className={styles.required}>*</span>
          </label>
          <input
            id="mp-username"
            name="proxima-mp-user"
            className={styles.input}
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            data-lpignore="true"
            data-1p-ignore="true"
            placeholder={t("auth.mpUsernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="mp-pin">
            {t("auth.pinLabel")}<span className={styles.required}>*</span>
          </label>
          <input
            id="mp-pin"
            name="proxima-mp-pin"
            className={styles.input}
            type="password"
            inputMode="numeric"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            placeholder="••••••"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            maxLength={6}
            required
          />
        </div>

        {error && (
          <p className={styles.errorMsg} role="alert">
            {error}
          </p>
        )}

        <button
          className={styles.btnPrimary}
          type="submit"
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span className="sr-only">{t("auth.loggingIn")}</span>
            </>
          ) : (
            t("auth.mpLoginBtn")
          )}
        </button>
      </form>

      <p className={styles.infoBox} style={{ marginTop: "1.25rem" }}>
        {t("auth.mpDemoHint")}
      </p>

      <p style={{ fontSize: "0.88rem", color: "#7c8db5", marginTop: "1rem" }}>
        <Link href="/" className={styles.linkMuted}>
          {t("nav.backHome")}
        </Link>
        {" · "}
        <Link href="/citizen/login" className={styles.linkMuted}>
          {t("auth.citizenLoginLink")}
        </Link>
      </p>
    </div>
  );
}