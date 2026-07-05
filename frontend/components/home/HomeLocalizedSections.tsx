"use client";

import Link from "next/link";
import { useAccessibility } from "@/context/AccessibilityContext";
import ls from "@/components/lifecycle/lifecycle.module.css";
import styles from "@/app/page.module.css";

const VALUE_KEYS = [
  { icon: "🔍", title: "value.transparency.title" as const, text: "value.transparency.text" as const },
  { icon: "🤝", title: "value.accountability.title" as const, text: "value.accountability.text" as const },
  { icon: "🔐", title: "value.security.title" as const, text: "value.security.text" as const },
  { icon: "🤖", title: "value.ai.title" as const, text: "value.ai.text" as const },
];

const STEP_KEYS = [
  { step: "01", title: "step.1.title" as const, text: "step.1.text" as const },
  { step: "02", title: "step.2.title" as const, text: "step.2.text" as const },
  { step: "03", title: "step.3.title" as const, text: "step.3.text" as const },
  { step: "04", title: "step.4.title" as const, text: "step.4.text" as const },
];

const LIFECYCLE_KEYS = [
  "lifecycle.1",
  "lifecycle.2",
  "lifecycle.3",
  "lifecycle.4",
  "lifecycle.5",
  "lifecycle.6",
  "lifecycle.7",
] as const;

export default function HomeLocalizedSections() {
  const { translate: t } = useAccessibility();

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.badge}>{t("home.badge")}</div>
        <h1 className={styles.title}>{t("home.title")}</h1>
        <p className={styles.tagline}>{t("home.tagline")}</p>
        <div className={styles.heroActions}>
          <Link href="/citizen/register" className={styles.btnCitizen}>
            {t("home.citizenRegister")}
          </Link>
          <Link href="/citizen/login" className={styles.btnOutline}>
            {t("home.citizenLogin")}
          </Link>
          <Link href="/mp/login" className={styles.btnMp}>
            {t("home.mpLogin")}
          </Link>
          <Link href="/faq" className={styles.btnOutline}>
            {t("home.faq")}
          </Link>
          <Link href="/problem" className={styles.btnOutline}>
            {t("home.problem")}
          </Link>
        </div>
        <p className={styles.securityNote}>{t("home.securityNote")}</p>
      </section>

      <section className={styles.section} aria-labelledby="problem-heading">
        <h2 id="problem-heading" className={styles.sectionTitle}>
          {t("home.problemTitle")}
        </h2>
        <p className={styles.sectionText}>{t("home.problemText")}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("home.aboutTitle")}</h2>
        <p className={styles.sectionText}>{t("home.aboutText")}</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("home.valuesTitle")}</h2>
        <div className={styles.valuesGrid}>
          {VALUE_KEYS.map((v) => (
            <article key={v.title} className={styles.valueCard}>
              <span className={styles.valueIcon} aria-hidden="true">
                {v.icon}
              </span>
              <h3 className={styles.valueTitle}>{t(v.title)}</h3>
              <p className={styles.valueText}>{t(v.text)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("home.lifecycleTitle")}</h2>
        <div className={ls.flowDiagram}>
          {LIFECYCLE_KEYS.map((key, i) => (
            <span key={key} style={{ display: "contents" }}>
              <span className={ls.flowStep}>{t(key)}</span>
              {i < LIFECYCLE_KEYS.length - 1 && <span className={ls.flowArrow}>→</span>}
            </span>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/transparency" className={styles.btnOutline} style={{ display: "inline-flex" }}>
            {t("home.transparency")}
          </Link>
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("home.stepsTitle")}</h2>
        <div className={styles.stepsGrid}>
          {STEP_KEYS.map((s) => (
            <article key={s.step} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.step}</span>
              <h3 className={styles.stepTitle}>{t(s.title)}</h3>
              <p className={styles.stepText}>{t(s.text)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}