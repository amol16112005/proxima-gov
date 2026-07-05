"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { CONSTITUENCIES } from "@/data/constituencies";
import styles from "@/app/shared.module.css";

interface ChangeConstituencyFormProps {
  currentConstituencyId: string;
}

export default function ChangeConstituencyForm({ currentConstituencyId }: ChangeConstituencyFormProps) {
  const router = useRouter();
  const { translate: t } = useAccessibility();
  const [constituencyId, setConstituencyId] = useState(currentConstituencyId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasChange = constituencyId !== currentConstituencyId;

  const save = async () => {
    if (!hasChange) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/citizen/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ constituencyId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("profile.updateFailed"));
        return;
      }
      setSuccess(data.message ?? t("profile.updated"));
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.projectCard}>
      <h2 className={styles.sectionTitle} style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
        {t("dash.changeConstituency")}
      </h2>
      <p style={{ fontSize: "0.88rem", color: "#9aa5b8", marginBottom: "1rem", lineHeight: 1.5 }}>
        {t("profile.changeDesc")}
      </p>

      {error && (
        <p className={styles.errorMsg} role="alert" style={{ marginBottom: "0.75rem" }}>
          {error}
        </p>
      )}
      {success && (
        <p
          role="status"
          style={{
            marginBottom: "0.75rem",
            padding: "0.65rem 0.85rem",
            borderRadius: "0.5rem",
            background: "rgba(52, 211, 153, 0.1)",
            border: "1px solid rgba(52, 211, 153, 0.3)",
            color: "#6ee7b7",
            fontSize: "0.88rem",
          }}
        >
          {success}
        </p>
      )}

      <div className={styles.fieldGroup}>
        <label className={styles.label} htmlFor="profile-constituency">
          {t("profile.parliamentaryConstituency")}<span className={styles.required}>*</span>
        </label>
        <select
          id="profile-constituency"
          className={styles.select}
          value={constituencyId}
          onChange={(e) => {
            setConstituencyId(e.target.value);
            setSuccess(null);
            setError(null);
          }}
        >
          {CONSTITUENCIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.state} — {t("profile.mpLabel")} {c.mpName}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        className={styles.btnPrimary}
        onClick={save}
        disabled={!hasChange || saving}
        style={{ marginTop: "0.5rem", opacity: !hasChange || saving ? 0.6 : 1 }}
      >
        {saving ? t("profile.saving") : t("profile.saveConstituency")}
      </button>
    </div>
  );
}