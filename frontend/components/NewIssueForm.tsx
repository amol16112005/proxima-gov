"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/app/shared.module.css";

const CATEGORIES = [
  { value: "", label: "Select issue category" },
  { value: "infrastructure", label: "Infrastructure & Roads" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "water-sanitation", label: "Water & Sanitation" },
  { value: "employment", label: "Employment & Welfare" },
  { value: "safety", label: "Public Safety" },
  { value: "other", label: "Other" },
];

export default function NewIssueForm() {
  const router = useRouter();
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
        setError(data.error ?? "Submission failed.");
        return;
      }
      router.push(`/citizen/issues/${data.issue.id}`);
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card} style={{ maxWidth: "100%" }}>
      <h1 className={styles.title}>Submit a Community Issue</h1>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        AI first scans your issue for constituency reach and MP mandate. Eligible community issues
        go to your MP for approval; out-of-scope submissions receive an automated explanation
        and referral guidance — they will not appear on the MP dashboard.
      </p>
      <form onSubmit={submit} aria-busy={loading}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-category">
            Category<span className={styles.required}>*</span>
          </label>
          <select
            id="issue-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-title">
            Issue Title<span className={styles.required}>*</span>
          </label>
          <input
            id="issue-title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Damaged road in XYZ village"
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-location">
            Location<span className={styles.required}>*</span>
          </label>
          <input
            id="issue-location"
            className={styles.input}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Village, ward, landmark"
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-description">
            Detailed Description<span className={styles.required}>*</span>
          </label>
          <textarea
            id="issue-description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe the problem, who is affected, and for how long..."
            required
          />
        </div>
        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="submit" className={styles.btnPrimary} disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span className="sr-only">Submitting issue</span>
              </>
            ) : (
              "Submit & Run AI Analysis"
            )}
          </button>
          <Link href="/citizen/dashboard" className={styles.btnSecondary}>Cancel</Link>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#7c8db5", marginTop: "1rem" }}>
          Not sure what to submit?{" "}
          <Link href="/faq#faq-issues" style={{ color: "#a78bfa" }}>
            Read issue submission FAQs
          </Link>
        </p>
      </form>
    </div>
  );
}