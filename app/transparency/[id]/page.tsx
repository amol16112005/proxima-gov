import Link from "next/link";
import { notFound } from "next/navigation";
import LifecycleTracker from "@/components/lifecycle/LifecycleTracker";
import { ensureDataHydrated } from "@/lib/cloud";
import { getIssueById } from "@/lib/lifecycleStore";
import { getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";

export default async function TransparencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = await getServerTranslator();

  await ensureDataHydrated();
  const issue = getIssueById(id);
  if (!issue) notFound();

  return (
    <div className={styles.pageWide}>
      <nav className={styles.authNav} style={{ maxWidth: "100%" }} aria-label={m("nav.siteNavigation")}>
        <Link href="/transparency" className={styles.linkMuted}>{m("transparency.detailNav")}</Link>
        <div className={styles.authNavLinks}>
          <Link href="/" className={styles.linkMuted}>{m("nav.home")}</Link>
          <Link href="/citizen/login" className={styles.linkMuted}>{m("nav.login")}</Link>
        </div>
      </nav>
      <h2 className={styles.sectionTitle} style={{ marginTop: "0.5rem" }}>
        #{issue.id} — {issue.title}
      </h2>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        {m("transparency.publicViewNote")}
      </p>
      <LifecycleTracker issue={issue} publicView />
    </div>
  );
}