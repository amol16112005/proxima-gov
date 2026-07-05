import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { STAGE_EMOJI } from "@/data/lifecycleTypes";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getIssuesByCitizen, getAllIssues } from "@/lib/lifecycleStore";
import { categoryLabel, stageLabel } from "@/frontend/i18n/labels";
import { interpolate } from "@/frontend/i18n";
import { getServerLocale, getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";

export default async function CitizenIssuesPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const m = await getServerTranslator();
  const locale = await getServerLocale();

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  const myIssues = getIssuesByCitizen(session.id);
  const constituencyIssues = getAllIssues().filter((i) => i.constituencyId === session.constituencyId);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency?.name ?? ""} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <div>
          <h2 className={styles.sectionTitle}>{m("dash.mySubmittedIssues")}</h2>
          <p className={styles.subtitle}>{m("issues.trackStages")}</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/citizen/issues/new" className={styles.btnPrimary}>{m("issues.submitIssueBtn")}</Link>
          <Link href="/citizen/notifications" className={styles.btnSecondary}>{m("nav.notifications")}</Link>
        </div>
      </div>

      {myIssues.length === 0 ? (
        <div className={styles.card} style={{ maxWidth: "100%" }}>
          <p style={{ color: "#9aa5b8", marginBottom: "1rem" }}>{m("issues.emptyDetailed")}</p>
          <Link href="/citizen/issues/new" className={styles.btnPrimary}>{m("issues.submitAnIssue")}</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2.5rem" }}>
          {myIssues.map((issue) => (
            <Link key={issue.id} href={`/citizen/issues/${issue.id}`} className={ls.issueListItem}>
              <div>
                <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>
                  {categoryLabel(locale, issue.category)} · #{issue.id}
                </p>
                <p style={{ fontWeight: 600, color: "#e8e8f0" }}>{issue.title}</p>
              </div>
              <span style={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                {STAGE_EMOJI[issue.stage]} {stageLabel(locale, issue.stage)}
              </span>
            </Link>
          ))}
        </div>
      )}

      <h2 className={styles.sectionTitle}>
        {interpolate(m("issues.allInConstituency"), { name: constituency?.name ?? "" })}
      </h2>
      <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
        {m("issues.publicNote")}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {constituencyIssues.slice(0, 8).map((issue) => (
          <Link key={issue.id} href={`/transparency/${issue.id}`} className={ls.issueListItem}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>
                #{issue.id} · {m("issues.publicProgress")}
              </p>
              <p style={{ fontWeight: 600, color: "#e8e8f0" }}>{issue.title}</p>
            </div>
            <span>
              {issue.currentProgress > 0 ? `${issue.currentProgress}%` : stageLabel(locale, issue.stage)}
            </span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/citizen/dashboard" className={styles.linkMuted}>{m("issues.backDashboard")}</Link>
        {" · "}
        <Link href="/transparency" className={styles.linkMuted}>{m("issues.publicTransparencyArrow")}</Link>
      </p>
    </div>
  );
}