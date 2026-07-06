"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { categoryLabel, stageLabel, subStageLabel } from "@/frontend/i18n/labels";
import {
  STAGE_EMOJI,
  SUB_STAGE_CONFIG,
  type DevelopmentIssue,
  type LifecycleStage,
} from "@/data/lifecycleTypes";
import {
  hasInspectionConfirmed,
  hasWorkInProgressConfirmed,
} from "@/lib/lifecycleRules";
import { formatINR } from "@/data/constituencies";
import ls from "./lifecycle.module.css";

const MAIN_STAGES = [
  "submitted",
  "ai-analysis",
  "approved",
  "work-assigned",
  "in-progress",
  "citizen-verification",
  "mp-review",
  "impact-analysis",
] as const;

function stageIndex(stage: string): number {
  const map: Record<string, number> = {
    submitted: 0,
    "ai-analysis": 1,
    "mp-approval": 1,
    approved: 2,
    "work-assigned": 3,
    "tender-released": 3,
    "work-started": 4,
    "in-progress": 4,
    "citizen-verification": 5,
    "mp-review": 6,
    completed: 7,
    "impact-analysis": 7,
  };
  return map[stage] ?? 0;
}

function stageText(locale: "en" | "hi", stage: LifecycleStage): string {
  return stageLabel(locale, stage);
}

