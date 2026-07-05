"use client";

import { useAccessibility } from "@/context/AccessibilityContext";
import { categoryLabel, stageLabel } from "@/frontend/i18n/labels";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import Link from "next/link";
import ls from "./lifecycle.module.css";

function daysLeft(deadline: string): number {
  if (!deadline) return 0;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function TransparencyCard({
  issue,
  detailHref,
}: {
  issue: DevelopmentIssue;
  detailHref?: string;
}) {
  const { locale, translate: t } = useAccessibility();
  const href = detailHref ?? `/transparency/${issue.id}`;
  const deadline = issue.budget?.deadline;
  const remaining = issue.budget ? issue.budget.total - issue.budget.spent : 0;
  const dateLocale = locale === "hi" ? "hi-IN" : "en-IN";

  return (
    <Link
      href={href}
      className={ls.transparencyCard}
      style={{ display: "block", textDecoration: "none", color: "inherit" }}
    >
      <div className={ls.transparencyHeader}>
        <div>
          <p style={{ fontSize: "0.75rem", color: "#7c8db5" }}>
            #{issue.id} · {categoryLabel(locale, issue.category)}
          </p>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#e8e8f0", margin: "0.3rem 0" }}>
            {issue.title}
          </h3>
        </div>
        <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#a78bfa" }}>{issue.currentProgress}%</span>
      </div>
      <div className={ls.bigProgress}>
        <div className={ls.bigProgressFill} style={{ width: `${issue.currentProgress}%` }} />
      </div>
      {issue.budget && (
        <div className={ls.budgetRow}>
          <div className={ls.budgetItem}>
            <div className={ls.budgetValue}>₹{(issue.budget.total / 100000).toFixed(0)} L</div>
            <div className={ls.budgetLabel}>{t("card.budget")}</div>
          </div>
          <div className={ls.budgetItem}>
            <div className={ls.budgetValue}>₹{(issue.budget.spent / 100000).toFixed(0)} L</div>
            <div className={ls.budgetLabel}>{t("card.spent")}</div>
          </div>
          <div className={ls.budgetItem}>
            <div className={ls.budgetValue}>₹{(remaining / 100000).toFixed(0)} L</div>
            <div className={ls.budgetLabel}>{t("card.remaining")}</div>
          </div>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          marginTop: "0.8rem",
          fontSize: "0.8rem",
          color: "#7c8db5",
        }}
      >
        {deadline && (
          <span>
            {t("card.deadline")}: {new Date(deadline).toLocaleDateString(dateLocale)}
          </span>
        )}
        {deadline && (
          <span>
            {t("card.daysLeft")}: {daysLeft(deadline)}
          </span>
        )}
        {issue.workAssignment && (
          <span>
            {t("card.officer")}: {issue.workAssignment.officer.split(",")[0]}
          </span>
        )}
        <span>{stageLabel(locale, issue.stage)}</span>
      </div>
      {issue.delayAlert?.active && (
        <p style={{ fontSize: "0.78rem", color: "#fca5a5", marginTop: "0.6rem" }}>
          {t("card.delayFlagged")} — {issue.delayAlert.reason}
        </p>
      )}
    </Link>
  );
}