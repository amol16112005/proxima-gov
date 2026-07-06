import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import TransparencyCard from "@/components/lifecycle/TransparencyCard";
import MpIssueActions from "@/components/lifecycle/MpIssueActions";
import { formatINR, getConstituencyById } from "@/data/constituencies";
import { STAGE_EMOJI } from "@/data/lifecycleTypes";
import { getMpById } from "@/data/mpRegistry";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import MpPriorityRecommendations from "@/components/mp/MpPriorityRecommendations";
import {
  getMpDashboardIssues,
  getMpPendingApprovals,
  getMpPendingReviews,
  getMpPriorityClusters,
} from "@/lib/lifecycleStore";
import { stageLabel } from "@/frontend/i18n/labels";
import { getServerLocale, getServerTranslator } from "@/frontend/i18n/server";
import { interpolate } from "@/frontend/i18n";
import styles from "@/app/shared.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";

export default async function MpDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "mp") redirect("/mp/login");

  const m = await getServerTranslator();
  const locale = await getServerLocale();

  await ensureDataHydrated();

  const mp = getMpById(session.mpId ?? session.id);
  const constituency = getConstituencyById(session.constituencyId);
  if (!mp || !constituency) redirect("/mp/login");

  const allIssues = getMpDashboardIssues(session.constituencyId);
  const pending = getMpPendingApprovals(session.constituencyId);
  const priorityClusters = getMpPriorityClusters(session.constituencyId, allIssues);
  const pendingReviews = getMpPendingReviews(session.constituencyId);
  const active = allIssues.filter((i) => ["in-progress", "work-started", "work-assigned", "tender-released"].includes(i.stage));
  const delayed = allIssues.filter((i) => i.delayAlert?.active);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="mp" userName={mp.name} constituencyName={constituency.name} />

      <section className={styles.projectCard} style={{ marginBottom: "2rem" }}>
        <p className={styles.badgeMp}>
          {interpolate(m("mpDash.personalizedDashboard"), { name: constituency.name })}
        </p>
        <h2 className={styles.sectionTitle}>{m("dash.honMp")} {mp.name}</h2>
        <p className={styles.subtitle}>{mp.bio}</p>
        <div className={styles.grid2} style={{ marginTop: "1.2rem" }}>
          <div className={styles.projectCard}>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>{pending.length}</p>
            <p style={{ fontSize: "0.8rem", color: "#7c8db5" }}>{m("mpDash.awaitingApproval")}</p>
          </div>
          <div className={styles.projectCard}>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>{active.length}</p>
            <p style={{ fontSize: "0.8rem", color: "#7c8db5" }}>{m("mpDash.activeExecutions")}</p>
          </div>
          <div className={styles.projectCard}>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>{pendingReviews.length}</p>
            <p style={{ fontSize: "0.8rem", color: "#fcd34d" }}>{m("mpDash.citizenReviewsAction")}</p>
          </div>
          <div className={styles.projectCard}>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>{delayed.length}</p>
            <p style={{ fontSize: "0.8rem", color: "#fca5a5" }}>{m("mpDash.delayAlerts")}</p>
          </div>
          <div className={styles.projectCard}>
            <p style={{ fontSize: "1.8rem", fontWeight: 700, margin: 0 }}>{allIssues.length}</p>
            <p style={{ fontSize: "0.8rem", color: "#7c8db5" }}>{m("mpDash.totalLifecycle")}</p>
          </div>
        </div>
      </section>

      {pendingReviews.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className={styles.sectionTitle}>{m("mpDash.citizenReviewsTitle")}</h2>
          <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
            {m("mpDash.citizenReviewsDesc")}
          </p>
          {pendingReviews.map((issue) => (
            <div key={issue.id} style={{ marginBottom: "1.5rem" }}>
              <Link href={`/mp/issues/${issue.id}`} className={ls.issueListItem} style={{ marginBottom: "0.75rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>
                    #{issue.id} · {issue.mpReview?.citizenVerdict ?? m("mpDash.verdictPending")} ·{" "}
                    {issue.mpReview?.yesVotes ?? 0}👍 {issue.mpReview?.noVotes ?? 0}👎
                  </p>
                  <p style={{ fontWeight: 600 }}>{issue.title}</p>
                </div>
                <span>
                  {STAGE_EMOJI["mp-review"]} {stageLabel(locale, "mp-review")}
                </span>
              </Link>
              <MpIssueActions issue={issue} />
            </div>
          ))}
        </section>
      )}

      <MpPriorityRecommendations
        clusters={priorityClusters}
        pending={pending}
        labels={{
          title: m("mpDash.priorityEngineTitle"),
          subtitle: m("mpDash.priorityEngineSubtitle"),
          formula: m("mpDash.priorityFormula"),
          rank: m("mpDash.priorityRank"),
          demand: m("mpDash.priorityDemand"),
          gap: m("mpDash.priorityGap"),
          urgency: m("mpDash.priorityUrgency"),
          urgencyBoost: m("mpDash.priorityUrgencyBoost"),
          dataSignals: m("mpDash.priorityDataSignals"),
          citizensReported: m("mpDash.priorityCitizensReported"),
          reviewTop: m("mpDash.priorityReviewTop"),
          noClusters: m("mpDash.noPendingShort"),
        }}
      />

      <section id="pending-approvals" style={{ marginBottom: "2.5rem" }}>
        <h2 className={styles.sectionTitle}>{m("mpDash.aiPendingTitle")}</h2>
        {pending.length === 0 ? (
          <div className={styles.projectCard} style={{ padding: "1.25rem 1.5rem" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#9aa5b8" }}>{m("mpDash.noPendingShort")}</p>
            <p style={{ margin: "0.5rem 0 0", fontSize: "0.88rem", color: "#7c8db5" }}>
              {m("mpDash.noPendingDesc")}
            </p>
          </div>
        ) : (
          pending.map((issue) => (
            <div key={issue.id} style={{ marginBottom: "1.5rem" }}>
              <Link href={`/mp/issues/${issue.id}`} className={ls.issueListItem} style={{ marginBottom: "0.75rem" }}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>
                    #{issue.id} · {m("mpDash.score")}{" "}
                    {issue.aiAnalysis?.compositePriorityScore ?? issue.aiAnalysis?.priorityScore}/100
                    {issue.aiAnalysis?.citizenDemandCount && issue.aiAnalysis.citizenDemandCount > 1
                      ? ` · ${issue.aiAnalysis.citizenDemandCount} ${m("mpDash.priorityDemand").toLowerCase()}`
                      : ""}
                    {issue.aiAnalysis?.geographicHotspot
                      ? ` · ${issue.aiAnalysis.geographicHotspot}`
                      : ""}
                  </p>
                  <p style={{ fontWeight: 600 }}>{issue.title}</p>
                </div>
                <span>{formatINR(issue.aiAnalysis?.estimatedCost ?? 0)}</span>
              </Link>
              <MpIssueActions issue={issue} />
            </div>
          ))
        )}
      </section>

      {delayed.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className={styles.sectionTitle}>{m("mpDash.delayDetection")}</h2>
          {delayed.map((issue) => (
            <div key={issue.id} className={ls.delayAlert} style={{ marginBottom: "1rem" }}>
              <p className={ls.delayTitle}>#{issue.id} — {issue.title}</p>
              <p style={{ fontSize: "0.85rem", color: "#fca5a5" }}>{issue.delayAlert?.reason}</p>
              <p style={{ fontSize: "0.82rem", color: "#9aa5b8" }}>{issue.delayAlert?.recommendation}</p>
              <Link href={`/mp/issues/${issue.id}`} className={styles.btnSecondary} style={{ marginTop: "0.75rem", display: "inline-flex" }}>
                {m("mpDash.manageProject")}
              </Link>
            </div>
          ))}
        </section>
      )}

      <h2 className={styles.sectionTitle}>{m("mpDash.projectTracker")}</h2>
      <div className={styles.grid2} style={{ marginBottom: "2rem" }}>
        {allIssues.filter((i) => i.currentProgress > 0 || i.approval).map((issue) => (
          <TransparencyCard key={issue.id} issue={issue} detailHref={`/mp/issues/${issue.id}`} />
        ))}
      </div>

      <h2 className={styles.sectionTitle}>{m("mpDash.kanbanView")}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {allIssues.map((issue) => (
          <Link key={issue.id} href={`/mp/issues/${issue.id}`} className={ls.issueListItem}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>#{issue.id}</p>
              <p style={{ fontWeight: 600 }}>{issue.title}</p>
            </div>
            <span>
              {STAGE_EMOJI[issue.stage]} {stageLabel(locale, issue.stage)}
              {issue.currentProgress > 0 ? ` · ${issue.currentProgress}%` : ""}
            </span>
          </Link>
        ))}
      </div>

      <p style={{ marginTop: "2rem" }}>
        <Link href="/transparency" className={styles.linkMuted}>{m("mpDash.publicTransparencyLink")}</Link>
      </p>
    </div>
  );
}