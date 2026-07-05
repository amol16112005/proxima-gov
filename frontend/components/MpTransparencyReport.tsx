import Link from "next/link";
import Image from "next/image";
import { formatINR } from "@/data/constituencies";
import { STAGE_EMOJI, STAGE_LABELS } from "@/data/lifecycleTypes";
import type { MpTransparencyReport } from "@/lib/datagovindia/mpReport";
import styles from "@/app/shared.module.css";
import mp from "@/components/mp/mpProfile.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";

export default function MpTransparencyReportView({ report }: { report: MpTransparencyReport }) {
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
          <h2 className={mp.mpName}>Hon. {profile.name}</h2>
          <p className={styles.subtitle}>
            Member of Parliament · {report.constituencyName}
          </p>
          <p className={mp.bio}>{profile.bio}</p>
          <div className={mp.metaRow}>
            <span>Term: {new Date(profile.termStart).getFullYear()}–{new Date(profile.termEnd).getFullYear()}</span>
            <span>Attendance: {profile.attendancePct}%</span>
            <span>{profile.questionsAsked} questions · {profile.billsIntroduced} private bills</span>
          </div>
          <p className={mp.committees}>
            Committees: {profile.committees.join(" · ")}
          </p>
        </div>
      </section>

      <section className={mp.sourceBar}>
        {sources.map((s) => (
          <span
            key={s.label}
            className={s.live ? mp.sourceLive : mp.sourceDemo}
          >
            {s.live ? "●" : "○"} {s.label}
          </span>
        ))}
      </section>

      <section className={mp.highlights}>
        <h3 className={styles.sectionTitle}>Performance Highlights</h3>
        <ul className={mp.highlightList}>
          {highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </section>

      <section className={mp.section}>
        <div className={mp.sectionHead}>
          <h3 className={styles.sectionTitle}>MPLADS Fund Report</h3>
          <span className={mplads.source === "data.gov.in" ? mp.sourceLive : mp.sourceDemo}>
            {mplads.source === "data.gov.in" ? "Live · data.gov.in" : "Awaiting API data"}
          </span>
        </div>
        <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
          District-level MPLADS utilization for {mplads.districts.join(", ")} · {mplads.period}
        </p>
        <div className={styles.grid2}>
          <div className={mp.statCard}>
            <p className={mp.statValue}>₹{mplads.totalFundsReleasedCr.toFixed(2)} Cr</p>
            <p className={mp.statLabel}>Funds released (GoI)</p>
          </div>
          <div className={mp.statCard}>
            <p className={mp.statValue}>₹{mplads.totalWorksRecommendedCr.toFixed(2)} Cr</p>
            <p className={mp.statLabel}>Works recommended</p>
          </div>
          <div className={mp.statCard}>
            <p className={mp.statValue}>₹{mplads.totalExpenditureCr.toFixed(2)} Cr</p>
            <p className={mp.statLabel}>Actual expenditure</p>
          </div>
          <div className={mp.statCard}>
            <p className={mp.statValue}>{mplads.utilizationPct}%</p>
            <p className={mp.statLabel}>Utilization rate</p>
          </div>
        </div>

        {mplads.rows.length > 0 && (
          <div className={mp.tableWrap}>
            <table className={mp.table}>
              <thead>
                <tr>
                  <th>MP (OGD record)</th>
                  <th>District</th>
                  <th>Released</th>
                  <th>Recommended</th>
                  <th>Spent</th>
                  <th>Util.</th>
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
          <h3 className={styles.sectionTitle}>MGNREGA — District Employment Works</h3>
          {mgnregaProjects.map((p) => (
            <div key={p.id} className={styles.projectCard}>
              <p className={styles.projectTitle}>{p.title}</p>
              <p className={styles.projectDesc}>{p.description}</p>
              <div className={styles.metaRow}>
                <span>Budget: {formatINR(p.budget)}</span>
                <span>{p.progress}% complete</span>
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
          Proxima Lifecycle — MP Actions ({approved.length} approved · {completed.length} completed)
        </h3>
        <p className={styles.subtitle} style={{ marginBottom: "1rem" }}>
          Issues your MP has approved, executed, and closed through the governance lifecycle on this portal.
        </p>
        {lifecycleIssues.length === 0 ? (
          <p style={{ color: "#7c8db5" }}>No lifecycle-tracked issues in this constituency yet.</p>
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
                  {STAGE_EMOJI[issue.stage]} {STAGE_LABELS[issue.stage]}
                  {issue.currentProgress > 0 ? ` · ${issue.currentProgress}%` : ""}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className={mp.section}>
        <h3 className={styles.sectionTitle}>Constituency Infrastructure Registry</h3>
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