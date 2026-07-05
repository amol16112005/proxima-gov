import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { STAGE_EMOJI, STAGE_LABELS, CATEGORY_LABELS } from "@/data/lifecycleTypes";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getIssuesByCitizen } from "@/lib/lifecycleStore";
import { getAllIssues } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";

export default async function CitizenIssuesPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  const myIssues = getIssuesByCitizen(session.id);
  const constituencyIssues = getAllIssues().filter((i) => i.constituencyId === session.constituencyId);

  return (
    <main className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency?.name ?? ""} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 className={styles.sectionTitle}>My Submitted Issues</h2>
          <p className={styles.subtitle}>Track every stage from submission to impact analysis.</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/citizen/issues/new" className={styles.btnPrimary}>+ Submit Issue</Link>
          <Link href="/citizen/notifications" className={styles.btnSecondary}>🔔 Notifications</Link>
        </div>
      </div>

      {myIssues.length === 0 ? (
        <div className={styles.card} style={{ maxWidth: "100%" }}>
          <p style={{ color: "#9aa5b8", marginBottom: "1rem" }}>No issues submitted yet. File your first complaint to start the governance lifecycle.</p>
          <Link href="/citizen/issues/new" className={styles.btnPrimary}>Submit an Issue</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {myIssues.map((issue) => (
            <Link key={issue.id} href={`/citizen/issues/${issue.id}`} className={ls.issueListItem}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>{CATEGORY_LABELS[issue.category]} · #{issue.id}</p>
                <p style={{ fontWeight: 600, color: "#e8e8f0" }}>{issue.title}</p>
              </div>
              <span style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                {STAGE_EMOJI[issue.stage]} {STAGE_LABELS[issue.stage]}
              </span>
            </Link>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle}>All Issues in {constituency?.name}</h2>
      <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
        Public transparency — progress and budgets only. Private complaint details stay with the submitter.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {constituencyIssues.slice(0, 8).map((issue) => (
          <Link key={issue.id} href={`/transparency/${issue.id}`} className={ls.issueListItem}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>#{issue.id} · Public progress</p>
              <p style={{ fontWeight: 600, color: "#e8e8f0" }}>{issue.title}</p>
            </div>
            <span>{issue.currentProgress > 0 ? `${issue.currentProgress}%` : STAGE_LABELS[issue.stage]}</span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/citizen/dashboard" className={styles.linkMuted}>← Dashboard</Link>
        {" · "}
        <Link href="/transparency" className={styles.linkMuted}>Public Transparency →</Link>
      </p>
    </main>
  );
}