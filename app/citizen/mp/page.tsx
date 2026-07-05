import Link from "next/link";
import { redirect } from "next/navigation";
import MpTransparencyReportView from "@/components/MpTransparencyReport";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { getMpProfileByConstituency } from "@/data/mpProfiles";
import { getSession } from "@/lib/auth/session";
import { buildMpTransparencyReport } from "@/lib/datagovindia/mpReport";
import { interpolate } from "@/frontend/i18n";
import { getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";

export default async function CitizenMpProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const m = await getServerTranslator();

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
        {m("issues.backDashboard")}
      </Link>

      <header style={{ margin: "1rem 0 1.5rem" }}>
        <h2 className={styles.sectionTitle}>{m("mpProfile.title")}</h2>
        <p className={styles.subtitle}>
          {interpolate(m("mpProfile.subtitle"), { source: m("mpProfile.dataGov") })}
        </p>
      </header>

      <MpTransparencyReportView report={report} />
    </div>
  );
}