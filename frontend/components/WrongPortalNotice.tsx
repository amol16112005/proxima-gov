"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
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
  const { translate: t } = useAccessibility();
  const [loading, setLoading] = useState(false);

  const activeLabel = activeRole === "citizen" ? t("nav.citizenPortal") : t("nav.mpPortal");
  const targetLabel = activeRole === "citizen" ? t("nav.mpPortal") : t("nav.citizenPortal");

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
        {interpolate(t("wrongPortal.cannotOpen"), { target: targetLabel })}
      </p>
      <p style={{ margin: 0 }}>
        {interpolate(t("wrongPortal.signedIn"), { portal: activeLabel })}
        {userName ? (
          <>
            {" "}
            {interpolate(t("wrongPortal.asUser"), { name: userName })}
          </>
        ) : null}
        . {t("wrongPortal.oneSession")}
      </p>
      <p style={{ margin: 0 }}>
        <strong>{t("wrongPortal.whatToDo")}</strong>{" "}
        {interpolate(t("wrongPortal.instruction"), { from: activeLabel, to: targetLabel })}
      </p>
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={logout}
        disabled={loading}
        style={{ alignSelf: variant === "home" ? "flex-start" : "stretch", marginTop: "0.15rem" }}
      >
        {loading
          ? t("wrongPortal.loggingOut")
          : interpolate(t("wrongPortal.logoutOf"), { portal: activeLabel })}
      </button>
    </div>
  );
}