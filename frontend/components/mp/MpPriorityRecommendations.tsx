import Link from "next/link";
import type { PriorityCluster } from "@/lib/priorityEngine";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { formatINR } from "@/data/constituencies";
import styles from "@/app/shared.module.css";
import ls from "@/components/lifecycle/lifecycle.module.css";
import mpStyles from "@/components/mp/mpPriority.module.css";

interface MpPriorityRecommendationsProps {
  clusters: PriorityCluster[];
  pending: DevelopmentIssue[];
  labels: {
    title: string;
    subtitle: string;
    formula: string;
    rank: string;
    demand: string;
    gap: string;
    urgency: string;
    dataSignals: string;
    citizensReported: string;
    reviewTop: string;
    noClusters: string;
  };
}

export default function MpPriorityRecommendations({
  clusters,
  pending,
  labels,
}: MpPriorityRecommendationsProps) {
  if (clusters.length === 0 && pending.length === 0) {
    return (
      <div className={styles.projectCard} style={{ padding: "1.25rem 1.5rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: 0, fontWeight: 600, color: "#9aa5b8" }}>{labels.noClusters}</p>
      </div>
    );
  }

  return (
    <section className={mpStyles.wrap}>
      <h2 className={styles.sectionTitle}>{labels.title}</h2>
      <p className={styles.subtitle} style={{ marginBottom: "0.75rem" }}>
        {labels.subtitle}
      </p>
      <p className={mpStyles.formula}>{labels.formula}</p>

      <div className={mpStyles.clusterList}>
        {clusters.map((cluster, index) => {
          const topIssue = pending.find((i) => i.id === cluster.topIssueId);
          return (
            <article key={cluster.clusterId} className={mpStyles.clusterCard}>
              <div className={mpStyles.clusterHeader}>
                <span className={mpStyles.rankBadge}>
                  {labels.rank} {index + 1}
                </span>
                <span className={mpStyles.scoreBadge}>{cluster.compositePriorityScore}/100</span>
              </div>
              <h3 className={mpStyles.clusterTitle}>{cluster.summary}</h3>
              <p className={mpStyles.clusterTheme}>
                {cluster.themeLabel} · {cluster.hotspot}
              </p>
              <div className={mpStyles.metrics}>
                <span>
                  {labels.demand}: <strong>{cluster.citizenDemandCount}</strong>
                </span>
                <span>
                  {labels.gap}: <strong>{cluster.infrastructureGapWeight}</strong>
                </span>
                <span>
                  {labels.urgency}: <strong>{cluster.avgUrgency}</strong>
                </span>
              </div>
              {cluster.dataSignals.length > 0 && (
                <div className={mpStyles.signals}>
                  <p className={mpStyles.signalsLabel}>{labels.dataSignals}</p>
                  <ul>
                    {cluster.dataSignals.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {topIssue && (
                <Link href={`/mp/issues/${topIssue.id}`} className={ls.issueListItem}>
                  <div>
                    <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>
                      #{topIssue.id} · {labels.citizensReported}
                    </p>
                    <p style={{ fontWeight: 600 }}>{topIssue.title}</p>
                  </div>
                  <span>{formatINR(topIssue.aiAnalysis?.estimatedCost ?? 0)}</span>
                </Link>
              )}
              {topIssue && (
                <Link
                  href={`/mp/issues/${topIssue.id}`}
                  className={styles.btnSecondary}
                  style={{ marginTop: "0.75rem", display: "inline-flex" }}
                >
                  {labels.reviewTop}
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}