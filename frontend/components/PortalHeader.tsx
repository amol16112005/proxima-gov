"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const dashboardHref = portal === "citizen" ? "/citizen/dashboard" : "/mp/dashboard";

  return (
    <header className={styles.headerBar}>
      <div>
        <Link href="/" className={styles.linkMuted}>
          ← Home
        </Link>
        <h1 className={styles.title} style={{ fontSize: "1.4rem", marginTop: "0.4rem" }}>
          {portal === "citizen" ? "Citizen Portal" : "MP Dashboard"}
        </h1>
        <nav className={styles.portalNav} aria-label="Portal sections">
          {[
            { href: dashboardHref, label: "Dashboard" },
            ...(portal === "citizen"
              ? [
                  { href: "/citizen/mp", label: "My MP" },
                  { href: "/citizen/issues", label: "My Issues" },
                  { href: "/citizen/issues/new", label: "Submit Issue" },
                  { href: "/citizen/notifications", label: "Notifications" },
                  { href: "/citizen/history", label: "History" },
                  { href: "/citizen/profile", label: "Profile" },
                ]
              : [{ href: "/mp/dashboard#pending-approvals", label: "Pending Approvals" }]),
            { href: "/faq", label: "FAQs" },
            { href: "/transparency", label: "Transparency" },
          ].map(({ href, label }) => (
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
          aria-label={`Log out of ${portal === "citizen" ? "citizen" : "MP"} portal`}
        >
          Logout
        </button>
      </div>
    </header>
  );
}