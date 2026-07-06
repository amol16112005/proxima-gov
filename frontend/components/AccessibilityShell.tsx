"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/frontend/i18n";
import { AccessibilityProvider } from "@/context/AccessibilityContext";
import OfflineBanner from "@/components/OfflineBanner";
import SkipLink from "@/components/SkipLink";

const AccessibilityToolbar = dynamic(() => import("@/components/AccessibilityToolbar"), {
  ssr: false,
});

export default function AccessibilityShell({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  return (
    <AccessibilityProvider initialLocale={initialLocale}>
      <SkipLink />
      <OfflineBanner />
      {children}
      <AccessibilityToolbar />
    </AccessibilityProvider>
  );
}