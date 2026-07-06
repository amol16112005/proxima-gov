"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { subStageLabel } from "@/frontend/i18n/labels";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { SUB_STAGE_CONFIG } from "@/data/lifecycleTypes";
import { compressImageFile, PHOTO_ACCEPT_ATTRIBUTE } from "@/frontend/lib/imageUpload";
import { canMarkWorkComplete, hasCompletionPhoto } from "@/lib/lifecycleRules";
import styles from "@/app/shared.module.css";

export default function MpIssueActions({ issue }: { issue: DevelopmentIssue }) {
  const router = useRouter();
  const { locale, translate: t } = useAccessibility();
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
        setError(data.error ?? t("mpActions.actionFailed"));
        return;
      }
      router.refresh();
    } catch {
      setError(t("common.networkError"));
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
          label: isCompletion
            ? t("lifecycle.completion")
            : interpolate(t("lifecycle.week"), { week: String(progressCount + 1) }),
          caption: isCompletion ? t("mpActions.completionCaption") : t("mpActions.progressCaption"),
          isCompletion,
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("mpActions.photoUploadFailed"));
        return;
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("mpActions.photoUploadFailed"));
    } finally {
      setUploadingKind(null);
      setLoading(false);
    }
  };

  return (
    <div className={styles.projectCard} style={{ marginBottom: "1.5rem" }}>
      <h3 className={styles.sectionTitle}>
        {interpolate(t("mpActions.title"), { id: issue.id })}
      </h3>

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
          {t("mpActions.approveProject")}
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
          {t("mpActions.assignContractor")}
        </button>
      )}

      {issue.stage === "work-assigned" && (
        <button className={styles.btnPrimary} disabled={loading} onClick={() => act("tender")} type="button">
          {t("mpActions.releaseTender")}
        </button>
      )}

      {issue.stage === "tender-released" && (
        <button className={styles.btnPrimary} disabled={loading} onClick={() => act("start")} type="button">
          {t("mpActions.startWork")}
        </button>
      )}

      {(issue.stage === "work-started" || issue.stage === "in-progress") && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept={PHOTO_ACCEPT_ATTRIBUTE}
            capture="environment"
            style={{ display: "none" }}
            onChange={onPhotoSelected}
          />
          <p className={styles.infoBox} style={{ marginBottom: "0.5rem" }}>
            {t("mpActions.progressHint")}
          </p>
          <p className={styles.photoSizeLimit} style={{ marginBottom: "0.75rem" }}>
            {t("photo.uploadLimits")}
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
                {subStageLabel(locale, s.key)} ({s.progress}%)
              </button>
            ))}
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => openPhotoPicker("progress")}
              type="button"
            >
              {loading && uploadingKind === "progress" ? t("mpActions.uploading") : t("mpActions.uploadProgress")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading || hasCompletion}
              onClick={() => openPhotoPicker("completion")}
              type="button"
            >
              {hasCompletion
                ? t("mpActions.completionUploaded")
                : loading && uploadingKind === "completion"
                  ? t("mpActions.uploading")
                  : t("mpActions.uploadCompletion")}
            </button>
            <button
              className={styles.btnPrimary}
              disabled={loading || !completionReady}
              onClick={() => act("progress", { subStage: "completed" })}
              type="button"
              title={completionReady ? t("mpActions.sendToVerification") : t("mpActions.uploadPhotosFirst")}
            >
              {t("mpActions.markComplete")}
            </button>
          </div>
          {!completionReady && (
            <p style={{ fontSize: "0.8rem", color: "#fca5a5", marginTop: "0.75rem" }}>
              {!issue.progressImages.length
                ? t("mpActions.needProgressPhoto")
                : !hasCompletion
                  ? t("mpActions.needCompletionPhoto")
                  : null}
            </p>
          )}
        </>
      )}

      {issue.stage === "mp-review" && issue.mpReview && (
        <div>
          <p className={styles.infoBox}>
            {t("mpActions.citizenReview")}{" "}
            <strong>
              {issue.mpReview.citizenVerdict === "approved"
                ? t("mpActions.workVerified")
                : issue.mpReview.citizenVerdict === "rejected"
                  ? t("mpActions.workDisputed")
                  : t("mpActions.mixedFeedback")}
            </strong>{" "}
            (
            {interpolate(t("lifecycle.votes"), {
              yes: String(issue.mpReview.yesVotes),
              no: String(issue.mpReview.noVotes),
            })}
            ). {t("mpActions.reviewBeforeClose")}
          </p>

          {issue.workAssignment && (
            <p style={{ fontSize: "0.85rem", color: "#9aa5b8", marginBottom: "1rem" }}>
              {t("lifecycle.contractor")}: <strong>{issue.workAssignment.contractor}</strong>
              {" · "}
              {t("lifecycle.officer")}: <strong>{issue.workAssignment.officer}</strong>
            </p>
          )}

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`review-note-${issue.id}`}>
              {t("mpActions.reviewNoteLabel")}
            </label>
            <textarea
              id={`review-note-${issue.id}`}
              className={styles.textarea}
              rows={3}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={t("mpActions.reviewNotePlaceholder")}
            />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            <button
              className={styles.btnPrimary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "approve-closure", note: reviewNote })}
              type="button"
            >
              {t("mpActions.approveClosure")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "reopen-contractor", note: reviewNote })}
              type="button"
            >
              {t("mpActions.reopenContractor")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "escalate-officer", note: reviewNote })}
              type="button"
            >
              {t("mpActions.escalateOfficer")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading}
              onClick={() => act("mpReview", { decision: "reject-reinspect", note: reviewNote })}
              type="button"
            >
              {t("mpActions.reinspect")}
            </button>
          </div>
        </div>
      )}

      {issue.stage === "citizen-verification" && (
        <p className={styles.infoBox}>{t("mpActions.awaitingCitizen")}</p>
      )}
    </div>
  );
}