import type en from "./messages/en";

export type Locale = "en" | "hi";

export type MessageKey = keyof typeof en;

export type Messages = Record<MessageKey, string>;