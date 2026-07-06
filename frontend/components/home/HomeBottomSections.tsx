"use client";

import Link from "next/link";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { CitizenPortalIcon, MpPortalIcon } from "@/components/icons/ProximaIcons";
import { CONSTITUENCIES } from "@/data/constituencies";
import styles from "@/app/page.module.css";

export default function HomeBottomSections() {
  const { translate: t } = useAccessibility();

  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("home.constituenciesTitle")}</h2>
        <p className={styles.sectionText}>
          {interpolate(t("home.constituenciesText"), { count: CONSTITUENCIES.length })}
        </p>
        <div className={styles.constituencyList}>
          {CONSTITUENCIES.map((c) => (
            <span key={c.id} className={styles.constituencyChip}>
              {c.name}, {c.state} — {c.mpName}
            </span>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>{t("home.faqSectionTitle")}</h2>
        <p className={styles.sectionText}>{t("home.faqSectionText")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/faq" className={styles.btnOutline}>
            {t("home.viewAllFaqs")}
          </Link>
          <Link href="/faq#faq-issues" className={styles.btnOutline}>
            {t("home.issueHelp")}
          </Link>
        </div>
      </section>

      <section className={styles.portalSection}>
        <h2 className={styles.sectionTitle}>{t("home.choosePortal")}</h2>
        <div className={styles.portalGrid}>
          <article className={styles.portalCard}>
            <span className={styles.portalIcon} aria-hidden="true">
              <CitizenPortalIcon />
            </span>
            <h3 className={styles.portalTitle}>{t("home.citizenPortalTitle")}</h3>
            <p className={styles.portalDesc}>{t("home.citizenPortalDesc")}</p>
            <div className={styles.portalLinks}>
              <Link href="/citizen/register" className={styles.btnCitizen}>
                {t("nav.register")}
              </Link>
              <Link href="/citizen/login" className={styles.btnOutline}>
                {t("nav.login")}
              </Link>
            </div>
          </article>
          <article className={styles.portalCard}>
            <span className={styles.portalIcon} aria-hidden="true">
              <MpPortalIcon />
            </span>
            <h3 className={styles.portalTitle}>{t("home.mpPortalTitle")}</h3>
            <p className={styles.portalDesc}>{t("home.mpPortalDesc")}</p>
            <Link href="/mp/login" className={styles.btnMp}>
              {t("home.mpLogin")}
            </Link>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>{t("home.footer")}</p>
        <p className={styles.footerSub}>
          <Link href="/faq" style={{ color: "#a78bfa" }}>
            {t("nav.faqs")}
          </Link>
          {" · "}
          <Link href="/problem" style={{ color: "#a78bfa" }}>
            {t("home.problem")}
          </Link>
          {" · "}
          {t("home.footerA11y")}
        </p>
      </footer>
    </>
  );
}