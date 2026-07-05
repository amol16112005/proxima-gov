import {
  formatINR,
  PROJECT_STATUS_LABELS,
  type GovernmentProject,
  type ProjectStatus,
} from "@/data/constituencies";
import styles from "@/app/shared.module.css";

const STATUS_CLASS: Record<ProjectStatus, string> = {
  planned: styles.statusPlanned,
  "in-progress": styles.statusInProgress,
  completed: styles.statusCompleted,
  delayed: styles.statusDelayed,
};

export default function ProjectCard({ project }: { project: GovernmentProject }) {
  const due = new Date(project.expectedCompletion).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article className={styles.projectCard}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.6rem" }}>
        <span className={`${styles.statusPill} ${STATUS_CLASS[project.status]}`}>
          {PROJECT_STATUS_LABELS[project.status]}
        </span>
        <span style={{ fontSize: "0.75rem", color: "#5a6880" }}>{project.id}</span>
      </div>
      <h3 className={styles.projectTitle}>{project.title}</h3>
      <p className={styles.projectDesc}>{project.description}</p>
      <div className={styles.metaRow}>
        <span>{project.department}</span>
        <span>{formatINR(project.budget)}</span>
        <span>Due {due}</span>
      </div>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${project.progress}%` }} />
      </div>
      <p style={{ fontSize: "0.75rem", color: "#7c8db5", marginTop: "0.4rem" }}>
        {project.progress}% complete
      </p>
    </article>
  );
}