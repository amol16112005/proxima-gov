"use client";

import Link from "next/link";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import { stageLabel } from "@/frontend/i18n/labels";
import { STAGE_EMOJI, type LifecycleStage } from "@/data/lifecycleTypes";
import styles from "@/app/shared.module.css";

export default function CitizenIssueHeader({
  issueId,
  title,
  stage,
  currentProgress,
}: {
  issueId: string;
  title: string;
  stage: LifecycleStage;
  currentProgress: number;
}) {
  const { locale, translate: t } = useAccessibility();

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <Link href="/citizen/issues" className={styles.linkMuted}>
        {t("issuesNew.backIssues")}
      </Link>
      <h2 className={styles.sectionTitle} style={{ marginTop: "0.5rem" }}>
        {STAGE_EMOJI[stage]} #{issueId} — {title}
      </h2>
      <p className={styles.subtitle}>
        {t("issues.currentStage")} <strong>{stageLabel(locale, stage)}</strong>
        {currentProgress > 0 && interpolate(t("issues.percentComplete"), { progress: String(currentProgress) })}
      </p>
    </div>
  );
}