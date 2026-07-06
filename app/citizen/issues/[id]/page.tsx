import dynamic from "next/dynamic";
import { redirect, notFound } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import CitizenIssueHeader from "@/components/CitizenIssueHeader";
import LoadingTracker from "@/components/LoadingTracker";
import CitizenVerify from "@/components/lifecycle/CitizenVerify";

const LifecycleTracker = dynamic(() => import("@/components/lifecycle/LifecycleTracker"), {
  loading: () => <LoadingTracker />,
});
import { getConstituencyById } from "@/data/constituencies";
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

      <CitizenIssueHeader
        issueId={issue.id}
        title={issue.title}
        stage={issue.stage}
        currentProgress={issue.currentProgress}
      />

      {issue.stage === "citizen-verification" && (
        <CitizenVerify issueId={issue.id} />
      )}

      <LifecycleTracker issue={issue} />
    </div>
  );
}