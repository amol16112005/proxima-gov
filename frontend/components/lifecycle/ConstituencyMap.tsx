import Link from "next/link";
import { CONSTITUENCIES } from "@/data/constituencies";
import { interpolate } from "@/frontend/i18n";
import { getServerTranslator } from "@/frontend/i18n/server";
import { getIssuesByConstituency } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";

export default async function ConstituencyMap() {
  const t = await getServerTranslator();

  return (
    <div className={styles.grid2}>
      {CONSTITUENCIES.map((c) => {
        const issues = getIssuesByConstituency(c.id);
        const active = issues.filter((i) => i.currentProgress > 0 && i.currentProgress < 100).length;
        return (
          <Link
            key={c.id}
            href={`/transparency?constituency=${c.id}`}
            className={styles.projectCard}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <p style={{ fontSize: "0.75rem", color: "#a78bfa", marginBottom: "0.3rem" }}>
              📍 {c.state} · {c.district}
            </p>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.4rem" }}>{c.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "#7c8db5" }}>
              {t("map.mp")}: {c.mpName} ({c.mpParty})
            </p>
            <p style={{ fontSize: "0.8rem", color: "#9aa5b8", marginTop: "0.5rem" }}>
              {interpolate(t("map.lifecycleIssues"), { count: String(issues.length) })} ·{" "}
              {interpolate(t("map.active"), { active: String(active) })} ·{" "}
              {interpolate(t("map.population"), { pop: c.population })}
            </p>
          </Link>
        );
      })}
    </div>
  );
}