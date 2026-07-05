import Link from "next/link";
import ConstituencyMap from "@/components/lifecycle/ConstituencyMap";
import TransparencyCard from "@/components/lifecycle/TransparencyCard";
import { CONSTITUENCIES } from "@/data/constituencies";
import { ensureDataHydrated } from "@/lib/cloud";
import { getActiveTransparencyIssues, getAllIssues } from "@/lib/lifecycleStore";
import { interpolate } from "@/frontend/i18n";
import { getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";

export const revalidate = 60;

export default async function TransparencyPage({
  searchParams,
}: {
  searchParams: Promise<{ constituency?: string }>;
}) {
  const { constituency: filterId } = await searchParams;
  const m = await getServerTranslator();

  await ensureDataHydrated();
  const active = getActiveTransparencyIssues(filterId);
  const all = getAllIssues();
  const completed = all.filter(
    (i) => (i.stage === "completed" || i.impactAnalysis) && (!filterId || i.constituencyId === filterId)
  );
  const delayed = all.filter((i) => i.delayAlert?.active && (!filterId || i.constituencyId === filterId));

  return (
    <div className={styles.pageWide}>
      <header style={{ marginBottom: "2rem" }}>
        <nav className={styles.authNav} style={{ maxWidth: "100%" }} aria-label="Site navigation">
          <Link href="/" className={styles.linkMuted}>{m("nav.backHome")}</Link>
          <div className={styles.authNavLinks}>
            <Link href="/citizen/login" className={styles.linkMuted}>{m("nav.citizenPortal")}</Link>
            <Link href="/mp/login" className={styles.linkMuted}>{m("nav.mpPortal")}</Link>
          </div>
        </nav>
        <h1 className={styles.title} style={{ marginTop: "0.5rem" }}>{m("transparency.title")}</h1>
        <p className={styles.subtitle}>
          {interpolate(m("transparency.intro"), { count: CONSTITUENCIES.length })}
        </p>
      </header>

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className={styles.sectionTitle}>{m("transparency.mapTitle")}</h2>
        <ConstituencyMap />
      </section>

      {delayed.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 className={styles.sectionTitle}>{m("transparency.delayAlerts")}</h2>
          <div className={styles.grid2}>
            {delayed.map((issue) => (
              <TransparencyCard key={issue.id} issue={issue} />
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: "2.5rem" }}>
        <h2 className={styles.sectionTitle}>
          {interpolate(m("transparency.activeCount"), { count: active.length })}
        </h2>
        <div className={styles.grid2}>
          {active.map((issue) => (
            <TransparencyCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      <section>
        <h2 className={styles.sectionTitle}>{m("transparency.completedImpact")}</h2>
        <div className={styles.grid2}>
          {completed.map((issue) => (
            <TransparencyCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>
    </div>
  );
}