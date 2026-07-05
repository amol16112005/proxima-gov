import Link from "next/link";
import { redirect } from "next/navigation";
import NewIssueForm from "@/components/NewIssueForm";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { getSession } from "@/lib/auth/session";
import styles from "@/app/shared.module.css";

export default async function NewIssuePage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const constituency = getConstituencyById(session.constituencyId);

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency?.name ?? ""} />
      <Link href="/citizen/issues" className={styles.linkMuted}>← My Issues</Link>
      <NewIssueForm />
    </div>
  );
}