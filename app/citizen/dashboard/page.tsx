import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import TransparencyCard from "@/components/lifecycle/TransparencyCard";
import ProjectCard from "@/components/ProjectCard";
import mpStyles from "@/components/mp/mpProfile.module.css";
import { getConstituencyById } from "@/data/constituencies";
import { getMpProfileByConstituency } from "@/data/mpProfiles";
import { STAGE_EMOJI } from "@/data/lifecycleTypes";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getLiveProjectsForConstituency } from "@/lib/datagovindia";
import { getMpladsSummaryForConstituency } from "@/lib/datagovindia/mplads";
import { getActiveTransparencyIssues, getIssuesByCitizen } from "@/lib/lifecycleStore";
import { getNotificationsByCitizen } from "@/lib/notifications";
import { interpolate } from "@/frontend/i18n";
import { stageLabel } from "@/frontend/i18n/labels";
import { getServerLocale, getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";

export default async function CitizenDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const m = await getServerTranslator();
  const locale = await getServerLocale();

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  if (!constituency) redirect("/citizen/login");

  const mpProfile = getMpProfileByConstituency(session.constituencyId);
  const myIssues = getIssuesByCitizen(session.id);
  const activeProjects = getActiveTransparencyIssues(session.constituencyId);
  const notifications = getNotificationsByCitizen(session.id);
  const unread = notifications.filter((n) => !n.read).length;

  const [{ projects: ogdProjects, source: ogdSource }, mplads] = await Promise.all([
    getLiveProjectsForConstituency(session.constituencyId),
    getMpladsSummaryForConstituency(session.constituencyId),
  ]);
  const governmentProjects = [...ogdProjects, ...constituency.projects];

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency.name} />

      <section style={{ marginBottom: "2rem" }}>
        <p className={styles.subtitle}>
          {m("dash.welcome")},{" "}
          <strong style={{ color: "#e8e8f0" }}>{session.name}</strong>. {m("dash.trackIn")}{" "}
          <strong style={{ color: "#a78bfa" }}>{constituency.name}</strong>.
        </p>
      </section>

      {mpProfile && (
        <Link href="/citizen/mp" className={mpStyles.dashboardMpCard}>
          {mpProfile.photoPath && (
            <Image
              src={mpProfile.photoPath}
              alt={`${mpProfile.name}, ${m("dash.yourMp")}`}
              width={72}
              height={72}
              className={mpStyles.dashboardMpPhoto}
            />
          )}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.75rem", color: "#7c8db5", margin: 0 }}>
              {interpolate(m("dash.yourMpParty"), { party: mpProfile.party })}
            </p>
            <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e8e8f0", margin: "0.2rem 0" }}>
              {m("dash.honMp")} {mpProfile.name}
            </p>
            <p style={{ fontSize: "0.82rem", color: "#9aa5b8", margin: 0 }}>
              {mplads.source === "data.gov.in"
                ? interpolate(m("dash.mpladsLive"), {
                    spent: mplads.totalExpenditureCr.toFixed(2),
                    pct: mplads.utilizationPct,
                  })
                : m("dash.mpladsDemo")}
            </p>
          </div>
          <span className={styles.btnSecondary} style={{ whiteSpace: "nowrap" }}>
            {m("dash.fullReport")}
          </span>
        </Link>
      )}

      <div className={styles.grid2} style={{ marginBottom: "2rem" }}>
        <div className={styles.projectCard}>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{myIssues.length}</p>
          <p style={{ fontSize: "0.85rem", color: "#7c8db5" }}>{m("dash.mySubmittedIssues")}</p>
        </div>
        <div className={styles.projectCard}>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{activeProjects.length}</p>
          <p style={{ fontSize: "0.85rem", color: "#7c8db5" }}>{m("dash.activeNearby")}</p>
        </div>
        <div className={styles.projectCard}>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>{unread}</p>
          <p style={{ fontSize: "0.85rem", color: "#7c8db5" }}>{m("dash.unreadNotifications")}</p>
        </div>
        <div className={styles.projectCard}>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
            {mplads.source === "data.gov.in" ? `${mplads.utilizationPct}%` : "—"}
          </p>
          <p style={{ fontSize: "0.85rem", color: "#7c8db5" }}>{m("dash.mpladsUtil")}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <Link href="/citizen/mp" className={styles.btnPrimary}>{m("dash.myMpReport")}</Link>
        <Link href="/citizen/issues/new" className={styles.btnSecondary}>{m("nav.submitIssue")}</Link>
        <Link href="/citizen/issues" className={styles.btnSecondary}>{m("nav.myIssues")}</Link>
        <Link href="/citizen/notifications" className={styles.btnSecondary}>
          {interpolate(m("dash.notificationsCount"), { count: unread })}
        </Link>
        <Link href="/citizen/history" className={styles.btnSecondary}>{m("dash.activityHistory")}</Link>
        <Link href="/citizen/profile" className={styles.btnSecondary}>{m("dash.changeConstituency")}</Link>
        <Link href="/transparency" className={styles.btnSecondary}>{m("dash.transparencyDashboard")}</Link>
      </div>

      {myIssues.length > 0 && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 className={styles.sectionTitle}>{m("dash.mySubmittedIssues")}</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {myIssues.slice(0, 5).map((issue) => (
              <Link key={issue.id} href={`/citizen/issues/${issue.id}`} className={ls.issueListItem}>
                <span>{issue.title}</span>
                <span>
                  {STAGE_EMOJI[issue.stage]} {stageLabel(locale, issue.stage)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className={styles.sectionTitle}>{m("dash.liveProgress")}</h2>
        <div className={styles.grid2}>
          {activeProjects.slice(0, 4).map((issue) => (
            <TransparencyCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>
            {m("dash.govInfra")}
          </h2>
          <span
            style={{
              fontSize: "0.75rem",
              padding: "0.25rem 0.7rem",
              borderRadius: "1rem",
              background: ogdSource === "data.gov.in" ? "rgba(52, 211, 153, 0.15)" : "rgba(255,255,255,0.06)",
              color: ogdSource === "data.gov.in" ? "#34d399" : "#7c8db5",
              border: `1px solid ${ogdSource === "data.gov.in" ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {ogdSource === "data.gov.in"
              ? interpolate(m("dash.liveData"), { count: ogdProjects.length })
              : m("dash.demoData")}
          </span>
        </div>
        <div className={styles.grid2}>
          {governmentProjects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}