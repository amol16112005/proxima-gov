"use client";

import { useState } from "react";
import type { Grievance, GrievanceStatus } from "@/lib/store";
import styles from "@/app/shared.module.css";

const STATUS_OPTIONS: { value: GrievanceStatus; label: string }[] = [
  { value: "submitted", label: "Submitted" },
  { value: "under-review", label: "Under Review" },
  { value: "in-progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
];

export default function MpGrievanceManager({
  initialGrievances,
}: {
  initialGrievances: Grievance[];
}) {
  const [grievances, setGrievances] = useState(initialGrievances);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateStatus = async (id: string, status: GrievanceStatus) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/grievances", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setGrievances((prev) =>
          prev.map((g) => (g.id === id ? data.grievance : g))
        );
      }
    } finally {
      setUpdating(null);
    }
  };

  if (grievances.length === 0) {
    return (
      <p style={{ color: "#7c8db5", fontSize: "0.9rem" }}>
        No citizen grievances filed in your constituency yet this session.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {grievances.map((g) => (
        <article key={g.id} className={styles.projectCard}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "#7c8db5" }}>{g.id}</span>
            <span style={{ fontSize: "0.85rem" }}>From: <strong>{g.citizenName}</strong></span>
          </div>
          <h3 className={styles.projectTitle}>{g.subject}</h3>
          <p className={styles.projectDesc}>{g.description}</p>
          {g.location && (
            <p style={{ fontSize: "0.82rem", color: "#7c8db5" }}>📍 {g.location}</p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <label style={{ fontSize: "0.82rem", color: "#9aa5b8" }} htmlFor={`status-${g.id}`}>
              Update status:
            </label>
            <select
              id={`status-${g.id}`}
              className={styles.select}
              style={{ maxWidth: "180px" }}
              value={g.status}
              disabled={updating === g.id}
              onChange={(e) => updateStatus(g.id, e.target.value as GrievanceStatus)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            {updating === g.id && <span className={styles.spinner} />}
          </div>
        </article>
      ))}
    </div>
  );
}