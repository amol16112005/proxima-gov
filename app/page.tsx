import Link from "next/link";
import HomeLocalizedSections from "@/components/home/HomeLocalizedSections";
import WrongPortalNotice from "@/components/WrongPortalNotice";
import { CONSTITUENCIES } from "@/data/constituencies";
import { getSession } from "@/lib/auth/session";
import styles from "@/app/page.module.css";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; active?: string }>;
}) {
  const { reason, active } = await searchParams;
  const session = await getSession();
  const activeRole =
    active === "citizen" || active === "mp"
      ? active
      : session?.role === "citizen" || session?.role === "mp"
        ? session.role
        : undefined;
  const showWrongPortal = reason === "wrong_portal" && activeRole;

  return (
    <div className={styles.page}>
      {showWrongPortal ? (
        <WrongPortalNotice
          activeRole={activeRole}
          userName={session?.name}
          targetLoginHref={activeRole === "citizen" ? "/mp/login" : "/citizen/login"}
          variant="home"
        />
      ) : null}

      <HomeLocalizedSections />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Constituencies Covered</h2>
        <p className={styles.sectionText}>
          Currently serving {CONSTITUENCIES.length} Lok Sabha constituencies across India
          with live project tracking and dedicated MP dashboards.
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
        <h2 className={styles.sectionTitle}>Common Questions</h2>
        <p className={styles.sectionText}>
          Confused about citizen vs MP login, why an issue was declined, photo uploads, or what MPs
          can approve? Our FAQ covers the most frequent portal questions — also available in Hindi (हिन्दी).
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", justifyContent: "center" }}>
          <Link href="/faq" className={styles.btnOutline}>
            View All FAQs
          </Link>
          <Link href="/faq#faq-issues" className={styles.btnOutline}>
            Issue submission help
          </Link>
        </div>
      </section>

      <section className={styles.portalSection}>
        <h2 className={styles.sectionTitle}>Choose Your Portal</h2>
        <div className={styles.portalGrid}>
          <article className={styles.portalCard}>
            <span className={styles.portalIcon} aria-hidden="true">📬</span>
            <h3 className={styles.portalTitle}>Citizen Portal</h3>
            <p className={styles.portalDesc}>
              New user? Register with your mobile number, select your constituency, and access
              government work and grievance filing. Returning users can log in with OTP.
            </p>
            <div className={styles.portalLinks}>
              <Link href="/citizen/register" className={styles.btnCitizen}>Register</Link>
              <Link href="/citizen/login" className={styles.btnOutline}>Login</Link>
            </div>
          </article>
          <article className={styles.portalCard}>
            <span className={styles.portalIcon} aria-hidden="true">🏛️</span>
            <h3 className={styles.portalTitle}>MP Portal</h3>
            <p className={styles.portalDesc}>
              Restricted access for Lok Sabha Members of Parliament. Log in with your
              official constituency username and 6-digit PIN to view your personalized dashboard.
            </p>
            <Link href="/mp/login" className={styles.btnMp}>MP Login</Link>
          </article>
        </div>
      </section>

      <footer className={styles.footer}>
        <p>Proxima Digital Governance Initiative · Ministry of Electronics & IT · Government of India · FY 2026–27</p>
        <p className={styles.footerSub}>
          <Link href="/faq" style={{ color: "#a78bfa" }}>FAQs</Link>
          {" · "}
          <Link href="/problem" style={{ color: "#a78bfa" }}>Problem Statement</Link>
          {" · "}
          Use ♿ button for Hindi, large text, high contrast, and read-aloud
        </p>
      </footer>
    </div>
  );
}