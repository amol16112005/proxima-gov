import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getNotificationsByCitizen } from "@/lib/notifications";
import { getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const m = await getServerTranslator();

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  const notifications = getNotificationsByCitizen(session.id);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency?.name ?? ""} />

      <h2 className={styles.sectionTitle}>{m("notifications.title")}</h2>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        {m("notifications.subtitleAlerts")}
      </p>

      {notifications.length === 0 ? (
        <p style={{ color: "#7c8db5" }}>{m("notifications.emptyHint")}</p>
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
        <Link href="/citizen/dashboard" className={styles.linkMuted}>{m("issues.backDashboard")}</Link>
        {" · "}
        <Link href="/citizen/issues" className={styles.linkMuted}>{m("nav.myIssues")}</Link>
      </p>
    </div>
  );
}