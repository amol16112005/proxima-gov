import Link from "next/link";
import FaqSection from "@/components/FaqSection";
import { FAQ_CATEGORIES } from "@/data/faqs";
import styles from "@/app/page.module.css";
import faq from "@/components/faq.module.css";

export default function FaqPage() {
  return (
    <main className={styles.page}>
      <section className={styles.section} style={{ paddingTop: "2.5rem" }}>
        <Link href="/" className={styles.btnOutline} style={{ display: "inline-flex", marginBottom: "1.5rem" }}>
          ← Back to Home
        </Link>
        <h1 className={styles.sectionTitle}>Frequently Asked Questions</h1>
        <p className={styles.sectionText}>
          Clear answers to common questions about citizen access, MP workflows, AI issue screening,
          photo uploads, and transparency on Proxima Gov.
        </p>
        <div className={faq.teaserGrid} style={{ marginBottom: "2rem" }}>
          <Link href="/citizen/register" className={faq.teaserCard}>
            <p className={faq.teaserTitle}>New citizen?</p>
            <p className={faq.teaserText}>Register with OTP and select your constituency.</p>
          </Link>
          <Link href="/citizen/issues/new" className={faq.teaserCard}>
            <p className={faq.teaserTitle}>Submitting an issue?</p>
            <p className={faq.teaserText}>Read what AI screens and what MPs can approve.</p>
          </Link>
          <Link href="/mp/login" className={faq.teaserCard}>
            <p className={faq.teaserTitle}>MP login?</p>
            <p className={faq.teaserText}>Separate account — log out of Citizen Portal first.</p>
          </Link>
        </div>
        <FaqSection categories={FAQ_CATEGORIES} defaultOpenId="wrong-portal-login" />
      </section>

      <footer className={styles.footer}>
        <p>
          Still need help?{" "}
          <Link href="/transparency" style={{ color: "#a78bfa" }}>
            Transparency Dashboard
          </Link>
          {" · "}
          <Link href="/" style={{ color: "#a78bfa" }}>
            Home
          </Link>
        </p>
      </footer>
    </main>
  );
}