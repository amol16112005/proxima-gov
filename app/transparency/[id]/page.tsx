import Link from "next/link";
import { notFound } from "next/navigation";
import LifecycleTracker from "@/components/lifecycle/LifecycleTracker";
import { ensureDataHydrated } from "@/lib/cloud";
import { getIssueById } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";

export default async function TransparencyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await ensureDataHydrated();
  const issue = getIssueById(id);
  if (!issue) notFound();

  return (
    <div className={styles.pageWide}>
      <nav className={styles.authNav} style={{ maxWidth: "100%" }} aria-label="Site navigation">
        <Link href="/transparency" className={styles.linkMuted}>← Transparency Dashboard</Link>
        <div className={styles.authNavLinks}>
          <Link href="/" className={styles.linkMuted}>Home</Link>
          <Link href="/citizen/login" className={styles.linkMuted}>Citizen Login</Link>
        </div>
      </nav>
      <h2 className={styles.sectionTitle} style={{ marginTop: "0.5rem" }}>
        #{issue.id} — {issue.title}
      </h2>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        Public progress view — submitter identity and private complaint details are hidden.
      </p>
      <LifecycleTracker issue={issue} publicView />
    </div>
  );
}