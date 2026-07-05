"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { useAccessibility } from "@/context/AccessibilityContext";
import { categoryLabel, stageLabel, subStageLabel } from "@/frontend/i18n/labels";
import {
  STAGE_EMOJI,
  SUB_STAGE_CONFIG,
  type DevelopmentIssue,
  type LifecycleStage,
} from "@/data/lifecycleTypes";
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
  const { locale } = useAccessibility();
  const currentIdx = stageIndex(issue.stage);
  const dateLocale = locale === "hi" ? "hi-IN" : "en-IN";
  const submittedDate = new Date(issue.submittedAt).toLocaleDateString(dateLocale, {
    day: "numeric",
    month: "long",
  });

  return (
    <div className={ls.tracker}>
      {/* Stage 1: Submitted */}
      <section className={ls.panel}>
        <h3 className={ls.panelTitle}>{STAGE_EMOJI.submitted} Stage 1: Issue Submitted</h3>
        <p style={{ fontSize: "0.85rem", color: "#9aa5b8", marginBottom: "0.5rem" }}>
          <strong style={{ color: "#e8e8f0" }}>{issue.title}</strong>
        </p>
        {!publicView && (
          <p style={{ fontSize: "0.82rem", color: "#7c8db5" }}>{issue.description}</p>
        )}
        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap", fontSize: "0.85rem" }}>
          <span>Status: {STAGE_EMOJI.submitted} {stageText(locale, issue.stage === "submitted" ? "submitted" : issue.stage)}</span>
          <span>Date: {submittedDate}</span>
          <span>Issue ID: <strong>#{issue.id}</strong></span>
          <span>{categoryLabel(locale, issue.category)}</span>
          {!publicView && <span>📍 {issue.location}</span>}
        </div>
      </section>

      {/* Stage 2: AI Analysis */}
      {issue.aiAnalysis && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{STAGE_EMOJI["ai-analysis"]} Stage 2: AI Analysis</h3>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div className={ls.scoreRing} style={{ "--score": issue.aiAnalysis.priorityScore } as CSSProperties}>
              <div className={ls.scoreInner}>
                {issue.aiAnalysis.priorityScore}
                <span className={ls.scoreLabel}>/100</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: "200px" }}>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#e8e8f0", marginBottom: "0.5rem" }}>
                Priority Score
              </p>
              <ul className={ls.reasonList}>
                {issue.aiAnalysis.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <p style={{ fontSize: "0.8rem", color: "#7c8db5", marginTop: "0.75rem" }}>
                Est. cost: {formatINR(issue.aiAnalysis.estimatedCost)} · {issue.aiAnalysis.populationAffected}
              </p>
              {issue.aiAnalysis.triageReasons && issue.aiAnalysis.triageReasons.length > 0 && (
                <ul className={ls.reasonList} style={{ marginTop: "0.75rem" }}>
                  {issue.aiAnalysis.triageReasons.map((r) => (
                    <li key={r} style={{ color: issue.stage === "declined" ? "#fca5a5" : "#9aa5b8" }}>
                      Jurisdiction: {r}
                    </li>
                  ))}
                </ul>
              )}
              <p style={{ fontSize: "0.82rem", color: "#a78bfa", marginTop: "0.4rem", fontStyle: "italic" }}>
                {issue.aiAnalysis.recommendation}
              </p>
            </div>
          </div>
        </section>
      )}

      {issue.stage === "declined" && issue.aiAnalysis && (
        <section
          className={ls.panel}
          style={{ borderColor: "rgba(252, 165, 165, 0.35)", background: "rgba(252, 165, 165, 0.06)" }}
        >
          <h3 className={ls.panelTitle}>{STAGE_EMOJI.declined} Automated Response — Not Taken Up by MP</h3>
          <p style={{ fontSize: "0.9rem", color: "#fecaca", lineHeight: 1.6, marginBottom: "0.75rem" }}>
            {issue.aiAnalysis.citizenGuidance}
          </p>
          {issue.aiAnalysis.suggestedAuthority && (
            <p style={{ fontSize: "0.85rem", color: "#9aa5b8" }}>
              Suggested authority: <strong style={{ color: "#e8e8f0" }}>{issue.aiAnalysis.suggestedAuthority}</strong>
            </p>
          )}
          <p style={{ fontSize: "0.8rem", color: "#7c8db5", marginTop: "0.75rem" }}>
            This issue was screened by AI and will not appear on your MP&apos;s dashboard. You can still track it here
            under My Issues.
          </p>
        </section>
      )}

      {/* Stage 3: MP Approval */}
      {issue.approval && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{STAGE_EMOJI.approved} Stage 3: MP Approval</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>Status</p>
              <p style={{ color: "#34d399", fontWeight: 600 }}>🟢 Approved</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>Fund</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>{issue.approval.fund}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>Budget</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>₹{(issue.approval.budget / 100000).toFixed(0)} Lakhs</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>Approval Date</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>{issue.approval.approvalDate}</p>
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>Approved By</p>
              <p style={{ color: "#e8e8f0", fontWeight: 600 }}>{issue.approval.mpName}</p>
            </div>
          </div>
        </section>
      )}

      {/* Stage 4: Work Assigned */}
      {issue.workAssignment && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{STAGE_EMOJI["work-assigned"]} Stage 4: Work Assigned</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", fontSize: "0.88rem" }}>
            <div><span style={{ color: "#7c8db5" }}>Contractor</span><br /><strong>{issue.workAssignment.contractor}</strong></div>
            <div><span style={{ color: "#7c8db5" }}>Officer</span><br /><strong>{issue.workAssignment.officer}</strong></div>
            <div><span style={{ color: "#7c8db5" }}>Est. Completion</span><br /><strong>{issue.workAssignment.estimatedDays} Days</strong></div>
          </div>
        </section>
      )}

      {/* Stage 5: Live Progress */}
      {(issue.stage === "in-progress" || issue.stage === "work-started" || issue.currentProgress > 0 || issue.stage === "citizen-verification" || issue.stage === "mp-review" || issue.stage === "completed" || issue.stage === "impact-analysis") && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{STAGE_EMOJI["in-progress"]} Stage 5: Live Progress Tracking — {issue.currentProgress}%</h3>
          <div className={ls.progressStages}>
            {SUB_STAGE_CONFIG.map((s) => {
              const done = issue.currentProgress >= s.progress;
              const current = issue.progressSubStage === s.key;
              return (
                <div key={s.key} className={ls.progressStage}>
                  <div className={`${ls.progressDot} ${done ? ls.progressDotDone : ""} ${current ? ls.progressDotCurrent : ""}`} />
                  <span className={ls.progressLabel}>{subStageLabel(locale, s.key)}</span>
                  <span className={ls.progressPct}>{s.progress}%</span>
                </div>
              );
            })}
          </div>

          {issue.budget && (
            <div className={ls.budgetRow} style={{ marginTop: "1.2rem" }}>
              <div className={ls.budgetItem}>
                <div className={ls.budgetValue}>₹{(issue.budget.total / 100000).toFixed(0)} L</div>
                <div className={ls.budgetLabel}>Budget</div>
              </div>
              <div className={ls.budgetItem}>
                <div className={ls.budgetValue}>₹{(issue.budget.spent / 100000).toFixed(0)} L</div>
                <div className={ls.budgetLabel}>Spent</div>
              </div>
              <div className={ls.budgetItem}>
                <div className={ls.budgetValue}>₹{((issue.budget.total - issue.budget.spent) / 100000).toFixed(0)} L</div>
                <div className={ls.budgetLabel}>Remaining</div>
              </div>
            </div>
          )}

          {issue.progressImages.length > 0 && (
            <div style={{ marginTop: "1.2rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c4cfe0", marginBottom: "0.75rem" }}>Live Images (Weekly)</p>
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
                        {img.isCompletion ? "Completion" : `Week ${img.week}`}: {img.label}
                      </strong>
                      <span>{img.caption}</span>
                      <div className={ls.gpsBadge}>
                        ✓ GPS {img.gps.lat.toFixed(4)}, {img.gps.lng.toFixed(4)} · AI Verified
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {issue.afterImageLabel && (
            <div style={{ marginTop: "1.2rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "#c4cfe0", marginBottom: "0.75rem" }}>Before vs After</p>
              <div className={ls.beforeAfter}>
                <div className={ls.compareCard}>
                  <div className={ls.imagePlaceholder}>📷 Before</div>
                  <p className={ls.compareLabel}>{issue.beforeImageLabel}</p>
                </div>
                <div className={ls.compareCard}>
                  <div className={ls.imagePlaceholder}>📷 After</div>
                  <p className={ls.compareLabel}>{issue.afterImageLabel}</p>
                </div>
              </div>
            </div>
          )}

          {issue.delayAlert?.active && (
            <div className={ls.delayAlert}>
              <p className={ls.delayTitle}>⚠️ AI Delay Detection — Project Delayed</p>
              <p style={{ fontSize: "0.85rem", color: "#fca5a5" }}>Reason: {issue.delayAlert.reason}</p>
              <p style={{ fontSize: "0.82rem", color: "#9aa5b8", marginTop: "0.4rem" }}>
                Expected: {issue.delayAlert.expectedCompletion} · Current: {issue.delayAlert.currentCompletion}% · {issue.delayAlert.recommendation}
              </p>
            </div>
          )}
        </section>
      )}

      {/* MP Review & Accountability */}
      {issue.mpReview && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{STAGE_EMOJI["mp-review"]} MP Review & Accountability</h3>
          <p style={{ fontSize: "0.88rem", color: "#9aa5b8", marginBottom: "0.75rem" }}>
            Citizen verdict:{" "}
            <strong style={{ color: issue.mpReview.citizenVerdict === "rejected" ? "#fca5a5" : "#34d399" }}>
              {issue.mpReview.citizenVerdict}
            </strong>
            {" "}({issue.mpReview.yesVotes} yes · {issue.mpReview.noVotes} no)
          </p>
          {issue.mpReview.accountability.length > 0 ? (
            <ul className={ls.reasonList}>
              {issue.mpReview.accountability.map((record, i) => (
                <li key={i}>
                  <strong>{record.party === "contractor" ? "Contractor" : "Officer"}:</strong>{" "}
                  {record.action} — {record.note} ({record.mpName})
                </li>
              ))}
            </ul>
          ) : issue.stage === "mp-review" ? (
            <p style={{ fontSize: "0.85rem", color: "#fcd34d" }}>Awaiting MP decision and accountability action.</p>
          ) : null}
        </section>
      )}

      {/* Timeline */}
      {issue.timeline.length > 0 && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>📅 Timeline</h3>
          <div className={ls.timeline}>
            {issue.timeline.map((ev, i) => (
              <div key={i} className={ls.timelineItem}>
                <p className={ls.timelineDate}>{new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</p>
                <p className={ls.timelineLabel}>{ev.label}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Impact Analysis */}
      {issue.impactAnalysis && (
        <section className={ls.panel}>
          <h3 className={ls.panelTitle}>{STAGE_EMOJI["impact-analysis"]} Stage 7: AI Impact Analysis — {issue.impactAnalysis.period}</h3>
          <div className={ls.impactGrid}>
            {[
              { label: "Complaints", b: issue.impactAnalysis.before.complaints, a: issue.impactAnalysis.after.complaints },
              { label: "Travel Time", b: `${issue.impactAnalysis.before.travelTimeMin} min`, a: `${issue.impactAnalysis.after.travelTimeMin} min` },
              { label: "School Attendance", b: `${issue.impactAnalysis.before.schoolAttendance}%`, a: `${issue.impactAnalysis.after.schoolAttendance}%` },
              { label: "Ambulance Delay", b: `${issue.impactAnalysis.before.ambulanceDelayMin} min`, a: `${issue.impactAnalysis.after.ambulanceDelayMin} min` },
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

      {/* Stage progress chips */}
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