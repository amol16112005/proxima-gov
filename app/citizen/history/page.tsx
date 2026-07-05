import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { STAGE_EMOJI } from "@/data/lifecycleTypes";
import { getSession } from "@/lib/auth/session";
import {
  cloudStatus,
  ensureDataHydrated,
  getActivityForCitizen,
  type ActivityEntry,
} from "@/lib/cloud";
import styles from "@/app/shared.module.css";

const TYPE_LABELS: Record<ActivityEntry["type"], string> = {
  "citizen.registered": "Registration",
  "citizen.constituency_changed": "Constituency Change",
  "issue.created": "Issue Submitted",
  "issue.stage_changed": "Stage Update",
  "issue.mp_action": "MP Action",
  "issue.citizen_verify": "Citizen Verification",
  "issue.progress_photo": "Site Photo",
  "grievance.created": "Grievance",
  "grievance.status_changed": "Grievance Update",
  "notification.sent": "Notification",
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function CitizenHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  if (!constituency) redirect("/citizen/login");

  const entries = getActivityForCitizen(session.id, 80);
  const cloud = cloudStatus();

  return (
    <main className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency.name} />

      <section style={{ marginBottom: "1.5rem" }}>
        <h1 className={styles.title} style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
          Activity History
        </h1>
        <p className={styles.subtitle}>
          A complete audit trail of your submissions, verifications, and project updates in{" "}
          <strong style={{ color: "#a78bfa" }}>{constituency.name}</strong>.
        </p>
      </section>

      <div
        style={{
          marginBottom: "1.5rem",
          padding: "0.85rem 1rem",
          borderRadius: "0.75rem",
          border: `1px solid ${cloud.enabled ? "rgba(52, 211, 153, 0.35)" : "rgba(251, 191, 36, 0.35)"}`,
          background: cloud.enabled ? "rgba(52, 211, 153, 0.08)" : "rgba(251, 191, 36, 0.08)",
          fontSize: "0.88rem",
          color: cloud.enabled ? "#6ee7b7" : "#fcd34d",
        }}
      >
        <strong>
          {cloud.provider === "mongodb"
            ? "🍃 MongoDB active"
            : cloud.provider === "sqlite"
              ? "💾 SQLite active"
              : cloud.enabled
                ? "💾 Persistence active"
                : "💾 Demo mode"}
        </strong>
        <span style={{ color: "#9aa5b8", marginLeft: "0.5rem" }}>{cloud.message}</span>
      </div>

      {entries.length === 0 ? (
        <div className={styles.projectCard}>
          <p style={{ margin: 0, color: "#9aa5b8" }}>
            No activity yet. Submit an issue or grievance to start building your history.
          </p>
          <Link href="/citizen/issues/new" className={styles.btnPrimary} style={{ marginTop: "1rem", display: "inline-block" }}>
            Submit Issue
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {entries.map((entry) => (
            <article key={entry.id} className={styles.projectCard} style={{ padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#7c8db5",
                    }}
                  >
                    {TYPE_LABELS[entry.type]}
                  </span>
                  <p style={{ margin: "0.35rem 0 0", fontWeight: 600, color: "#e8e8f0" }}>
                    {entry.summary}
                  </p>
                  {entry.stage && (
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "#9aa5b8" }}>
                      {STAGE_EMOJI[entry.stage]} Stage: {entry.stage}
                    </p>
                  )}
                </div>
                <time style={{ fontSize: "0.78rem", color: "#7c8db5", whiteSpace: "nowrap" }}>
                  {formatWhen(entry.createdAt)}
                </time>
              </div>
              {entry.issueId && (
                <div style={{ marginTop: "0.65rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link href={`/citizen/issues/${entry.issueId}`} className={styles.btnSecondary} style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                    View Issue #{entry.issueId}
                  </Link>
                  <Link href={`/transparency/${entry.issueId}`} className={styles.btnSecondary} style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                    Transparency
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}