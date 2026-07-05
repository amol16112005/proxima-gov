import en from "./messages/en";
import hi from "./messages/hi";
import type { Locale, MessageKey, Messages } from "./types";

export type { Locale, MessageKey, Messages };

const CATALOG: Record<Locale, Messages> = { en, hi };

export const LOCALES: { code: Locale; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "hi";
}

export function getMessages(locale: Locale): Messages {
  return CATALOG[locale];
}

export function t(locale: Locale, key: MessageKey): string {
  return CATALOG[locale][key];
}

export function interpolate(text: string, vars: Record<string, string | number>): string {
  let out = text;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replace(`{${key}}`, String(value));
  }
  return out;
}