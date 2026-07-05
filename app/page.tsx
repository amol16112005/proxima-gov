import Link from "next/link";
import WrongPortalNotice from "@/components/WrongPortalNotice";
import { CONSTITUENCIES } from "@/data/constituencies";
import { getSession } from "@/lib/auth/session";
import ls from "@/components/lifecycle/lifecycle.module.css";
import styles from "@/app/page.module.css";

const LIFECYCLE_FLOW = [
  "Submit Complaint",
  "AI Analysis",
  "MP Approval",
  "Work Assigned",
  "Live Progress",
  "Citizen Verify",
  "Impact Analysis",
];

const VALUES = [
  {
    icon: "🔍",
    title: "Transparency",
    text: "Every government project in your constituency is tracked publicly — budgets, timelines, and progress you can verify.",
  },
  {
    icon: "🤝",
    title: "Accountability",
    text: "Lok Sabha MPs see citizen issues in real time and are accountable for timely resolution within defined SLAs.",
  },
  {
    icon: "🔐",
    title: "Secure Access",
    text: "OTP-based authentication ensures only verified citizens and registered MPs access their respective portals.",
  },
  {
    icon: "🤖",
    title: "AI-Assisted Response",
    text: "ProximaGov AI acknowledges submissions instantly and helps route grievances to the right department faster.",
  },
];

const STEPS = [
  { step: "01", title: "Register as a Citizen", text: "Create your account with OTP verification and select your constituency." },
  { step: "02", title: "Track Local Work", text: "View roads, health centres, schools, and infrastructure projects in your area." },
  { step: "03", title: "Submit Grievances", text: "File structured complaints with category, location, and detailed description." },
  { step: "04", title: "MP Reviews & Acts", text: "Your Lok Sabha MP sees constituency-specific issues and drives MPLADS-funded resolution." },
];

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
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.badge}>Government of India · Lok Sabha · Digital India Initiative</div>
        <h1 className={styles.title}>Proxima Gov</h1>
        <p className={styles.tagline}>
          Bridging citizens and elected representatives through transparent governance,
          real-time project tracking, and secure digital grievance redressal.
        </p>
        <div className={styles.heroActions}>
          <Link href="/citizen/register" className={styles.btnCitizen}>
            Citizen Registration
          </Link>
          <Link href="/citizen/login" className={styles.btnOutline}>
            Citizen Login
          </Link>
          <Link href="/mp/login" className={styles.btnMp}>
            MP Login
          </Link>
          <Link href="/faq" className={styles.btnOutline}>
            FAQs
          </Link>
        </div>
        <p className={styles.securityNote}>
          Secured with OTP verification · No password required · Data encrypted in transit
        </p>
      </section>

      {/* About */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What is Proxima Gov?</h2>
        <p className={styles.sectionText}>
          Proxima Gov is India&apos;s citizen-first digital governance platform for Lok Sabha
          constituencies. It gives every resident a direct window into central-government-funded
          work in their parliamentary seat — from MPLADS projects and metro lines to rural roads
          and health centres. Citizens register, track progress, and submit issues. Members of
          Parliament receive a constituency dashboard for approvals, accountability, and transparency.
        </p>
      </section>

      {/* Values */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>What We Stand For</h2>
        <div className={styles.valuesGrid}>
          {VALUES.map((v) => (
            <article key={v.title} className={styles.valueCard}>
              <span className={styles.valueIcon} aria-hidden="true">{v.icon}</span>
              <h3 className={styles.valueTitle}>{v.title}</h3>
              <p className={styles.valueText}>{v.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Closed-loop lifecycle */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Closed-Loop Governance Lifecycle</h2>
        <p className={styles.sectionText}>
          Not just a grievance portal — a full development governance platform tracking execution,
          transparency, accountability, and measurable impact.
        </p>
        <div className={ls.flowDiagram}>
          {LIFECYCLE_FLOW.map((step, i) => (
            <span key={step} style={{ display: "contents" }}>
              <span className={ls.flowStep}>{step}</span>
              {i < LIFECYCLE_FLOW.length - 1 && <span className={ls.flowArrow}>→</span>}
            </span>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link href="/transparency" className={styles.btnOutline} style={{ display: "inline-flex" }}>
            View Public Transparency Dashboard
          </Link>
        </p>
      </section>

      {/* How it works */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        <div className={styles.stepsGrid}>
          {STEPS.map((s) => (
            <article key={s.step} className={styles.stepCard}>
              <span className={styles.stepNum}>{s.step}</span>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepText}>{s.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Coverage */}
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

      {/* FAQ teaser */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Common Questions</h2>
        <p className={styles.sectionText}>
          Confused about citizen vs MP login, why an issue was declined, photo uploads, or what MPs
          can approve? Our FAQ covers the most frequent portal questions.
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

      {/* Portal entry */}
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
          MP demo credentials for judges &amp; developers: see DEVELOPER_MP_CREDENTIALS.md
        </p>
      </footer>
    </div>
  );
}