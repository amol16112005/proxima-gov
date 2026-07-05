import Link from "next/link";
import { redirect } from "next/navigation";
import PortalHeader from "@/components/PortalHeader";
import { getConstituencyById } from "@/data/constituencies";
import { STAGE_EMOJI } from "@/data/lifecycleTypes";
import { getSession } from "@/lib/auth/session";
import {
  cloudStatus,
  ensureDataHydrated,
  getActivityForCitizen,
  type ActivityEntry,
} from "@/lib/cloud";
import { stageLabel } from "@/frontend/i18n/labels";
import { interpolate } from "@/frontend/i18n";
import type { MessageKey } from "@/frontend/i18n";
import { getServerLocale, getServerTranslator } from "@/frontend/i18n/server";
import styles from "@/app/shared.module.css";

const TYPE_KEYS: Record<ActivityEntry["type"], MessageKey> = {
  "citizen.registered": "history.type.citizenRegistered",
  "citizen.constituency_changed": "history.type.constituencyChanged",
  "issue.created": "history.type.issueCreated",
  "issue.stage_changed": "history.type.stageChanged",
  "issue.mp_action": "history.type.mpAction",
  "issue.citizen_verify": "history.type.citizenVerify",
  "issue.progress_photo": "history.type.progressPhoto",
  "grievance.created": "history.type.grievanceCreated",
  "grievance.status_changed": "history.type.grievanceStatus",
  "notification.sent": "history.type.notificationSent",
};

function formatWhen(iso: string, locale: string): string {
  return new Date(iso).toLocaleString(locale === "hi" ? "hi-IN" : "en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function CitizenHistoryPage() {
  const session = await getSession();
  if (!session || session.role !== "citizen") redirect("/citizen/login");

  const m = await getServerTranslator();
  const locale = await getServerLocale();

  await ensureDataHydrated();

  const constituency = getConstituencyById(session.constituencyId);
  if (!constituency) redirect("/citizen/login");

  const entries = getActivityForCitizen(session.id, 80);
  const cloud = cloudStatus();

  const cloudLabel =
    cloud.provider === "mongodb"
      ? m("history.mongodbActive")
      : cloud.provider === "sqlite"
        ? m("history.sqliteActive")
        : cloud.enabled
          ? m("history.persistenceActive")
          : m("history.demoMode");

  return (
    <div className={styles.pageWide}>
      <PortalHeader portal="citizen" userName={session.name} constituencyName={constituency.name} />

      <section style={{ marginBottom: "1.5rem" }}>
        <h1 className={styles.title} style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
          {m("history.title")}
        </h1>
        <p className={styles.subtitle}>
          {interpolate(m("history.subtitleAudit"), { name: constituency.name })}
        </p>
      </section>

      <div
        style={{
          marginBottom: "1.5rem",
          padding: "0.85rem 1rem",
          borderRadius: "0.75rem",
          border: `1px solid ${cloud.enabled ? "rgba(52, 211, 153, 0.35)" : "rgba(251, 191, 36, 0.35)"}`,
          background: cloud.enabled ? "rgba(52, 211, 153, 0.08)" : "rgba(251, 191, 36, 0.08)",
          fontSize: "0.88rem",
          color: cloud.enabled ? "#6ee7b7" : "#fcd34d",
        }}
      >
        <strong>{cloudLabel}</strong>
        <span style={{ color: "#9aa5b8", marginLeft: "0.5rem" }}>{cloud.message}</span>
      </div>

      {entries.length === 0 ? (
        <div className={styles.projectCard}>
          <p style={{ margin: 0, color: "#9aa5b8" }}>{m("history.emptyHint")}</p>
          <Link href="/citizen/issues/new" className={styles.btnPrimary} style={{ marginTop: "1rem", display: "inline-block" }}>
            {m("history.submitIssue")}
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
          {entries.map((entry) => (
            <article key={entry.id} className={styles.projectCard} style={{ padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "#7c8db5",
                    }}
                  >
                    {m(TYPE_KEYS[entry.type])}
                  </span>
                  <p style={{ margin: "0.35rem 0 0", fontWeight: 600, color: "#e8e8f0" }}>
                    {entry.summary}
                  </p>
                  {entry.stage && (
                    <p style={{ margin: "0.35rem 0 0", fontSize: "0.82rem", color: "#9aa5b8" }}>
                      {STAGE_EMOJI[entry.stage]} {m("history.stageLabel")} {stageLabel(locale, entry.stage)}
                    </p>
                  )}
                </div>
                <time style={{ fontSize: "0.78rem", color: "#7c8db5", whiteSpace: "nowrap" }}>
                  {formatWhen(entry.createdAt, locale)}
                </time>
              </div>
              {entry.issueId && (
                <div style={{ marginTop: "0.65rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <Link href={`/citizen/issues/${entry.issueId}`} className={styles.btnSecondary} style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                    {interpolate(m("history.viewIssue"), { id: entry.issueId })}
                  </Link>
                  <Link href={`/transparency/${entry.issueId}`} className={styles.btnSecondary} style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                    {m("nav.transparency")}
                  </Link>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}