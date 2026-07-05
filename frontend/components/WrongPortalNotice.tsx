"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/shared.module.css";

interface WrongPortalNoticeProps {
  activeRole: "citizen" | "mp";
  userName?: string;
  targetLoginHref: string;
  variant?: "auth" | "home";
}

export default function WrongPortalNotice({
  activeRole,
  userName,
  targetLoginHref,
  variant = "auth",
}: WrongPortalNoticeProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const activeLabel = activeRole === "citizen" ? "Citizen Portal" : "MP Portal";
  const targetLabel = activeRole === "citizen" ? "MP Portal" : "Citizen Portal";

  const logout = async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push(targetLoginHref);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={variant === "home" ? styles.wrongPortalBanner : styles.authNotice}
      role="alert"
      style={
        variant === "home"
          ? undefined
          : { display: "flex", flexDirection: "column", gap: "0.65rem" }
      }
    >
      <p style={{ margin: 0, fontWeight: 700, color: "#fde68a" }}>
        Cannot open {targetLabel} while signed in elsewhere
      </p>
      <p style={{ margin: 0 }}>
        You are still signed in to the <strong>{activeLabel}</strong>
        {userName ? (
          <>
            {" "}
            as <strong>{userName}</strong>
          </>
        ) : null}
        . Citizen and MP portals use separate accounts — only one session can be active at a time.
      </p>
      <p style={{ margin: 0 }}>
        <strong>What to do:</strong> Log out of the {activeLabel}, then sign in again on the{" "}
        {targetLabel}.
      </p>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={logout}
        disabled={loading}
        style={{ alignSelf: variant === "home" ? "flex-start" : "stretch", marginTop: "0.15rem" }}
      >
        {loading ? "Logging out…" : `Log out of ${activeLabel}`}
      </button>
    </div>
  );
}