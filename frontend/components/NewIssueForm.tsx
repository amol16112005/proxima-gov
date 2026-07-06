"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useAccessibility } from "@/context/AccessibilityContext";
import type { MessageKey } from "@/frontend/i18n";
import { mergeTranscript, type SpeechField } from "@/frontend/lib/speechRecognition";
import { useSpeechInput } from "@/frontend/lib/useSpeechInput";
import { MicIcon } from "@/frontend/components/icons/ProximaIcons";
import { compressImageFile, PHOTO_ACCEPT_ATTRIBUTE } from "@/frontend/lib/imageUpload";
import styles from "@/app/shared.module.css";

const CATEGORY_OPTIONS: { value: string; labelKey: MessageKey }[] = [
  { value: "", labelKey: "issuesNew.selectCategory" },
  { value: "infrastructure", labelKey: "cat.infrastructure" },
  { value: "healthcare", labelKey: "cat.healthcare" },
  { value: "education", labelKey: "cat.education" },
  { value: "water-sanitation", labelKey: "cat.water-sanitation" },
  { value: "employment", labelKey: "cat.employment" },
  { value: "safety", labelKey: "cat.safety" },
  { value: "other", labelKey: "cat.other" },
];

const VOICE_LABEL_KEYS: Record<
  SpeechField,
  { idle: MessageKey; listening: MessageKey }
> = {
  title: { idle: "issuesNew.voiceInputTitle", listening: "issuesNew.voiceListeningTitle" },
  location: {
    idle: "issuesNew.voiceInputLocation",
    listening: "issuesNew.voiceListeningLocation",
  },
  description: {
    idle: "issuesNew.voiceInputDescription",
    listening: "issuesNew.voiceListeningDescription",
  },
};

function VoiceMicButton({
  field,
  listeningField,
  disabled,
  onToggle,
  label,
}: {
  field: SpeechField;
  listeningField: SpeechField | null;
  disabled?: boolean;
  onToggle: (field: SpeechField) => void;
  label: string;
}) {
  const isListening = listeningField === field;

  return (
    <button
      type="button"
      className={`${styles.voiceBtn} ${isListening ? styles.voiceBtnActive : ""}`}
      onClick={() => onToggle(field)}
      disabled={disabled}
      aria-label={label}
      aria-pressed={isListening}
    >
      <MicIcon />
    </button>
  );
}

