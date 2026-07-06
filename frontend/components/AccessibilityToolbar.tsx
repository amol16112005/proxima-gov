"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES } from "@/frontend/i18n";
import { useAccessibility } from "@/context/AccessibilityContext";
import { A11yIcon } from "@/components/icons/ProximaIcons";
import a11y from "@/frontend/styles/accessibility.module.css";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      });
    } else if (wasOpenRef.current) {
      fabRef.current?.focus();
    }
    wasOpenRef.current = open;
  }, [open]);

  return (
    <div
      ref={toolbarRef}
      className={a11y.toolbar}
      role="region"
      aria-label={translate("toolbarLabel")}
    >
      <div
        id="proxima-a11y-panel"
        ref={panelRef}
        className={a11y.panel}
        hidden={!open}
      >
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
        <div className={`${a11y.row} ${a11y.panelRow}`}>
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
        <div className={`${a11y.row} ${a11y.panelRow}`}>
          <button
            type="button"
            className={`${a11y.btn} ${isSpeaking ? a11y.btnActive : ""}`}
            aria-pressed={isSpeaking}
            aria-label={isSpeaking ? translate("readAloudStop") : translate("readAloud")}
            onClick={isSpeaking ? stopSpeaking : speakPage}
          >
            {isSpeaking ? translate("readAloudStop") : translate("readAloud")}
          </button>
        </div>
      </div>
      <button
        ref={fabRef}
        type="button"
        className={a11y.toggleFab}
        aria-expanded={open}
        aria-controls="proxima-a11y-panel"
        aria-label={translate("toolbarLabel")}
        onClick={() => setOpen((v) => !v)}
      >
        <A11yIcon size={24} />
      </button>
    </div>
  );
}