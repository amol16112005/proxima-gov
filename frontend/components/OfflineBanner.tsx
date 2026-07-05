"use client";

import { useAccessibility } from "@/context/AccessibilityContext";
import a11y from "@/frontend/styles/accessibility.module.css";

export default function OfflineBanner() {
  const { isOnline, translate } = useAccessibility();
  if (isOnline) return null;

  return (
    <div className={a11y.offlineBanner} role="status" aria-live="assertive">
      <strong>{translate("offlineTitle")}</strong>
      <span>{translate("offlineHint")}</span>
    </div>
  );
}