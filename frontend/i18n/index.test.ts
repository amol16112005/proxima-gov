import { describe, expect, it } from "vitest";
import { getMessages, isLocale, t } from "./index";

describe("i18n", () => {
  it("supports English and Hindi locales", () => {
    expect(isLocale("en")).toBe(true);
    expect(isLocale("hi")).toBe(true);
    expect(isLocale("fr")).toBe(false);
  });

  it("returns Hindi home title", () => {
    expect(t("hi", "home.title")).toMatch(/प्रॉक्सिमा/);
    expect(getMessages("en")["home.title"]).toBe("Proxima Gov");
  });
});