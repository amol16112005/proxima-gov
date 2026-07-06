"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { formatINR } from "@/data/constituencies";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import { compressImageFile, PHOTO_ACCEPT_ATTRIBUTE } from "@/frontend/lib/imageUpload";
import MpProgressPhotoManager from "@/components/mp/MpProgressPhotoManager";
import {
  canConfirmInspection,
  canConfirmWorkInProgress,
  canMarkWorkComplete,
  canUploadAfterWorkPhoto,
  canUploadBeforeWorkPhoto,
  hasAfterWorkPhoto,
  hasBeforeWorkPhoto,
  hasInspectionConfirmed,
  hasWorkInProgressConfirmed,
} from "@/lib/lifecycleRules";
import styles from "@/app/shared.module.css";

type PhotoUploadKind = "before-work" | "after-work";

export default function MpIssueActions({
  issue,
  onIssueUpdated,
}: {
  issue: DevelopmentIssue;
  onIssueUpdated?: (issue: DevelopmentIssue) => void;
}) {
  const router = useRouter();
  const { translate: t } = useAccessibility();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingUploadRef = useRef<PhotoUploadKind | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [uploadingKind, setUploadingKind] = useState<PhotoUploadKind | null>(null);
  const [removingIndex, setRemovingIndex] = useState<number | null>(null);
  const [approvalFund, setApprovalFund] = useState("MPLADS");
  const [approvalBudget, setApprovalBudget] = useState("");

  const aiSuggestedBudget = issue.aiAnalysis?.estimatedCost ?? 0;

  const act = async (action: string, extra?: Record<string, unknown>) => {
    setError(null);
    setActionLoading(true);
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
      if (data.issue) onIssueUpdated?.(data.issue as DevelopmentIssue);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setActionLoading(false);
    }
  };

  const busy = actionLoading || photoLoading;
  const completionReady = canMarkWorkComplete(issue);
  const beforeWorkReady = canUploadBeforeWorkPhoto(issue);
  const afterWorkReady = canUploadAfterWorkPhoto(issue);
  const workInProgressReady = canConfirmWorkInProgress(issue);
  const inspectionReady = canConfirmInspection(issue);
  const hasBefore = hasBeforeWorkPhoto(issue);
  const hasAfter = hasAfterWorkPhoto(issue);
  const hasWip = hasWorkInProgressConfirmed(issue);
  const hasInspection = hasInspectionConfirmed(issue);

  const openPhotoPicker = (kind: PhotoUploadKind) => {
    setError(null);
    pendingUploadRef.current = kind;
    const input = fileInputRef.current;
    if (!input) {
      setError(t("mpActions.photoPickerUnavailable"));
      return;
    }
    input.value = "";
    input.click();
  };

  const removePhoto = async (imageIndex: number) => {
    if (!window.confirm(t("mpActions.removePhotoConfirm"))) return;

    setError(null);
    setPhotoLoading(true);
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
      if (data.issue) onIssueUpdated?.(data.issue as DevelopmentIssue);
      router.refresh();
    } catch {
      setError(t("common.networkError"));
    } finally {
      setRemovingIndex(null);
      setPhotoLoading(false);
    }
  };

  const onPhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const kind = pendingUploadRef.current;
    pendingUploadRef.current = null;

    if (!file || !kind) return;

    setError(null);
    setPhotoLoading(true);
    setUploadingKind(kind);
    try {
      const imageUrl = await compressImageFile(file);
      const isAfterWork = kind === "after-work";

      const res = await fetch(`/api/issues/${issue.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addImage",
          label: isAfterWork ? t("mpActions.afterWorkPhotoLabel") : t("mpActions.beforeWorkPhotoLabel"),
          caption: isAfterWork ? t("mpActions.afterWorkPhotoCaption") : t("mpActions.beforeWorkPhotoCaption"),
          isCompletion: isAfterWork,
          milestone: isAfterWork ? undefined : "planning",
          imageUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("mpActions.photoUploadFailed"));
        return;
      }
      if (data.issue) onIssueUpdated?.(data.issue as DevelopmentIssue);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("mpActions.photoUploadFailed"));
    } finally {
      setUploadingKind(null);
      setPhotoLoading(false);
    }
  };

  return (
    <div className={styles.projectCard} style={{ marginBottom: "1.5rem" }}>
      <input
        ref={fileInputRef}
        id={`mp-progress-photo-${issue.id}`}
        type="file"
        accept={PHOTO_ACCEPT_ATTRIBUTE}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={onPhotoSelected}
      />
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
                disabled={busy}
              >
                {t("mpActions.useAiBudgetSuggestion")}
              </button>
            )}
          </div>
          <button
            className={styles.btnPrimary}
            disabled={busy || !approvalBudget.trim()}
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
          disabled={busy}
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
        <button className={styles.btnPrimary} disabled={busy} onClick={() => act("tender")} type="button">
          {t("mpActions.releaseTender")}
        </button>
      )}

      {issue.stage === "tender-released" && (
        <button className={styles.btnPrimary} disabled={busy} onClick={() => act("start")} type="button">
          {t("mpActions.startWork")}
        </button>
      )}

      {(issue.stage === "work-started" || issue.stage === "in-progress") && (
        <>
          <div className={styles.photoInstructions} role="note" style={{ marginBottom: "0.75rem" }}>
            <p className={styles.photoHint}>{t("mpActions.simpleWorkHint")}</p>
            <p className={styles.photoSizeLimit}>{t("photo.uploadLimits")}</p>
            <p className={styles.photoSizeLimit}>{t("photo.dimensionLimits")}</p>
          </div>
          <ol className={styles.photoMilestoneList}>
            <li className={hasBefore ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasBefore ? "✓ " : "1. "}
              {t("mpActions.milestoneBeforeWork")}
            </li>
            <li className={hasWip ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasWip ? "✓ " : "2. "}
              {t("mpActions.milestoneWorkInProgress")}
            </li>
            <li className={hasInspection ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasInspection ? "✓ " : "3. "}
              {t("mpActions.milestoneInspection")}
            </li>
            <li className={hasAfter ? styles.photoMilestoneDone : styles.photoMilestonePending}>
              {hasAfter ? "✓ " : "4. "}
              {t("mpActions.milestoneAfterWork")}
            </li>
          </ol>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              className={styles.btnSecondary}
              disabled={photoLoading || !beforeWorkReady}
              onClick={() => openPhotoPicker("before-work")}
              type="button"
            >
              {hasBefore
                ? t("mpActions.beforeWorkPhotoUploaded")
                : photoLoading && uploadingKind === "before-work"
                  ? t("mpActions.uploading")
                  : t("mpActions.uploadBeforeWorkPhoto")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={busy || !workInProgressReady}
              onClick={() => act("progress", { subStage: "construction" })}
              type="button"
              title={!hasBefore ? t("mpActions.needBeforeWorkPhoto") : undefined}
            >
              {hasWip ? t("mpActions.workInProgressConfirmed") : t("mpActions.confirmWorkInProgress")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={busy || !inspectionReady}
              onClick={() => act("progress", { subStage: "quality-inspection" })}
              type="button"
              title={!hasWip ? t("mpActions.needWorkInProgressFirst") : undefined}
            >
              {hasInspection ? t("mpActions.inspectionConfirmed") : t("mpActions.confirmInspection")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={photoLoading || !afterWorkReady}
              onClick={() => openPhotoPicker("after-work")}
              type="button"
              title={!hasInspection ? t("mpActions.needInspectionFirst") : undefined}
            >
              {hasAfter
                ? t("mpActions.afterWorkPhotoUploaded")
                : photoLoading && uploadingKind === "after-work"
                  ? t("mpActions.uploading")
                  : t("mpActions.uploadAfterWorkPhoto")}
            </button>
            <button
              className={styles.btnPrimary}
              disabled={busy || !completionReady}
              onClick={() => act("progress", { subStage: "completed" })}
              type="button"
              title={completionReady ? t("mpActions.sendToVerification") : t("mpActions.uploadBothPhotosFirst")}
            >
              {t("mpActions.markComplete")}
            </button>
          </div>
          {!completionReady && (
            <p style={{ fontSize: "0.8rem", color: "#fca5a5", marginTop: "0.75rem" }}>
              {!hasBefore
                ? t("mpActions.needBeforeWorkPhoto")
                : !hasWip
                  ? t("mpActions.needWorkInProgressFirst")
                  : !hasInspection
                    ? t("mpActions.needInspectionFirst")
                    : !hasAfter
                      ? t("mpActions.needAfterWorkPhoto")
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
              disabled={busy}
              onClick={() => act("mpReview", { decision: "approve-closure", note: reviewNote })}
              type="button"
            >
              {t("mpActions.approveClosure")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={busy}
              onClick={() => act("mpReview", { decision: "reopen-contractor", note: reviewNote })}
              type="button"
            >
              {t("mpActions.reopenContractor")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={busy}
              onClick={() => act("mpReview", { decision: "escalate-officer", note: reviewNote })}
              type="button"
            >
              {t("mpActions.escalateOfficer")}
            </button>
            <button
              className={styles.btnSecondary}
              disabled={busy}
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
        loading={photoLoading}
        removingIndex={removingIndex}
        onRemove={removePhoto}
      />
    </div>
  );
}