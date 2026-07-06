"use client";

import Image from "next/image";
import { useAccessibility } from "@/context/AccessibilityContext";
import { interpolate } from "@/frontend/i18n";
import type { DevelopmentIssue } from "@/data/lifecycleTypes";
import ls from "@/components/lifecycle/lifecycle.module.css";
import styles from "@/app/shared.module.css";

interface MpProgressPhotoManagerProps {
  issue: DevelopmentIssue;
  loading: boolean;
  removingIndex: number | null;
  onRemove: (imageIndex: number) => void;
}

export default function MpProgressPhotoManager({
  issue,
  loading,
  removingIndex,
  onRemove,
}: MpProgressPhotoManagerProps) {
  const { translate: t } = useAccessibility();

  if (issue.progressImages.length === 0) return null;

  return (
    <section style={{ marginTop: "1.25rem" }}>
      <h4 className={styles.sectionTitle} style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
        {t("mpActions.managePhotosTitle")}
      </h4>
      <p className={styles.photoHint} style={{ marginBottom: "0.75rem" }}>
        {t("mpActions.managePhotosHint")}
      </p>
      <div className={ls.imageGrid}>
        {issue.progressImages.map((img, index) => (
          <article key={`${img.week}-${img.label}-${index}`} className={ls.imageCard}>
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
                  ? t("mpActions.afterWorkPhotoLabel")
                  : img.milestone === "planning"
                    ? t("mpActions.beforeWorkPhotoLabel")
                    : img.milestone === "quality-inspection"
                      ? t("mpActions.qualityPhotoLabel")
                      : interpolate(t("lifecycle.week"), { week: String(img.week) })}
                : {img.label}
              </strong>
              <span>{img.caption}</span>
            </div>
            <button
              type="button"
              className={ls.mpPhotoRemoveBtn}
              disabled={loading}
              onClick={() => onRemove(index)}
              aria-busy={removingIndex === index}
            >
              {removingIndex === index ? t("mpActions.removingPhoto") : t("mpActions.removePhoto")}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}