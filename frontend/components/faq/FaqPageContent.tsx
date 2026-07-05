"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useAccessibility } from "@/context/AccessibilityContext";
import { FAQ_CATEGORIES } from "@/data/faqs";
import styles from "@/app/page.module.css";
import faq from "@/components/faq.module.css";

const FaqSection = dynamic(() => import("@/components/FaqSection"), {
  loading: () => <FaqLoading />,
});

function FaqLoading() {
  const { translate: t } = useAccessibility();
  return <p className={styles.sectionText}>{t("faq.loading")}</p>;
}

export default function FaqPageContent() {
  const { translate: t } = useAccessibility();

  return (
    <div className={styles.page}>
      <section className={styles.section} style={{ paddingTop: "2.5rem" }}>
        <Link href="/" className={styles.btnOutline} style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
          {t("faq.backHome")}
        </Link>
        <h1 className={styles.sectionTitle}>{t("faq.title")}</h1>
        <p className={styles.sectionText}>{t("faq.subtitle")}</p>
        <div className={faq.teaserGrid} style={{ marginBottom: "2rem" }}>
          <Link href="/citizen/register" className={faq.teaserCard}>
            <p className={faq.teaserTitle}>{t("faq.newCitizen")}</p>
            <p className={faq.teaserText}>{t("faq.newCitizenText")}</p>
          </Link>
          <Link href="/citizen/issues/new" className={faq.teaserCard}>
            <p className={faq.teaserTitle}>{t("faq.submittingIssue")}</p>
            <p className={faq.teaserText}>{t("faq.submittingIssueText")}</p>
          </Link>
          <Link href="/mp/login" className={faq.teaserCard}>
            <p className={faq.teaserTitle}>{t("faq.mpLoginHelp")}</p>
            <p className={faq.teaserText}>{t("faq.mpLoginText")}</p>
          </Link>
        </div>
        <FaqSection categories={FAQ_CATEGORIES} defaultOpenId="wrong-portal-login" />
      </section>

      <footer className={styles.footer}>
        <p>
          {t("faq.stillNeedHelp")}{" "}
          <Link href="/transparency" style={{ color: "#a78bfa" }}>
            {t("nav.transparency")}
          </Link>
          {" · "}
          <Link href="/" style={{ color: "#a78bfa" }}>
            {t("nav.home")}
          </Link>
        </p>
      </footer>
    </div>
  );
}