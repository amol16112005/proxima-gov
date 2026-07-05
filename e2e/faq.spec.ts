import { test, expect } from "@playwright/test";

test.describe("FAQ page", () => {
  test("renders accessible accordion", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: /Frequently Asked Questions/i })).toBeVisible();
    const trigger = page.locator("button[aria-expanded]").first();
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-controls", /.+/);
  });
});