"use client";

import Link from "next/link";
import Image from "next/image";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { stageLabel } from "@/frontend/i18n/labels";
import { formatINR } from "@/data/constituencies";
import { STAGE_EMOJI } from "@/data/lifecycleTypes";
import type { MpTransparencyReport } from "@/lib/datagovindia/mpReport";
import styles from "@/app/shared.module.css";
import mp from "@/components/mp/mpProfile.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";

export default function MpTransparencyReportView({ report }: { report: MpTransparencyReport }) {
  const { locale, translate: t } = useAccessibility();
  const { profile, mplads, lifecycleIssues, mgnregaProjects, constituencyProjects, highlights, sources } =
    report;

  const approved = lifecycleIssues.filter((i) => i.approval?.approved);
  const completed = lifecycleIssues.filter(
    (i) => i.stage === "completed" || i.stage === "impact-analysis"
  );

  return (
    <div>
      <section className={mp.hero}>
        <div className={mp.photoWrap}>
          <Image
            src={profile.photoPath}
            alt={`Portrait of ${profile.name}, MP for ${report.constituencyName}`}
            width={200}
            height={200}
            className={mp.photo}
            priority
          />
        </div>
        <div className={mp.heroText}>
          <p className={mp.partyBadge}>{profile.party}</p>
          <h2 className={mp.mpName}>
            {t("dash.honMp")} {profile.name}
          </h2>
          <p className={styles.subtitle}>
            {t("mpReport.memberOfParliament")} · {report.constituencyName}
          </p>
          <p className={mp.bio}>{profile.bio}</p>
          <div className={mp.metaRow}>
            <span>
              {t("mpReport.term")}: {new Date(profile.termStart).getFullYear()}–
              {new Date(profile.termEnd).getFullYear()}
            </span>
            <span>
              {t("mpReport.attendance")}: {profile.attendancePct}%
            </span>
            <span>
              {interpolate(t("mpReport.questionsBills"), {
                questions: String(profile.questionsAsked),
                bills: String(profile.billsIntroduced),
              })}
            </span>
          </div>
          <p className={mp.committees}>
            {t("mpReport.committees")}: {profile.committees.join(" · ")}
          </p>
        </div>
      </section>

      <section className={mp.sourceBar}>
        {sources.map((s) => (
          <span key={s.label} className={s.live ? mp.sourceLive : mp.sourceDemo}>
            {s.live ? "●" : "○"} {s.label}
          </span>
        ))}
      </section>

      <section className={mp.highlights}>
        <h3 className={styles.sectionTitle}>{t("mpReport.performanceHighlights")}</h3>
        <ul className={mp.highlightList}>
          {highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className={mp.section}>
        <div className={mp.sectionHead}>
          <h3 className={styles.sectionTitle}>{t("mpReport.mpladsFundReport")}</h3>
          <span className={mplads.source === "data.gov.in" ? mp.sourceLive : mp.sourceDemo}>
            {mplads.source === "data.gov.in" ? t("mpReport.liveDataGov") : t("mpReport.awaitingApi")}
          </span>
        </div>
        <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
          {interpolate(t("mpReport.mpladsDistrict"), {
            districts: mplads.districts.join(", "),
            period: mplads.period,
          })}
        </p>
        <div className={styles.grid2}>
          <div className={mp.statCard}>
            <p className={mp.statValue}>₹{mplads.totalFundsReleasedCr.toFixed(2)} Cr</p>
            <p className={mp.statLabel}>{t("mpReport.fundsReleased")}</p>
          </div>
          <div className={mp.statCard}>
            <p className={mp.statValue}>₹{mplads.totalWorksRecommendedCr.toFixed(2)} Cr</p>
            <p className={mp.statLabel}>{t("mpReport.worksRecommended")}</p>
          </div>
          <div className={mp.statCard}>
            <p className={mp.statValue}>₹{mplads.totalExpenditureCr.toFixed(2)} Cr</p>
            <p className={mp.statLabel}>{t("mpReport.actualExpenditure")}</p>
          </div>
          <div className={mp.statCard}>
            <p className={mp.statValue}>{mplads.utilizationPct}%</p>
            <p className={mp.statLabel}>{t("mpReport.utilizationRate")}</p>
          </div>
        </div>

        {mplads.rows.length > 0 && (
          <div className={mp.tableWrap}>
            <table className={mp.table}>
              <thead>
                <tr>
                  <th>{t("mpReport.tableMp")}</th>
                  <th>{t("mpReport.tableDistrict")}</th>
                  <th>{t("mpReport.tableReleased")}</th>
                  <th>{t("mpReport.tableRecommended")}</th>
                  <th>{t("mpReport.tableSpent")}</th>
                  <th>{t("mpReport.tableUtil")}</th>
                </tr>
              </thead>
              <tbody>
                {mplads.rows.slice(0, 12).map((row, i) => (
                  <tr key={`${row.mpName}-${i}`}>
                    <td>{row.mpName}</td>
                    <td>{row.district}</td>
                    <td>₹{row.fundsReleasedCr.toFixed(2)} Cr</td>
                    <td>₹{row.worksRecommendedCr.toFixed(2)} Cr</td>
                    <td>₹{row.expenditureCr.toFixed(2)} Cr</td>
                    <td>{row.utilizationPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {mgnregaProjects.length > 0 && (
        <section className={mp.section}>
          <h3 className={styles.sectionTitle}>{t("mpReport.mgnregaTitle")}</h3>
          {mgnregaProjects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <p className={styles.projectTitle}>{p.title}</p>
              <p className={styles.projectDesc}>{p.description}</p>
              <div className={styles.metaRow}>
                <span>
                  {t("mpReport.budget")}: {formatINR(p.budget)}
                </span>
                <span>{interpolate(t("mpReport.percentComplete"), { progress: String(p.progress) })}</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${p.progress}%` }} />
              </div>
            </div>
          ))}
        </section>
      )}

      <section className={mp.section}>
        <h3 className={styles.sectionTitle}>
          {interpolate(t("mpReport.lifecycleTitle"), {
            approved: String(approved.length),
            completed: String(completed.length),
          })}
        </h3>
        <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
          {t("mpReport.lifecycleDesc")}
        </p>
        {lifecycleIssues.length === 0 ? (
          <p style={{ color: "#7c8db5" }}>{t("mpReport.noLifecycleIssues")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {lifecycleIssues.map((issue) => (
              <Link key={issue.id} href={`/transparency/${issue.id}`} className={ls.issueListItem}>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>#{issue.id}</p>
                  <p style={{ fontWeight: 600 }}>{issue.title}</p>
                  {issue.approval && (
                    <p style={{ fontSize: "0.78rem", color: "#7c8db5" }}>
                      {issue.approval.fund} · {formatINR(issue.approval.budget)} · {issue.approval.mpName}
                    </p>
                  )}
                </div>
                <span>
                  {STAGE_EMOJI[issue.stage]} {stageLabel(locale, issue.stage)}
                  {issue.currentProgress > 0 ? ` · ${issue.currentProgress}%` : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={mp.section}>
        <h3 className={styles.sectionTitle}>{t("mpReport.infraRegistry")}</h3>
        <div className={styles.grid2}>
          {constituencyProjects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <p className={styles.projectTitle}>{p.title}</p>
              <p className={styles.projectDesc}>{p.description}</p>
              <div className={styles.metaRow}>
                <span>{p.department}</span>
                <span>{formatINR(p.budget)}</span>
                <span>{p.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}