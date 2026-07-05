"use client";

import Link from "next/link";
import { useAccessibility } from "@/context/AccessibilityContext";
import styles from "@/app/page.module.css";

const PROBLEM_KEYS = [
  { title: "problem.citizenDisconnect" as const, text: "problem.citizenDisconnectText" as const },
  { title: "problem.wrongChannel" as const, text: "problem.wrongChannelText" as const },
  { title: "problem.noAccountability" as const, text: "problem.noAccountabilityText" as const },
  { title: "problem.mpBlindSpots" as const, text: "problem.mpBlindSpotsText" as const },
];

const SOLUTION_KEYS = [
  "problem.solution1",
  "problem.solution2",
  "problem.solution3",
  "problem.solution4",
] as const;

export default function ProblemPageContent() {
  const { translate: t } = useAccessibility();

  return (
    <div className={styles.page}>
      <section className={styles.section} style={{ paddingTop: "2.5rem" }} aria-labelledby="problem-page-title">
        <Link href="/" className={styles.btnOutline} style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
          {t("problem.backHome")}
        </Link>
        <h1 id="problem-page-title" className={styles.sectionTitle}>
          {t("problem.title")}
        </h1>
        <p className={styles.sectionText}>{t("problem.intro")}</p>

        <h2 className={styles.sectionTitle} style={{ fontSize: "1.35rem", marginTop: "2rem" }}>
          {t("problem.coreTitle")}
        </h2>
        <div className={styles.valuesGrid}>
          {PROBLEM_KEYS.map((p) => (
            <article key={p.title} className={styles.valueCard}>
              <h3 className={styles.valueTitle}>{t(p.title)}</h3>
              <p className={styles.valueText}>{t(p.text)}</p>
            </article>
          ))}
        </div>

        <h2 className={styles.sectionTitle} style={{ fontSize: "1.35rem", marginTop: "2rem" }}>
          {t("problem.solutionsTitle")}
        </h2>
        <ul className={styles.sectionText} style={{ paddingLeft: "1.25rem", lineHeight: 1.8 }}>
          {SOLUTION_KEYS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </section>

      <footer className={styles.footer}>
        <p>
          {t("problem.fullWriteup")}{" "}
          <a
            href="https://github.com/amol16112005/proxima-gov/blob/main/PROBLEM_STATEMENT.md"
            style={{ color: "#a78bfa" }}
          >
            {t("problem.githubLink")}
          </a>
        </p>
      </footer>
    </div>
  );
}