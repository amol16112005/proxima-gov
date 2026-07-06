"use client";

import Link from "next/link";
import WrongPortalNotice from "@/components/WrongPortalNotice";
import { useAccessibility } from "@/context/AccessibilityContext";
import type { MessageKey } from "@/frontend/i18n";
import styles from "@/app/shared.module.css";

type AuthPortal = "citizen" | "mp";

const NOTICE_KEYS: Record<string, MessageKey> = {
  session_required: "auth.sessionRequired",
};

interface AuthPageShellProps {
  portal: AuthPortal;
  badgeKey: MessageKey;
  badgeVariant?: "citizen" | "mp";
  reason?: string;
  activeSessionRole?: "citizen" | "mp";
  activeSessionName?: string;
  children: React.ReactNode;
}

export default function AuthPageShell({
  portal,
  badgeKey,
  badgeVariant = portal,
  reason,
  activeSessionRole,
  activeSessionName,
  children,
}: AuthPageShellProps) {
  const { translate: t } = useAccessibility();
  const noticeKey = reason ? NOTICE_KEYS[reason] : undefined;
  const wrongPortal =
    activeSessionRole && activeSessionRole !== portal
      ? { activeRole: activeSessionRole, targetLoginHref: portal === "mp" ? "/mp/login" : "/citizen/login" }
      : null;
  const otherLabel = portal === "citizen" ? t("nav.mpPortal") : t("nav.citizenPortal");
  const otherHref = portal === "citizen" ? "/mp/login" : "/citizen/login";

  return (
    <div className={styles.page}>
      <nav className={styles.authNav} aria-label={t("nav.portalNavigation")}>
        <Link href="/" className={styles.linkMuted}>
          {t("nav.backHome")}
        </Link>
        <div className={styles.authNavLinks}>
          <Link href={otherHref} className={styles.linkMuted}>
            {otherLabel}
          </Link>
          {portal === "citizen" && (
            <Link href="/citizen/register" className={styles.linkMuted}>
              {t("nav.register")}
            </Link>
          )}
          <Link href="/faq" className={styles.linkMuted}>
            {t("nav.faqs")}
          </Link>
          <Link href="/transparency" className={styles.linkMuted}>
            {t("nav.transparency")}
          </Link>
        </div>
      </nav>

      <div className={badgeVariant === "mp" ? styles.badgeMp : styles.badge}>{t(badgeKey)}</div>

      {wrongPortal ? (
        <WrongPortalNotice
          activeRole={wrongPortal.activeRole}
          userName={activeSessionName}
          targetLoginHref={wrongPortal.targetLoginHref}
        />
      ) : noticeKey ? (
        <p className={styles.authNotice} role="status">
          {t(noticeKey)}
        </p>
      ) : null}

      {children}
    </div>
  );
}