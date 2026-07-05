"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/shared.module.css";

interface MpPinLoginProps {
  redirectTo?: string;
  blocked?: boolean;
}

export default function MpPinLogin({ redirectTo, blocked = false }: MpPinLoginProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (blocked) return;
    setError(null);

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (pin.length !== 6) {
      setError("PIN must be exactly 6 digits.");
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
        setError(data.error ?? "Login failed.");
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
      <h1 className={styles.title}>MP Login</h1>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        Enter your official username and 6-digit PIN to access your constituency dashboard.
      </p>

      <form autoComplete="off" onSubmit={login} aria-busy={loading}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="mp-username">
            Username<span className={styles.required}>*</span>
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
            placeholder="Constituency seat ID (e.g. mp.new-delhi)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="mp-pin">
            6-Digit PIN<span className={styles.required}>*</span>
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
              <span className="sr-only">Logging in</span>
            </>
          ) : (
            "Login to MP Dashboard"
          )}
        </button>
      </form>

      <p className={styles.infoBox} style={{ marginTop: "1.25rem" }}>
        Demo judges and developers: see <strong>DEVELOPER_MP_CREDENTIALS.md</strong> in the
        project folder for usernames and PINs.
      </p>

      <p style={{ fontSize: "0.88rem", color: "#7c8db5", marginTop: "1rem" }}>
        <Link href="/" className={styles.linkMuted}>
          ← Back to home
        </Link>
        {" · "}
        <Link href="/citizen/login" className={styles.linkMuted}>
          Citizen login
        </Link>
      </p>
    </div>
  );
}