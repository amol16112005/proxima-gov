import Link from "next/link";
import ConstituencyMap from "@/components/lifecycle/ConstituencyMap";
import TransparencyCard from "@/components/lifecycle/TransparencyCard";
import { CONSTITUENCIES } from "@/data/constituencies";
import { ensureDataHydrated } from "@/lib/cloud";
import { getActiveTransparencyIssues, getAllIssues } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";

export default async function TransparencyPage({
  searchParams,
}: {
  searchParams: Promise<{ constituency?: string }>;
}) {
  const { constituency: filterId } = await searchParams;
  await ensureDataHydrated();
  const active = getActiveTransparencyIssues(filterId);
  const all = getAllIssues();
  const completed = all.filter(
    (i) => (i.stage === "completed" || i.impactAnalysis) && (!filterId || i.constituencyId === filterId)
  );
  const delayed = all.filter((i) => i.delayAlert?.active && (!filterId || i.constituencyId === filterId));

  return (
    <main className={styles.pageWide}>
      <header style={{ marginBottom: "2rem" }}>
        <nav className={styles.authNav} style={{ maxWidth: "100%" }} aria-label="Site navigation">
          <Link href="/" className={styles.linkMuted}>← Home</Link>
          <div className={styles.authNavLinks}>
            <Link href="/citizen/login" className={styles.linkMuted}>Citizen Login</Link>
            <Link href="/mp/login" className={styles.linkMuted}>MP Login</Link>
          </div>
        </nav>
        <h1 className={styles.title} style={{ marginTop: "0.5rem" }}>Public Transparency Dashboard</h1>
        <p className={styles.subtitle}>
          Live project progress, budgets, and accountability across {CONSTITUENCIES.length} constituencies.
          Individual citizen profiles and private complaint details are not shown here.
        </p>
      </header>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className={styles.sectionTitle}>Constituency Map</h2>
        <ConstituencyMap />
      </section>

      {delayed.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 className={styles.sectionTitle}>⚠️ AI Delay Alerts</h2>
          <div className={styles.grid2}>
            {delayed.map((issue) => (
              <TransparencyCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className={styles.sectionTitle}>Active Projects ({active.length})</h2>
        <div className={styles.grid2}>
          {active.map((issue) => (
            <TransparencyCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>Completed & Impact Measured</h2>
        <div className={styles.grid2}>
          {completed.map((issue) => (
            <TransparencyCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>
    </main>
  );
}