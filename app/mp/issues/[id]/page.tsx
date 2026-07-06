import { redirect, notFound } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import MpBackLink from "@/components/MpBackLink";
import MpIssueWorkspace from "@/components/mp/MpIssueWorkspace";
import { getConstituencyById } from "@/data/constituencies";
import { getMpById } from "@/data/mpRegistry";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getIssueById, isMpActionableIssue } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";

export const dynamic = "force-dynamic";

export default async function MpIssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "mp") redirect("/mp/login");

  await ensureDataHydrated();

  const { id } = await params;
  const issue = getIssueById(id);
  if (!issue || issue.constituencyId !== session.constituencyId || !isMpActionableIssue(issue)) {
    notFound();
  }

  const mp = getMpById(session.mpId ?? session.id);
  const constituency = getConstituencyById(issue.constituencyId);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="mp" userName={mp?.name ?? session.name} constituencyName={constituency?.name ?? ""} />
      <MpBackLink />
      <MpIssueWorkspace issue={issue} />
    </div>
  );
}