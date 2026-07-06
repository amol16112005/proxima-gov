"use client";

import Link from "next/link";
import { useAccessibility } from "@/context/AccessibilityContext";
import styles from "@/app/shared.module.css";

export default function MpBackLink() {
  const { translate: t } = useAccessibility();

  return (
    <Link href="/mp/dashboard" className={styles.linkMuted}>
      {t("issues.backMpDashboard")}
    </Link>
  );
}