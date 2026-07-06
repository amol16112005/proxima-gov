"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/frontend/i18n";
import type { MessageKey } from "@/frontend/i18n";
import {
  getSpeechRecognitionCtor,
  mapSpeechErrorToMessageKey,
  probeMicrophonePermission,
  speechLocaleFromAppLocale,
  type BrowserSpeechRecognition,
  type SpeechField,
} from "./speechRecognition";

interface UseSpeechInputOptions {
  locale: Locale;
  onTranscript: (field: SpeechField, spoken: string) => void;
  onListeningStart?: (field: SpeechField) => void;
}

function micProbeToErrorKey(status: "denied" | "unavailable"): MessageKey {
  return status === "denied" ? "issuesNew.voiceMicDenied" : "issuesNew.voiceMicUnavailable";
}

export function useSpeechInput({
  locale,
  onTranscript,
  onListeningStart,
}: UseSpeechInputOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [listeningField, setListeningField] = useState<SpeechField | null>(null);
  const [errorKey, setErrorKey] = useState<MessageKey | null>(null);
  const [errorField, setErrorField] = useState<SpeechField | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const activeFieldRef = useRef<SpeechField | null>(null);
  const finalTranscriptRef = useRef("");
  const onTranscriptRef = useRef(onTranscript);
  const onListeningStartRef = useRef(onListeningStart);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onListeningStartRef.current = onListeningStart;
  }, [onListeningStart]);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognitionCtor());
  }, []);

  const setVoiceError = useCallback((field: SpeechField, key: MessageKey) => {
    setErrorField(field);
    setErrorKey(key);
  }, []);

  const cleanupRecognition = useCallback(() => {
    recognitionRef.current = null;
    finalTranscriptRef.current = "";
    activeFieldRef.current = null;
    setListeningField(null);
  }, []);

  const stop = useCallback(() => {
    const active = recognitionRef.current;
    if (!active) {
      setListeningField(null);
      activeFieldRef.current = null;
      return;
    }
    active.onresult = null;
    active.onerror = null;
    active.onend = null;
    active.onstart = null;
    try {
      active.stop();
    } catch {
      try {
        active.abort();
      } catch {
        /* already stopped */
      }
    }
    cleanupRecognition();
  }, [cleanupRecognition]);

  const beginRecognition = useCallback(
    (field: SpeechField) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) return;

      finalTranscriptRef.current = "";
      onListeningStartRef.current?.(field);

      const recognition = new Ctor();
      recognition.continuous = field === "description";
      recognition.interimResults = true;
      recognition.lang = speechLocaleFromAppLocale(locale);

      recognition.onstart = () => {
        setListeningField(field);
      };

      recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const result = event.results[i];
          const text = result[0]?.transcript ?? "";
          if (result.isFinal) {
            finalTranscriptRef.current += text;
          } else {
            interim += text;
          }
        }
        onTranscriptRef.current(field, `${finalTranscriptRef.current}${interim}`);
      };

      recognition.onerror = (event) => {
        if (event.error === "aborted") return;
        const failedField = activeFieldRef.current ?? field;
        setVoiceError(failedField, mapSpeechErrorToMessageKey(event.error));
        cleanupRecognition();
      };

      recognition.onend = () => {
        cleanupRecognition();
      };

      recognitionRef.current = recognition;
      activeFieldRef.current = field;

      try {
        recognition.start();
      } catch {
        setVoiceError(field, "issuesNew.voiceError");
        cleanupRecognition();
      }
    },
    [cleanupRecognition, locale, setVoiceError]
  );

  const start = useCallback(
    async (field: SpeechField) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) return;

      stop();
      setErrorKey(null);
      setErrorField(null);

      const micStatus = await probeMicrophonePermission();
      if (micStatus !== "granted") {
        setVoiceError(field, micProbeToErrorKey(micStatus));
        return;
      }

      beginRecognition(field);
    },
    [beginRecognition, setVoiceError, stop]
  );

  const toggle = useCallback(
    (field: SpeechField) => {
      if (listeningField === field) {
        stop();
        return;
      }
      void start(field);
    },
    [listeningField, start, stop]
  );

  const clearError = useCallback(() => {
    setErrorKey(null);
    setErrorField(null);
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    isSupported,
    listeningField,
    errorKey,
    errorField,
    toggle,
    stop,
    clearError,
  };
}