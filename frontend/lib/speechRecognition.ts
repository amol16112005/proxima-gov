import type { Locale } from "@/frontend/i18n";
import type { MessageKey } from "@/frontend/i18n";

export type SpeechField = "title" | "location" | "description";

export type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

export interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

export interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: SpeechRecognitionErrorCode;
  message?: string;
}

type SpeechRecognitionConstructor = new () => BrowserSpeechRecognition;

type SpeechWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export function speechLocaleFromAppLocale(locale: Locale): string {
  return locale === "hi" ? "hi-IN" : "en-IN";
}

export function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as SpeechWindow;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function mapSpeechErrorToMessageKey(error: SpeechRecognitionErrorCode): MessageKey {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "issuesNew.voiceMicDenied";
    case "no-speech":
      return "issuesNew.voiceNoSpeech";
    case "network":
      return "issuesNew.voiceNetwork";
    case "language-not-supported":
      return "issuesNew.voiceLangUnsupported";
    default:
      return "issuesNew.voiceError";
  }
}

export function mergeTranscript(base: string, spoken: string): string {
  const trimmed = spoken.trim();
  if (!trimmed) return base;
  if (!base.trim()) return trimmed;
  return `${base.trimEnd()} ${trimmed}`;
}