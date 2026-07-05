import { cookies } from "next/headers";
import { LOCALE_COOKIE } from "./constants";
import { isLocale, t, type Locale, type MessageKey } from "./index";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value && isLocale(value) ? value : "en";
}

export async function getServerTranslator() {
  const locale = await getServerLocale();
  return (key: MessageKey) => t(locale, key);
}

export { LOCALE_COOKIE } from "./constants";