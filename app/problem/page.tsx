import Link from "next/link";
import styles from "@/app/page.module.css";

export const revalidate = 86400;

const PROBLEMS = [
  {
    title: "Citizen disconnection",
    text: "Residents cannot see MPLADS work, submit constituency-scoped issues, or verify completion.",
  },
  {
    title: "Wrong-channel grievances",
    text: "Passport, police, tax, and personal job pleas reach MPs without triage or referral.",
  },
  {
    title: "No accountability loop",
    text: "Complaints lack stages, photo evidence, citizen verification, and impact metrics.",
  },
  {
    title: "MP blind spots",
    text: "No single dashboard for pending approvals, delays, and constituency execution.",
  },
];

const SOLUTIONS = [
  "Dual citizen + MP portals with OTP and PIN authentication",
  "AI jurisdiction triage before issues reach the MP dashboard",
  "Closed-loop lifecycle with mandatory progress photos",
  "Public transparency dashboard and structured FAQ",
];

export default function ProblemPage() {
  return (
    <div className={styles.page}>
      <section className={styles.section} style={{ paddingTop: "2.5rem" }} aria-labelledby="problem-page-title">
        <Link href="/" className={styles.btnOutline} style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
          ← Back to Home
        </Link>
        <h1 id="problem-page-title" className={styles.sectionTitle}>
          Problem Statement
        </h1>
        <p className={styles.sectionText}>
          Lok Sabha constituencies need a digital bridge between citizens who report local development
          needs and MPs who execute MPLADS-aligned work. Proxima Gov was built directly for this hackathon
          mandate: transparent, accountable, constituency-scoped digital governance.
        </p>

        <h2 className={styles.sectionTitle} style={{ fontSize: "1.35rem", marginTop: "2rem" }}>
          Core Problems
        </h2>
        <div className={styles.valuesGrid}>
          {PROBLEMS.map((p) => (
            <article key={p.title} className={styles.valueCard}>
              <h3 className={styles.valueTitle}>{p.title}</h3>
              <p className={styles.valueText}>{p.text}</p>
            </article>
          ))}
        </div>

        <h2 className={styles.sectionTitle} style={{ fontSize: "1.35rem", marginTop: "2rem" }}>
          How Proxima Gov Solves Them
        </h2>
        <ul className={styles.sectionText} style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          {SOLUTIONS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <footer className={styles.footer}>
        <p>
          Full write-up:{" "}
          <a href="https://github.com/amol16112005/proxima-gov/blob/main/PROBLEM_STATEMENT.md" style={{ color: "#a78bfa" }}>
            PROBLEM_STATEMENT.md on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}