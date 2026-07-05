"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "@/app/shared.module.css";

interface PortalHeaderProps {
  portal: "citizen" | "mp";
  userName: string;
  constituencyName: string;
}

export default function PortalHeader({ portal, userName, constituencyName }: PortalHeaderProps) {
  const router = useRouter();

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
          <Link href={dashboardHref}>Dashboard</Link>
          {portal === "citizen" ? (
            <>
              <Link href="/citizen/mp">My MP</Link>
              <Link href="/citizen/issues">My Issues</Link>
              <Link href="/citizen/issues/new">Submit Issue</Link>
              <Link href="/citizen/notifications">Notifications</Link>
              <Link href="/citizen/history">History</Link>
              <Link href="/citizen/profile">Profile</Link>
            </>
          ) : (
            <Link href="/mp/dashboard#pending-approvals">Pending Approvals</Link>
          )}
          <Link href="/faq">FAQs</Link>
          <Link href="/transparency">Transparency</Link>
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        <p className={styles.userChip}>
          <strong>{userName}</strong> · {constituencyName}
        </p>
        <button className={styles.btnSecondary} onClick={logout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}