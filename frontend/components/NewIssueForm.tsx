"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import type { MessageKey } from "@/frontend/i18n";
import styles from "@/app/shared.module.css";

const CATEGORY_OPTIONS: { value: string; labelKey: MessageKey }[] = [
  { value: "", labelKey: "issuesNew.selectCategory" },
  { value: "infrastructure", labelKey: "cat.infrastructure" },
  { value: "healthcare", labelKey: "cat.healthcare" },
  { value: "education", labelKey: "cat.education" },
  { value: "water-sanitation", labelKey: "cat.water-sanitation" },
  { value: "employment", labelKey: "cat.employment" },
  { value: "safety", labelKey: "cat.safety" },
  { value: "other", labelKey: "cat.other" },
];

export default function NewIssueForm() {
  const router = useRouter();
  const { translate: t } = useAccessibility();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title, description, location }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("issuesNew.submissionFailed"));
        return;
      }
      router.push(`/citizen/issues/${data.issue.id}`);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card} style={{ maxWidth: "100%" }}>
      <h1 className={styles.title}>{t("issuesNew.title")}</h1>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        {t("issuesNew.aiHint")}
      </p>
      <form onSubmit={submit} aria-busy={loading}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-category">
            {t("issuesNew.category")}<span className={styles.required}>*</span>
          </label>
          <select
            id="issue-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-title">
            {t("issuesNew.titleField")}<span className={styles.required}>*</span>
          </label>
          <input
            id="issue-title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("issuesNew.titlePlaceholder")}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-location">
            {t("issuesNew.location")}<span className={styles.required}>*</span>
          </label>
          <input
            id="issue-location"
            className={styles.input}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("issuesNew.locationPlaceholder")}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-description">
            {t("issuesNew.detailedDesc")}<span className={styles.required}>*</span>
          </label>
          <textarea
            id="issue-description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder={t("issuesNew.descPlaceholder")}
            required
          />
        </div>
        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="submit" className={styles.btnPrimary} disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span className="sr-only">{t("common.submittingIssue")}</span>
              </>
            ) : (
              t("issuesNew.submitAi")
            )}
          </button>
          <Link href="/citizen/dashboard" className={styles.btnSecondary}>
            {t("common.cancel")}
          </Link>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#7c8db5", marginTop: "1rem" }}>
          {t("issuesNew.faqHint")}{" "}
          <Link href="/faq#faq-issues" style={{ color: "#a78bfa" }}>
            {t("issuesNew.readFaqs")}
          </Link>
        </p>
      </form>
    </div>
  );
}