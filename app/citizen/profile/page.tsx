import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import ChangeConstituencyForm from "@/components/ChangeConstituencyForm";
import { getConstituencyById } from "@/data/constituencies";
import { ensureDataHydrated } from "@/lib/cloud";
import { getSession } from "@/lib/auth/session";
import { getCitizenById } from "@/lib/store";
import { interpolate } from "@/frontend/i18n";
import { getServerLocale, getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";

export default async function CitizenProfilePage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const m = await getServerTranslator();
  const locale = await getServerLocale();

  await ensureDataHydrated();

  const citizen = getCitizenById(session.id);
  const constituency = getConstituencyById(session.constituencyId);
  if (!citizen || !constituency) redirect("/citizen/login");

  const constituencyLabel = `${constituency.name}, ${constituency.state}`;
  const memberSince = new Date(citizen.createdAt).toLocaleDateString(locale === "hi" ? "hi-IN" : "en-IN");

  return (
    <div className={styles.pageWide}>
      <PortalHeader
        portal="citizen"
        userName={session.name}
        constituencyName={constituencyLabel}
      />

      <section style={{ marginBottom: "1.5rem" }}>
        <h1 className={styles.title} style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
          {m("profile.title")}
        </h1>
        <p className={styles.subtitle}>{m("profile.manageAccount")}</p>
      </section>

      <div className={styles.grid2} style={{ marginBottom: "1.5rem" }}>
        <div className={styles.projectCard}>
          <p style={{ fontSize: "0.75rem", color: "#7c8db5", margin: 0 }}>{m("profile.account")}</p>
          <p style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0.35rem 0 0" }}>{citizen.name}</p>
          <p style={{ fontSize: "0.85rem", color: "#9aa5b8", margin: "0.35rem 0 0" }}>{citizen.email}</p>
          <p style={{ fontSize: "0.85rem", color: "#9aa5b8", margin: "0.35rem 0 0" }}>
            {m("profile.mobile")} {citizen.phone}
          </p>
        </div>
        <div className={styles.projectCard}>
          <p style={{ fontSize: "0.75rem", color: "#7c8db5", margin: 0 }}>{m("profile.currentConstituency")}</p>
          <p style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0.35rem 0 0" }}>
            {constituency.name}
          </p>
          <p style={{ fontSize: "0.85rem", color: "#9aa5b8", margin: "0.35rem 0 0" }}>
            {constituency.state} · {m("profile.mpLabel")} {constituency.mpName} ({constituency.mpParty})
          </p>
          <p style={{ fontSize: "0.82rem", color: "#7c8db5", margin: "0.5rem 0 0" }}>
            {interpolate(m("profile.memberSince"), { date: memberSince })}
          </p>
        </div>
      </div>

      <ChangeConstituencyForm currentConstituencyId={citizen.constituencyId} />
    </div>
  );
}