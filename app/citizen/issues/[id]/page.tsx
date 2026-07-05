import dynamic from "next/dynamic";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import CitizenVerify from "@/components/lifecycle/CitizenVerify";

const LifecycleTracker = dynamic(() => import("@/components/lifecycle/LifecycleTracker"), {
  loading: () => <p>Loading lifecycle tracker…</p>,
});
import { getConstituencyById } from "@/data/constituencies";
import { STAGE_EMOJI, STAGE_LABELS } from "@/data/lifecycleTypes";
import { citizenOwnsIssue } from "@/lib/auth/issueAccess";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getIssueById } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";

export default async function CitizenIssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  await ensureDataHydrated();

  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue) notFound();

  if (!citizenOwnsIssue(issue, session.id)) {
    if (issue.constituencyId === session.constituencyId) {
      redirect(`/transparency/${id}`);
    }
    notFound();
  }

  const constituency = getConstituencyById(issue.constituencyId);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency?.name ?? ""} />

      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/citizen/issues" className={styles.linkMuted}>← My Issues</Link>
        <h2 className={styles.sectionTitle} style={{ marginTop: "0.5rem" }}>
          {STAGE_EMOJI[issue.stage]} #{issue.id} — {issue.title}
        </h2>
        <p className={styles.subtitle}>
          Current stage: <strong>{STAGE_LABELS[issue.stage]}</strong>
          {issue.currentProgress > 0 && ` · ${issue.currentProgress}% complete`}
        </p>
      </div>

      {issue.stage === "citizen-verification" && (
        <CitizenVerify issueId={issue.id} />
      )}

      <LifecycleTracker issue={issue} />
    </div>
  );
}