export default function LifecycleTracker({
  issue,
  publicView = false,
}: {
  issue: DevelopmentIssue;
  publicView?: boolean;
}) {
  const { locale, translate: t } = useAccessibility();
  const currentIdx = stageIndex(issue.stage);
  const dateLocale = locale === "hi" ? "hi-IN" : "en-IN";
  const submittedDate = new Date(issue.submittedAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
  });

  return (
    <div className={ls.tracker}>
      <section className={ls.panel}>
        <h3 className={ls.panelTitle}>
          {STAGE_EMOJI.submitted} {t("lifecycle.stage1Title")}
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#9aa5b8", marginBottom: "0.5rem" }}>
          <strong style={{ color: "#e8e8f0" }}>{issue.title}</strong>
        </p>
        {!publicView && (
          <p style={{ fontSize: "0.82rem", color: "#7c8db5" }}>{issue.description}</p>
        )}
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span>
            {t("lifecycle.status")}: {STAGE_EMOJI.submitted}{" "}
            {stageText(locale, issue.stage === "submitted" ? "submitted" : issue.stage)}
          </span>
          <span>
            {t("lifecycle.date")}: {submittedDate}
          </span>
          <span>
            {t("lifecycle.issueId")}: <strong>#{issue.id}</strong>
          </span>
          <span>{categoryLabel(locale, issue.category)}</span>
          {!publicView && <span>📍 {issue.location}</span>}
        </div>
        {issue.submissionPhotoUrl && (
          <div style={{ marginTop: "1.2rem" }}>
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c4cfe0", marginBottom: "0.75rem" }}>
              {t("lifecycle.submissionPhoto")}
            </p>
            <div className={ls.imageCard} style={{ maxWidth: "360px" }}>
              <Image
                src={issue.submissionPhotoUrl}
                alt={t("lifecycle.submissionPhotoCaption")}
                width={360}
                height={220}
                className={ls.imagePreview}
                unoptimized
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 360px"
              />
              <div className={ls.imageMeta}>
                <strong>{t("lifecycle.submissionPhoto")}</strong>
                <span>{t("lifecycle.submissionPhotoCaption")}</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {issue.aiAnalysis && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI["ai-analysis"]} {t("lifecycle.stage2Title")}
          </h3>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div className={ls.scoreRing} style={{ "--score": issue.aiAnalysis.priorityScore } as CSSProperties}>
              <div className={ls.scoreInner}>
                {issue.aiAnalysis.priorityScore}
                <span className={ls.scoreLabel}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e8e8f0", marginBottom: "0.5rem" }}>
                {t("lifecycle.priorityScore")}
              </p>
              <ul className={ls.reasonList}>
                {issue.aiAnalysis.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p style={{ fontSize: "0.8rem", color: "#7c8db5", marginTop: "0.75rem" }}>
                {t("lifecycle.estCost")}: {formatINR(issue.aiAnalysis.estimatedCost)} ·{" "}
                {issue.aiAnalysis.populationAffected}
              </p>
              {issue.aiAnalysis.triageReasons && issue.aiAnalysis.triageReasons.length > 0 && (
                <ul className={ls.reasonList} style={{ marginTop: "0.75rem" }}>
                  {issue.aiAnalysis.triageReasons.map((r) => (
                    <li key={r} style={{ color: issue.stage === "declined" ? "#fca5a5" : "#9aa5b8" }}>
                      {t("lifecycle.jurisdiction")}: {r}
                    </li>
                  ))}
                </ul>
              )}
              <p style={{ fontSize: "0.82rem", color: "#a78bfa", marginTop: "0.4rem", fontStyle: "italic" }}>
                {issue.aiAnalysis.recommendation}
              </p>
              {issue.approval && (
                <p style={{ fontSize: "0.82rem", color: "#86efac", marginTop: "0.5rem" }}>
                  {t("mpActions.mpApprovedBudget")}: {formatINR(issue.approval.budget)} · {issue.approval.fund}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {issue.stage === "declined" && issue.aiAnalysis && (
        <section
          className={ls.panel}
          style={{ borderColor: "rgba(252, 165, 165, 0.35)", background: "rgba(252, 165, 165, 0.06)" }}
        >
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI.declined} {t("lifecycle.declinedTitle")}
          </h3>
          <p style={{ fontSize: "0.9rem", color: "#fecaca", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            {issue.aiAnalysis.citizenGuidance}
          </p>
          {issue.aiAnalysis.suggestedAuthority && (
            <p style={{ fontSize: "0.85rem", color: "#9aa5b8" }}>
              {t("lifecycle.suggestedAuthority")}:{" "}
              <strong style={{ color: "#e8e8f0" }}>{issue.aiAnalysis.suggestedAuthority}</strong>
            </p>
          )}
          <p style={{ fontSize: "0.8rem", color: "#7c8db5", marginTop: "0.75rem" }}>
            {t("lifecycle.declinedNote")}
          </p>
        </section>
      )}

      {issue.approval && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI.approved} {t("lifecycle.stage3Title")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>{t("lifecycle.status")}</p>
              <p style={{ color: "#34d399", fontWeight: 600 }}>{t("lifecycle.approved")}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>{t("lifecycle.fund")}</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>{issue.approval.fund}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>{t("card.budget")}</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>
                ₹{(issue.approval.budget / 100000).toFixed(0)} {t("lifecycle.lakhs")}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>{t("lifecycle.approvalDate")}</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>{issue.approval.approvalDate}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>{t("lifecycle.approvedBy")}</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>{issue.approval.mpName}</p>
            </div>
          </div>
        </section>
      )}

      {issue.workAssignment && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI["work-assigned"]} {t("lifecycle.stage4Title")}
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", fontSize: "0.88rem" }}>
            <div>
              <span style={{ color: "#7c8db5" }}>{t("lifecycle.contractor")}</span>
              <br />
              <strong>{issue.workAssignment.contractor}</strong>
            </div>
            <div>
              <span style={{ color: "#7c8db5" }}>{t("lifecycle.officer")}</span>
              <br />
              <strong>{issue.workAssignment.officer}</strong>
            </div>
            <div>
              <span style={{ color: "#7c8db5" }}>{t("lifecycle.estCompletion")}</span>
              <br />
              <strong>
                {issue.workAssignment.estimatedDays} {t("lifecycle.days")}
              </strong>
            </div>
          </div>
        </section>
      )}

      {(issue.stage === "in-progress" ||
        issue.stage === "work-started" ||
        issue.stage === "citizen-verification" ||
        issue.stage === "mp-review" ||
        issue.stage === "completed" ||
        issue.stage === "impact-analysis") && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI["in-progress"]}{" "}
            {issue.stage === "work-started" || issue.stage === "in-progress"
              ? t("lifecycle.simpleWorkTitle")
              : interpolate(t("lifecycle.stage5Title"), { progress: String(issue.currentProgress) })}
          </h3>
          {issue.stage !== "work-started" && issue.stage !== "in-progress" && (
            <div className={ls.progressStages}>
              {SUB_STAGE_CONFIG.map((s) => {
                const done = issue.currentProgress >= s.progress;
                const current = issue.progressSubStage === s.key;
                return (
                  <div key={s.key} className={ls.progressStage}>
                    <div
                      className={`${ls.progressDot} ${done ? ls.progressDotDone : ""} ${current ? ls.progressDotCurrent : ""}`}
                    />
                    <span className={ls.progressLabel}>{subStageLabel(locale, s.key)}</span>
                    <span className={ls.progressPct}>{s.progress}%</span>
                  </div>
                );
              })}
            </div>
          )}
          {(issue.stage === "work-started" || issue.stage === "in-progress") && (
            <>
              <p style={{ fontSize: "0.88rem", color: "#9aa5b8", marginBottom: "0.5rem" }}>
                {t("lifecycle.simpleWorkNote")}
              </p>
              <ol className={ls.processStepList}>
                <li className={hasWorkInProgressConfirmed(issue) ? ls.processStepDone : ls.processStepPending}>
                  {hasWorkInProgressConfirmed(issue) ? "✓ " : ""}
                  {t("lifecycle.processWorkInProgress")}
                </li>
                <li className={hasInspectionConfirmed(issue) ? ls.processStepDone : ls.processStepPending}>
                  {hasInspectionConfirmed(issue) ? "✓ " : ""}
                  {t("lifecycle.processInspection")}
                </li>
              </ol>
            </>
          )}

          {issue.budget && (
            <div className={ls.budgetRow} style={{ marginTop: "1.2rem" }}>
              <div className={ls.budgetItem}>
                <div className={ls.budgetValue}>₹{(issue.budget.total / 100000).toFixed(0)} L</div>
                <div className={ls.budgetLabel}>{t("card.budget")}</div>
              </div>
              <div className={ls.budgetItem}>
                <div className={ls.budgetValue}>₹{(issue.budget.spent / 100000).toFixed(0)} L</div>
                <div className={ls.budgetLabel}>{t("card.spent")}</div>
              </div>
              <div className={ls.budgetItem}>
                <div className={ls.budgetValue}>
                  ₹{((issue.budget.total - issue.budget.spent) / 100000).toFixed(0)} L
                </div>
                <div className={ls.budgetLabel}>{t("card.remaining")}</div>
              </div>
            </div>
          )}

          {issue.progressImages.length > 0 && (
            <div style={{ marginTop: "1.2rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c4cfe0", marginBottom: "0.75rem" }}>
                {t("lifecycle.liveImages")}
              </p>
              <div className={ls.imageGrid}>
                {issue.progressImages.map((img, index) => (
                  <div key={`${img.week}-${img.label}-${index}`} className={ls.imageCard}>
                    {img.imageUrl ? (
                      <Image
                        src={img.imageUrl}
                        alt={img.caption}
                        width={320}
                        height={200}
                        className={ls.imagePreview}
                        unoptimized
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    ) : (
                      <div className={ls.imagePlaceholder}>📷</div>
                    )}
                    <div className={ls.imageMeta}>
                      <strong>
                        {img.isCompletion
                          ? t("lifecycle.afterWork")
                          : img.milestone === "planning"
                            ? t("lifecycle.beforeWork")
                            : interpolate(t("lifecycle.week"), { week: String(img.week) })}
                        : {img.label}
                      </strong>
                      <span>{img.caption}</span>
                      <div className={ls.gpsBadge}>
                        {interpolate(t("lifecycle.gpsVerified"), {
                          lat: img.gps.lat.toFixed(4),
                          lng: img.gps.lng.toFixed(4),
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.afterImageLabel && (
            <div style={{ marginTop: "1.2rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c4cfe0", marginBottom: "0.75rem" }}>
                {t("lifecycle.beforeVsAfter")}
              </p>
              <div className={ls.beforeAfter}>
                <div className={ls.compareCard}>
                  {issue.submissionPhotoUrl ? (
                    <Image
                      src={issue.submissionPhotoUrl}
                      alt={issue.beforeImageLabel}
                      width={280}
                      height={180}
                      className={ls.imagePreview}
                      unoptimized
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 280px"
                    />
                  ) : (
                    <div className={ls.imagePlaceholder}>📷 {t("lifecycle.before")}</div>
                  )}
                  <p className={ls.compareLabel}>{issue.beforeImageLabel}</p>
                </div>
                <div className={ls.compareCard}>
                  <div className={ls.imagePlaceholder}>📷 {t("lifecycle.after")}</div>
                  <p className={ls.compareLabel}>{issue.afterImageLabel}</p>
                </div>
              </div>
            </div>
          )}

          {issue.delayAlert?.active && (
            <div className={ls.delayAlert}>
              <p className={ls.delayTitle}>{t("lifecycle.delayTitle")}</p>
              <p style={{ fontSize: "0.85rem", color: "#fca5a5" }}>
                {t("lifecycle.delayReason")}: {issue.delayAlert.reason}
              </p>
              <p style={{ fontSize: "0.82rem", color: "#9aa5b8", marginTop: "0.4rem" }}>
                {t("lifecycle.delayExpected")}: {issue.delayAlert.expectedCompletion} · {t("lifecycle.delayCurrent")}:{" "}
                {issue.delayAlert.currentCompletion}% · {issue.delayAlert.recommendation}
              </p>
            </div>
          )}
        </section>
      )}

      {issue.mpReview && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI["mp-review"]} {t("lifecycle.mpReviewTitle")}
          </h3>
          <p style={{ fontSize: "0.88rem", color: "#9aa5b8", marginBottom: "0.75rem" }}>
            {t("lifecycle.citizenVerdict")}:{" "}
            <strong style={{ color: issue.mpReview.citizenVerdict === "rejected" ? "#fca5a5" : "#34d399" }}>
              {issue.mpReview.citizenVerdict}
            </strong>{" "}
            (
            {interpolate(t("lifecycle.votes"), {
              yes: String(issue.mpReview.yesVotes),
              no: String(issue.mpReview.noVotes),
            })}
            )
          </p>
          {issue.mpReview.accountability.length > 0 ? (
            <ul className={ls.reasonList}>
              {issue.mpReview.accountability.map((record, i) => (
                <li key={i}>
                  <strong>{record.party === "contractor" ? t("lifecycle.contractor") : t("lifecycle.officer")}:</strong>{" "}
                  {record.action} — {record.note} ({record.mpName})
                </li>
              ))}
            </ul>
          ) : issue.stage === "mp-review" ? (
            <p style={{ fontSize: "0.85rem", color: "#fcd34d" }}>{t("lifecycle.awaitingMpDecision")}</p>
          ) : null}
        </section>
      )}

      {issue.timeline.length > 0 && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{t("lifecycle.timelineTitle")}</h3>
          <div className={ls.timeline}>
            {issue.timeline.map((ev, i) => (
              <div key={i} className={ls.timelineItem}>
                <p className={ls.timelineDate}>
                  {new Date(ev.date).toLocaleDateString(dateLocale, { day: "numeric", month: "long" })}
                </p>
                <p className={ls.timelineLabel}>{ev.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {issue.impactAnalysis && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>
            {STAGE_EMOJI["impact-analysis"]}{" "}
            {interpolate(t("lifecycle.stage7Title"), { period: issue.impactAnalysis.period })}
          </h3>
          <div className={ls.impactGrid}>
            {[
              {
                label: t("lifecycle.complaints"),
                b: issue.impactAnalysis.before.complaints,
                a: issue.impactAnalysis.after.complaints,
              },
              {
                label: t("lifecycle.travelTime"),
                b: `${issue.impactAnalysis.before.travelTimeMin} min`,
                a: `${issue.impactAnalysis.after.travelTimeMin} min`,
              },
              {
                label: t("lifecycle.schoolAttendance"),
                b: `${issue.impactAnalysis.before.schoolAttendance}%`,
                a: `${issue.impactAnalysis.after.schoolAttendance}%`,
              },
              {
                label: t("lifecycle.ambulanceDelay"),
                b: `${issue.impactAnalysis.before.ambulanceDelayMin} min`,
                a: `${issue.impactAnalysis.after.ambulanceDelayMin} min`,
              },
            ].map((m) => (
              <div key={m.label} className={ls.impactCard}>
                <p style={{ fontSize: "0.75rem", color: "#7c8db5", marginBottom: "0.4rem" }}>{m.label}</p>
                <p className={ls.impactBefore}>{m.b}</p>
                <p className={ls.impactArrow}>↓</p>
                <p className={ls.impactAfter}>{m.a}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.88rem", color: "#9aa5b8", marginTop: "1rem", fontStyle: "italic" }}>
            {issue.impactAnalysis.summary}
          </p>
        </section>
      )}

      <div className={ls.stageRow}>
        {MAIN_STAGES.map((s, i) => (
          <span
            key={s}
            className={`${ls.stageChip} ${i < currentIdx ? ls.stageChipDone : ""} ${i === currentIdx ? ls.stageChipActive : ""}`}
          >
            {stageText(locale, s)}
          </span>
        ))}
      </div>
    </div>
  );
}