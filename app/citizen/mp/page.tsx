import Link from "next/link";
import { redirect } from "next/navigation";
import MpTransparencyReportView from "@/components/MpTransparencyReport";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { getMpProfileByConstituency } from "@/data/mpProfiles";
import { getSession } from "@/lib/auth/session";
import { buildMpTransparencyReport } from "@/lib/datagovindia/mpReport";
import styles from "@/app/shared.module.css";

export default async function CitizenMpProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const constituency = getConstituencyById(session.constituencyId);
  const profile = getMpProfileByConstituency(session.constituencyId);
  if (!constituency || !profile) redirect("/citizen/dashboard");

  const report = await buildMpTransparencyReport(session.constituencyId);
  if (!report) redirect("/citizen/dashboard");

  return (
    <div className={styles.pageWide}>
      <PortalHeader
        portal="citizen"
        userName={session.name}
        constituencyName={constituency.name}
      />

      <Link href="/citizen/dashboard" className={styles.linkMuted}>
        ← Dashboard
      </Link>

      <header style={{ margin: "1rem 0 1.5rem" }}>
        <h2 className={styles.sectionTitle}>Your MP — Transparency Profile</h2>
        <p className={styles.subtitle}>
          Official performance report combining live MPLADS and MGNREGA data from{" "}
          <strong style={{ color: "#34d399" }}>data.gov.in</strong> with constituency
          project tracking on Proxima Gov.
        </p>
      </header>

      <MpTransparencyReportView report={report} />
    </div>
  );
}