"use client";

import { useState } from "react";
import { LOCALES } from "@/frontend/i18n";
import { useAccessibility } from "@/context/AccessibilityContext";
import a11y from "@/frontend/styles/accessibility.module.css";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const {
    locale,
    setLocale,
    translate,
    largeText,
    highContrast,
    toggleLargeText,
    toggleHighContrast,
    isSpeaking,
    speakPage,
    stopSpeaking,
  } = useAccessibility();

  return (
    <div className={a11y.toolbar} role="region" aria-label={translate("toolbarLabel")}>
      {open && (
        <div className={a11y.panel}>
          <p className={a11y.title}>{translate("toolbarLabel")}</p>
          <div className={a11y.row} role="group" aria-label={translate("language")}>
            {LOCALES.map((loc) => (
              <button
                key={loc.code}
                type="button"
                className={`${a11y.btn} ${locale === loc.code ? a11y.btnActive : ""}`}
                aria-pressed={locale === loc.code}
                onClick={() => setLocale(loc.code)}
              >
                {loc.nativeLabel}
              </button>
            ))}
          </div>
          <div className={a11y.row} style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className={`${a11y.btn} ${largeText ? a11y.btnActive : ""}`}
              aria-pressed={largeText}
              onClick={toggleLargeText}
            >
              {translate("largeText")}
            </button>
            <button
              type="button"
              className={`${a11y.btn} ${highContrast ? a11y.btnActive : ""}`}
              aria-pressed={highContrast}
              onClick={toggleHighContrast}
            >
              {translate("highContrast")}
            </button>
          </div>
          <div className={a11y.row} style={{ marginTop: "0.5rem" }}>
            <button
              type="button"
              className={a11y.btn}
              onClick={isSpeaking ? stopSpeaking : speakPage}
            >
              {isSpeaking ? translate("readAloudStop") : translate("readAloud")}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        className={a11y.toggleFab}
        aria-expanded={open}
        aria-controls="proxima-a11y-panel"
        aria-label={translate("toolbarLabel")}
        onClick={() => setOpen((v) => !v)}
      >
        ♿
      </button>
    </div>
  );
}