"use client";

import { useAccessibility } from "@/context/AccessibilityContext";

export default function SkipLink() {
  const { translate } = useAccessibility();
  return (
    <a href="#main-content" className="skip-link">
      {translate("skipToContent")}
    </a>
  );
}