import Link from "next/link";
import { CONSTITUENCIES } from "@/data/constituencies";
import { getIssuesByConstituency } from "@/lib/lifecycleStore";
import styles from "@/app/shared.module.css";

export default function ConstituencyMap() {
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
            <p style={{ fontSize: "0.75rem", color: "#a78bfa", marginBottom: "0.3rem" }}>📍 {c.state} · {c.district}</p>
            <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: "0 0 0.4rem" }}>{c.name}</h3>
            <p style={{ fontSize: "0.82rem", color: "#7c8db5" }}>MP: {c.mpName} ({c.mpParty})</p>
            <p style={{ fontSize: "0.8rem", color: "#9aa5b8", marginTop: "0.5rem" }}>
              {issues.length} lifecycle issues · {active} active · Pop. {c.population}
            </p>
          </Link>
        );
      })}
    </div>
  );
}