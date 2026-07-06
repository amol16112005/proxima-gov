"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { isLocale, t, type Locale, type MessageKey } from "@/frontend/i18n";
import { LOCALE_COOKIE } from "@/frontend/i18n/constants";

const STORAGE_KEY = "proxima_locale";

function persistLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;SameSite=Lax`;
}
const A11Y_KEY = "proxima_a11y";

interface A11yPrefs {
  largeText: boolean;
  highContrast: boolean;
}

interface AccessibilityContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  translate: (key: MessageKey) => string;
  largeText: boolean;
  highContrast: boolean;
  toggleLargeText: () => void;
  toggleHighContrast: () => void;
  isOnline: boolean;
  isSpeaking: boolean;
  speakPage: () => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function readLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && isLocale(stored)) {
    document.cookie = `${LOCALE_COOKIE}=${stored};path=/;max-age=31536000;SameSite=Lax`;
    return stored;
  }
  const match = document.cookie.match(new RegExp(`${LOCALE_COOKIE}=([^;]+)`));
  if (match?.[1] && isLocale(match[1])) return match[1];
  return "en";
}

function readPrefs(): A11yPrefs {
  if (typeof window === "undefined") return { largeText: false, highContrast: false };
  try {
    const raw = localStorage.getItem(A11Y_KEY);
    if (!raw) return { largeText: false, highContrast: false };
    const parsed = JSON.parse(raw) as A11yPrefs;
    return {
      largeText: !!parsed.largeText,
      highContrast: !!parsed.highContrast,
    };
  } catch {
    return { largeText: false, highContrast: false };
  }
}

export function AccessibilityProvider({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setLocaleState(readLocale());
    const prefs = readPrefs();
    setLargeText(prefs.largeText);
    setHighContrast(prefs.highContrast);
    setIsOnline(navigator.onLine);

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    persistLocale(locale);
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.toggle("a11y-large-text", largeText);
    document.documentElement.classList.toggle("a11y-high-contrast", highContrast);
    localStorage.setItem(A11Y_KEY, JSON.stringify({ largeText, highContrast }));
  }, [largeText, highContrast]);

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState((prev) => {
        if (prev !== next) {
          queueMicrotask(() => router.refresh());
        }
        return next;
      });
      if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    },
    [router]
  );

  const translate = useCallback((key: MessageKey) => t(locale, key), [locale]);

  const speakPage = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const main = document.getElementById("main-content");
    const text = main?.innerText?.replace(/\s+/g, " ").trim();
    if (!text) return;

    const chunkSize = 4000;
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }

    setIsSpeaking(true);
    let index = 0;
    const speakNext = () => {
      if (index >= chunks.length) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = locale === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 0.95;
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  }, [locale]);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      locale,
      setLocale,
      translate,
      largeText,
      highContrast,
      toggleLargeText: () => setLargeText((v) => !v),
      toggleHighContrast: () => setHighContrast((v) => !v),
      isOnline,
      isSpeaking,
      speakPage,
      stopSpeaking,
    }),
    [
      locale,
      setLocale,
      translate,
      largeText,
      highContrast,
      isOnline,
      isSpeaking,
      speakPage,
      stopSpeaking,
    ]
  );

  return (
    <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return ctx;
}