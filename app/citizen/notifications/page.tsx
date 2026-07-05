import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getNotificationsByCitizen } from "@/lib/notifications";
import styles from "@/app/shared.module.css";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  const notifications = getNotificationsByCitizen(session.id);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency?.name ?? ""} />

      <h2 className={styles.sectionTitle}>🔔 Notifications</h2>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        Alerts whenever your project status changes.
      </p>

      {notifications.length === 0 ? (
        <p style={{ color: "#7c8db5" }}>No notifications yet. Submit an issue to start receiving updates.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={`/citizen/issues/${n.issueId}`}
              className={styles.projectCard}
              style={{ opacity: n.read ? 0.7 : 1, textDecoration: "none", color: "inherit" }}
            >
              <p style={{ fontSize: "0.9rem", color: "#e8e8f0", margin: 0 }}>{n.message}</p>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5", marginTop: "0.3rem" }}>
                {new Date(n.createdAt).toLocaleString("en-IN")}
              </p>
            </Link>
          ))}
        </div>
      )}

      <p style={{ marginTop: "2rem" }}>
        <Link href="/citizen/dashboard" className={styles.linkMuted}>← Dashboard</Link>
        {" · "}
        <Link href="/citizen/issues" className={styles.linkMuted}>My Issues</Link>
      </p>
    </div>
  );
}