"use client";

import { useAccessibility } from "@/context/AccessibilityContext";

export default function LoadingTracker() {
  const { translate: t } = useAccessibility();
  return <p>{t("common.loadingTracker")}</p>;
}