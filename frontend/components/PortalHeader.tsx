"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccessibility } from "@/context/AccessibilityContext";
import styles from "@/app/shared.module.css";

interface PortalHeaderProps {
  portal: "citizen" | "mp";
  userName: string;
  constituencyName: string;
}

function navIsActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PortalHeader({ portal, userName, constituencyName }: PortalHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { translate: t } = useAccessibility();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const dashboardHref = portal === "citizen" ? "/citizen/dashboard" : "/mp/dashboard";

  const navItems = [
    { href: dashboardHref, label: t("nav.dashboard") },
    ...(portal === "citizen"
      ? [
          { href: "/citizen/mp", label: t("nav.myMp") },
          { href: "/citizen/issues", label: t("nav.myIssues") },
          { href: "/citizen/issues/new", label: t("nav.submitIssue") },
          { href: "/citizen/notifications", label: t("nav.notifications") },
          { href: "/citizen/history", label: t("nav.history") },
          { href: "/citizen/profile", label: t("nav.profile") },
        ]
      : [{ href: "/mp/dashboard#pending-approvals", label: t("nav.pendingApprovals") }]),
    { href: "/faq", label: t("nav.faqs") },
    { href: "/transparency", label: t("nav.transparency") },
  ];

  return (
    <header className={styles.headerBar}>
      <div>
        <Link href="/" className={styles.linkMuted}>
          {t("nav.backHome")}
        </Link>
        <h1 className={styles.title} style={{ fontSize: "1.4rem", marginTop: "0.4rem" }}>
          {portal === "citizen" ? t("nav.citizenPortal") : t("nav.mpDashboard")}
        </h1>
        <nav className={styles.portalNav} aria-label={t("nav.portalSections")}>
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={navIsActive(pathname, href) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <p className={styles.userChip}>
          <strong>{userName}</strong> · {constituencyName}
        </p>
        <button
          className={styles.btnSecondary}
          onClick={logout}
          type="button"
          aria-label={t("nav.logout")}
        >
          {t("nav.logout")}
        </button>
      </div>
    </header>
  );
}