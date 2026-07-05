"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { SUB_STAGE_CONFIG } from "@/data/lifecycleTypes";
import { compressImageFile } from "@/frontend/lib/imageUpload";
import { canMarkWorkComplete, hasCompletionPhoto } from "@/lib/lifecycleRules";
import styles from "@/app/shared.module.css";

export default function MpIssueActions({ issue }: { issue: DevelopmentIssue }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<"progress" | "completion" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [uploadingKind, setUploadingKind] = useState<"progress" | "completion" | null>(null);

  const act = async (action: string, extra?: Record<string, unknown>) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Action failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completionReady = canMarkWorkComplete(issue);
  const hasCompletion = hasCompletionPhoto(issue);

  const openPhotoPicker = (kind: "progress" | "completion") => {
    setError(null);
    pendingUploadRef.current = kind;
    fileInputRef.current?.click();
  };

  const onPhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const kind = pendingUploadRef.current;
    pendingUploadRef.current = null;

    if (!file) return;
    if (!kind) return;

    setError(null);
    setLoading(true);
    setUploadingKind(kind);
    try {
      const imageUrl = await compressImageFile(file);
      const isCompletion = kind === "completion";
      const progressCount = issue.progressImages.filter((img) => !img.isCompletion).length;

      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addImage",
          label: isCompletion ? "Completion" : `Week ${progressCount + 1}`,
          caption: isCompletion
            ? "After-work completion photo (required)"
            : "Site progress photo",
          isCompletion,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Photo upload failed.");
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed.");
    } finally {
      setUploadingKind(null);
      setLoading(false);
    }
  };

  return (
    <div className={styles.projectCard} style={{ marginBottom: "1.5rem" }}>
      <h3 className={styles.sectionTitle}>MP Actions — #{issue.id}</h3>

      {error && (
        <p className={styles.errorMsg} role="alert" style={{ marginBottom: "1rem" }}>
          {error}
        </p>
      )}

      {(issue.stage === "ai-analysis" || issue.stage === "mp-approval") && (
        <button
          className={styles.btnPrimary}
          disabled={loading}
          onClick={() =>
            act("approve", {
              fund: "MPLADS",
              budget: issue.aiAnalysis?.estimatedCost ?? 10_00_000,
            })
          }
          type="button"
        >
          🟢 Approve Project
        </button>
      )}

      {issue.stage === "approved" && (
        <button
          className={styles.btnPrimary}
          disabled={loading}
          onClick={() =>
            act("assign", {
              contractor: "ABC Infrastructure Pvt. Ltd.",
              officer: "District Engineer",
              estimatedDays: 45,
              deadline: new Date(Date.now() + 45 * 86400000).toISOString().split("T")[0],
            })
          }
          type="button"
          style={{ marginTop: "0.5rem" }}
        >
          👷 Assign Contractor
        </button>
      )}

      {issue.stage === "work-assigned" && (
        <button className={styles.btnPrimary} disabled={loading} onClick={() => act("tender")} type="button">
          📋 Release Tender
        </button>
      )}

      {issue.stage === "tender-released" && (
        <button className={styles.btnPrimary} disabled={loading} onClick={() => act("start")} type="button">
          🚧 Start Work
        </button>
      )}

      {(issue.stage === "work-started" || issue.stage === "in-progress") && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            style={{ display: "none" }}
            onChange={onPhotoSelected}
          />
          <p className={styles.infoBox} style={{ marginBottom: "0.75rem" }}>
            Progress photos are mandatory. Upload site photos during work, then a completion
            (after-work) photo before marking the project complete for citizen verification.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {SUB_STAGE_CONFIG.filter((s) => s.key !== "completed").map((s) => (
              <button
                key={s.key}
                className={styles.btnSecondary}
                disabled={loading}
                onClick={() => act("progress", { subStage: s.key })}
                type="button"
              >
                {s.label} ({s.progress}%)
              </button>
            ))}
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => openPhotoPicker("progress")}
              type="button"
            >
              {loading && uploadingKind === "progress" ? "Uploading…" : "📷 Upload Progress Photo"}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading || hasCompletion}
              onClick={() => openPhotoPicker("completion")}
              type="button"
            >
              {hasCompletion
                ? "✓ Completion Photo Uploaded"
                : loading && uploadingKind === "completion"
                  ? "Uploading…"
                  : "📷 Upload Completion Photo (Required)"}
            </button>
            <button
              className={styles.btnPrimary}
              disabled={loading || !completionReady}
              onClick={() => act("progress", { subStage: "completed" })}
              type="button"
              title={
                completionReady
                  ? "Send to citizen verification"
                  : "Upload progress + completion photos first"
              }
            >
              ✅ Mark Work Complete → Citizen Verification
            </button>
          </div>
          {!completionReady && (
            <p style={{ fontSize: "0.8rem", color: "#fca5a5", marginTop: "0.75rem" }}>
              {!issue.progressImages.length
                ? "Upload at least one progress photo."
                : !hasCompletion
                  ? "Upload a completion (after-work) photo before closing the project."
                  : null}
            </p>
          )}
        </>
      )}

      {issue.stage === "mp-review" && issue.mpReview && (
        <div>
          <p className={styles.infoBox}>
            Citizen review received:{" "}
            <strong>
              {issue.mpReview.citizenVerdict === "approved"
                ? "👍 Work verified"
                : issue.mpReview.citizenVerdict === "rejected"
                  ? "👎 Work disputed"
                  : "⚖️ Mixed feedback"}
            </strong>
            {" "}({issue.mpReview.yesVotes} yes · {issue.mpReview.noVotes} no).
            Review the issue and take action against the responsible party before closing.
          </p>

          {issue.workAssignment && (
            <p style={{ fontSize: "0.85rem", color: "#9aa5b8", marginBottom: "1rem" }}>
              Contractor: <strong>{issue.workAssignment.contractor}</strong>
              {" · "}
              Officer: <strong>{issue.workAssignment.officer}</strong>
            </p>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`review-note-${issue.id}`}>
              MP review note (optional)
            </label>
            <textarea
              id={`review-note-${issue.id}`}
              className={styles.textarea}
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Record instructions, penalties, or follow-up actions..."
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              className={styles.btnPrimary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "approve-closure", note: reviewNote })}
              type="button"
            >
              ✅ Approve Closure & Publish Impact
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "reopen-contractor", note: reviewNote })}
              type="button"
            >
              👷 Reopen — Hold Contractor Responsible
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "escalate-officer", note: reviewNote })}
              type="button"
            >
              🏢 Escalate Supervising Officer
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "reject-reinspect", note: reviewNote })}
              type="button"
            >
              🔍 Order Quality Re-inspection
            </button>
          </div>
        </div>
      )}

      {issue.stage === "citizen-verification" && (
        <p className={styles.infoBox}>
          Awaiting citizen verification. The submitting citizen must confirm whether the completed
          work is satisfactory. You will be notified when it is ready for MP review.
        </p>
      )}
    </div>
  );
}