export default function NewIssueForm() {
  const router = useRouter();
  const { translate: t, locale, stopSpeaking } = useAccessibility();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoProcessing, setPhotoProcessing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const fieldBaseRef = useRef<Record<SpeechField, string>>({
    title: "",
    location: "",
    description: "",
  });

  const applyFieldValue = useCallback((field: SpeechField, value: string) => {
    if (field === "title") setTitle(value);
    else if (field === "location") setLocation(value);
    else setDescription(value);
  }, []);

  const handleTranscript = useCallback(
    (field: SpeechField, spoken: string) => {
      applyFieldValue(field, mergeTranscript(fieldBaseRef.current[field], spoken));
    },
    [applyFieldValue]
  );

  const handleListeningStart = useCallback(
    (field: SpeechField) => {
      stopSpeaking();
      fieldBaseRef.current[field] =
        field === "title" ? title : field === "location" ? location : description;
    },
    [description, location, stopSpeaking, title]
  );

  const { isSupported, listeningField, errorKey, toggle, stop, clearError } = useSpeechInput({
    locale,
    onTranscript: handleTranscript,
    onListeningStart: handleListeningStart,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    stop();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          description,
          location,
          ...(photoUrl ? { photoUrl } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("issuesNew.submissionFailed"));
        return;
      }
      router.push(`/citizen/issues/${data.issue.id}`);
    } catch {
      setError(t("common.networkError"));
    } finally {
      setLoading(false);
    }
  };

  const voiceLabel = (field: SpeechField) => {
    const keys = VOICE_LABEL_KEYS[field];
    return t(listeningField === field ? keys.listening : keys.idle);
  };

  const onPhotoSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setPhotoProcessing(true);
    try {
      const compressed = await compressImageFile(file);
      setPhotoUrl(compressed);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("issuesNew.submissionFailed"));
    } finally {
      setPhotoProcessing(false);
    }
  };

  return (
    <div className={styles.card} style={{ maxWidth: "100%" }}>
      <h1 className={styles.title}>{t("issuesNew.title")}</h1>
      <p className={styles.subtitle} style={{ marginBottom: "1.5rem" }}>
        {t("issuesNew.aiHint")}
      </p>
      <p className={styles.voiceHint}>{t("issuesNew.voiceHint")}</p>
      <form onSubmit={submit} aria-busy={loading}>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-category">
            {t("issuesNew.category")}<span className={styles.required}>*</span>
          </label>
          <select
            id="issue-category"
            className={styles.select}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.label} htmlFor="issue-title">
              {t("issuesNew.titleField")}<span className={styles.required}>*</span>
            </label>
            <VoiceMicButton
              field="title"
              listeningField={listeningField}
              disabled={!isSupported || loading}
              onToggle={(field) => {
                clearError();
                toggle(field);
              }}
              label={voiceLabel("title")}
            />
          </div>
          <input
            id="issue-title"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("issuesNew.titlePlaceholder")}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.label} htmlFor="issue-location">
              {t("issuesNew.location")}<span className={styles.required}>*</span>
            </label>
            <VoiceMicButton
              field="location"
              listeningField={listeningField}
              disabled={!isSupported || loading}
              onToggle={(field) => {
                clearError();
                toggle(field);
              }}
              label={voiceLabel("location")}
            />
          </div>
          <input
            id="issue-location"
            className={styles.input}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("issuesNew.locationPlaceholder")}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <div className={styles.fieldLabelRow}>
            <label className={styles.label} htmlFor="issue-description">
              {t("issuesNew.detailedDesc")}<span className={styles.required}>*</span>
            </label>
            <VoiceMicButton
              field="description"
              listeningField={listeningField}
              disabled={!isSupported || loading}
              onToggle={(field) => {
                clearError();
                toggle(field);
              }}
              label={voiceLabel("description")}
            />
          </div>
          <textarea
            id="issue-description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder={t("issuesNew.descPlaceholder")}
            required
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label} htmlFor="issue-photo">
            {t("issuesNew.photoLabel")}
          </label>
          <div className={styles.photoField}>
            <div className={styles.photoInstructions} role="note">
              <p className={styles.photoHint}>{t("issuesNew.photoHint")}</p>
              <p className={styles.photoSizeLimit}>{t("photo.uploadLimits")}</p>
              <p className={styles.photoSizeLimit}>{t("photo.dimensionLimits")}</p>
            </div>
            <input
              ref={photoInputRef}
              id="issue-photo"
              type="file"
              accept={PHOTO_ACCEPT_ATTRIBUTE}
              onChange={onPhotoSelected}
              className="sr-only"
            />
            <div className={styles.photoActions}>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => photoInputRef.current?.click()}
                disabled={loading || photoProcessing}
              >
                {photoProcessing
                  ? t("issuesNew.photoProcessing")
                  : photoUrl
                    ? t("issuesNew.photoChange")
                    : t("issuesNew.photoAdd")}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={() => setPhotoUrl(null)}
                  disabled={loading || photoProcessing}
                >
                  {t("issuesNew.photoRemove")}
                </button>
              )}
            </div>
            {photoUrl && (
              <div className={styles.photoPreviewWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt={t("issuesNew.photoAttached")}
                  className={styles.photoPreview}
                />
                <p className={styles.photoStatus} role="status">
                  {t("issuesNew.photoAttached")}
                </p>
              </div>
            )}
          </div>
        </div>
        {!isSupported && (
          <p className={styles.voiceStatus} role="status">
            {t("issuesNew.voiceUnsupported")}
          </p>
        )}
        {listeningField && (
          <p className={styles.voiceStatus} role="status" aria-live="polite">
            {voiceLabel(listeningField)}
          </p>
        )}
        {errorKey && (
          <p className={styles.errorMsg} role="alert">
            {t(errorKey)}
          </p>
        )}
        {error && <p className={styles.errorMsg} role="alert">{error}</p>}
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button type="submit" className={styles.btnPrimary} disabled={loading} aria-busy={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span className="sr-only">{t("common.submittingIssue")}</span>
              </>
            ) : (
              t("issuesNew.submitAi")
            )}
          </button>
          <Link href="/citizen/dashboard" className={styles.btnSecondary}>
            {t("common.cancel")}
          </Link>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#7c8db5", marginTop: "1rem" }}>
          {t("issuesNew.faqHint")}{" "}
          <Link href="/faq#faq-issues" style={{ color: "#a78bfa" }}>
            {t("issuesNew.readFaqs")}
          </Link>
        </p>
      </form>
    </div>
  );
}