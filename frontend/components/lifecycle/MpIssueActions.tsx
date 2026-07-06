"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { subStageLabel } from "@/frontend/i18n/labels";
import { formatINR } from "@/data/constituencies";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { SUB_STAGE_CONFIG } from "@/data/lifecycleTypes";
import { compressImageFile, PHOTO_ACCEPT_ATTRIBUTE } from "@/frontend/lib/imageUpload";
import MpProgressPhotoManager from "@/components/mp/MpProgressPhotoManager";
import {
  canAdvanceToSubStage,
  canMarkWorkComplete,
  canUploadCompletionPhoto,
  canUploadPlanningPhoto,
  canUploadQualityInspectionPhoto,
  hasCompletionPhoto,
  hasPlanningPhoto,
  hasQualityInspectionPhoto,
} from "@/lib/lifecycleRules";
import styles from "@/app/shared.module.css";

type PhotoUploadKind = "planning" | "quality-inspection" | "completion";

export default function MpIssueActions({ issue }: { issue: DevelopmentIssue }) {
  const router = useRouter();
  const { locale, translate: t } = useAccessibility();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<PhotoUploadKind | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [uploadingKind, setUploadingKind] = useState<PhotoUploadKind | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [approvalFund, setApprovalFund] = useState("MPLADS");
  const [approvalBudget, setApprovalBudget] = useState("");

  const aiSuggestedBudget = issue.aiAnalysis?.estimatedCost ?? 0;

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
  const planningReady = canUploadPlanningPhoto(issue);
  const qualityReady = canUploadQualityInspectionPhoto(issue);
  const completionPhotoReady = canUploadCompletionPhoto(issue);
  const hasPlanning = hasPlanningPhoto(issue);
  const hasQuality = hasQualityInspectionPhoto(issue);
  const hasCompletion = hasCompletionPhoto(issue);

  const openPhotoPicker = (kind: PhotoUploadKind) => {
    setError(null);
    pendingUploadRef.current = kind;
    fileInputRef.current?.click();
  };

  const removePhoto = async (imageIndex: number) => {
    if (!window.confirm(t("mpActions.removePhotoConfirm"))) return;

    setError(null);
    setLoading(true);
    setRemovingIndex(imageIndex);
    try {
      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "removeImage", imageIndex }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("mpActions.photoRemoveFailed"));
        return;
      }
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setRemovingIndex(null);
      setLoading(false);
    }
  };

  const onPhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const kind = pendingUploadRef.current;
    pendingUploadRef.current = null;

    if (!file || !kind) return;

    setError(null);
    setLoading(true);
    setUploadingKind(kind);
    try {
      const imageUrl = await compressImageFile(file);
      const isCompletion = kind === "completion";

      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addImage",
          label: isCompletion
            ? t("lifecycle.completion")
            : kind === "planning"
              ? t("mpActions.planningPhotoLabel")
              : t("mpActions.qualityPhotoLabel"),
          caption: isCompletion
            ? t("mpActions.completionCaption")
            : kind === "planning"
              ? t("mpActions.planningPhotoCaption")
              : t("mpActions.qualityPhotoCaption"),
          isCompletion,
          milestone: isCompletion ? undefined : kind,
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
        <div className={styles.approvalForm}>
          <p className={styles.photoHint}>{t("mpActions.approvalHint")}</p>
          {aiSuggestedBudget > 0 && (
            <p className={styles.aiBudgetSuggestion}>
              {t("mpActions.aiBudgetSuggestion")}: <strong>{formatINR(aiSuggestedBudget)}</strong>
              <span className={styles.aiBudgetAdvisory}> ({t("mpActions.aiBudgetAdvisory")})</span>
            </p>
          )}
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`approval-fund-${issue.id}`}>
              {t("mpActions.fundSource")}<span className={styles.required}>*</span>
            </label>
            <select
              id={`approval-fund-${issue.id}`}
              className={styles.select}
              value={approvalFund}
              onChange={(e) => setApprovalFund(e.target.value)}
            >
              <option value="MPLADS">MPLADS</option>
              <option value="Samagra Shiksha">Samagra Shiksha</option>
              <option value="Jal Jeevan Mission">Jal Jeevan Mission</option>
              <option value="State Development Fund">State Development Fund</option>
              <option value="Other">Other / Local Scheme</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor={`approval-budget-${issue.id}`}>
              {t("mpActions.approvedBudget")}<span className={styles.required}>*</span>
            </label>
            <input
              id={`approval-budget-${issue.id}`}
              className={styles.input}
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={approvalBudget}
              onChange={(e) => setApprovalBudget(e.target.value)}
              placeholder={t("mpActions.approvedBudgetPlaceholder")}
              required
            />
            {aiSuggestedBudget > 0 && (
              <button
                type="button"
                className={styles.btnSecondary}
                style={{ alignSelf: "flex-start", marginTop: "0.35rem" }}
                onClick={() => setApprovalBudget(String(aiSuggestedBudget))}
                disabled={loading}
              >
                {t("mpActions.useAiBudgetSuggestion")}
              </button>
            )}
          </div>
          <button
            className={styles.btnPrimary}
            disabled={loading || !approvalBudget.trim()}
            onClick={() => {
              const budget = Number(approvalBudget);
              if (!Number.isFinite(budget) || budget <= 0) {
                setError(t("mpActions.budgetRequired"));
                return;
              }
              act("approve", { fund: approvalFund, budget });
            }}
            type="button"
          >
            {t("mpActions.approveProject")}
          </button>
        </div>
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
          <div className={styles.photoInstructions} role="note" style={{ marginBottom: "0.75rem" }}>
            <p className={styles.photoHint}>{t("mpActions.progressHint")}</p>
            <p className={styles.photoSizeLimit}>{t("photo.uploadLimits")}</p>
            <p className={styles.photoSizeLimit}>{t("photo.dimensionLimits")}</p>
          </div>
          <ol className={styles.photoMilestoneList}>
            <li className={hasPlanning ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasPlanning ? "✓ " : "1. "}
              {t("mpActions.milestonePlanning")}
            </li>
            <li className={hasQuality ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasQuality ? "✓ " : "2. "}
              {t("mpActions.milestoneQuality")}
            </li>
            <li className={hasCompletion ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasCompletion ? "✓ " : "3. "}
              {t("mpActions.milestoneCompletion")}
            </li>
          </ol>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {SUB_STAGE_CONFIG.filter((s) => s.key !== "completed").map((s) => (
              <button
                key={s.key}
                className={styles.btnSecondary}
                disabled={loading || !canAdvanceToSubStage(issue, s.key)}
                onClick={() => act("progress", { subStage: s.key })}
                type="button"
                title={
                  !canAdvanceToSubStage(issue, s.key)
                    ? t("mpActions.needPlanningPhotoFirst")
                    : undefined
                }
              >
                {subStageLabel(locale, s.key)} ({s.progress}%)
              </button>
            ))}
            <button
              className={styles.btnSecondary}
              disabled={loading || !planningReady}
              onClick={() => openPhotoPicker("planning")}
              type="button"
            >
              {hasPlanning
                ? t("mpActions.planningPhotoUploaded")
                : loading && uploadingKind === "planning"
                  ? t("mpActions.uploading")
                  : t("mpActions.uploadPlanningPhoto")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading || !qualityReady}
              onClick={() => openPhotoPicker("quality-inspection")}
              type="button"
              title={!hasPlanning ? t("mpActions.needPlanningPhotoFirst") : undefined}
            >
              {hasQuality
                ? t("mpActions.qualityPhotoUploaded")
                : loading && uploadingKind === "quality-inspection"
                  ? t("mpActions.uploading")
                  : t("mpActions.uploadQualityPhoto")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={loading || !completionPhotoReady}
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
              {!hasPlanning
                ? t("mpActions.needPlanningPhoto")
                : !hasQuality
                  ? t("mpActions.needQualityPhoto")
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

      <MpProgressPhotoManager
        issue={issue}
        loading={loading}
        removingIndex={removingIndex}
        onRemove={removePhoto}
      />
    </div>
  );
}