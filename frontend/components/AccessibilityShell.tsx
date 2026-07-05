"use client";

import { AccessibilityProvider } from "@/context/AccessibilityContext";
import AccessibilityToolbar from "@/components/AccessibilityToolbar";
import OfflineBanner from "@/components/OfflineBanner";
import SkipLink from "@/components/SkipLink";

export default function AccessibilityShell({ children }: { children: React.ReactNode }) {
  return (
    <AccessibilityProvider>
      <SkipLink />
      <OfflineBanner />
      {children}
      <AccessibilityToolbar />
    </AccessibilityProvider>
  );
}