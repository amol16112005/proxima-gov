import { test, expect } from "@playwright/test";

test.describe("FAQ page", () => {
  test("renders accessible accordion in English", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: /Frequently Asked Questions/i })).toBeVisible();
    const trigger = page.locator("button[aria-expanded]").first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-controls", /.+/);
  });

  test("renders Hindi heading when locale cookie is set", async ({ page, context }) => {
    await context.addCookies([
      { name: "proxima_locale", value: "hi", domain: "localhost", path: "/" },
    ]);
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: /अक्सर पूछे जाने वाले प्रश्न/i })).toBeVisible();
  });

  test("accessibility panel opens and closes with keyboard", async ({ page }) => {
    await page.goto("/faq");
    const fab = page.getByRole("button", { name: /Accessibility options/i });
    await fab.click();
    await expect(page.locator("#proxima-a11y-panel")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("#proxima-a11y-panel")).toBeHidden();
  });
});