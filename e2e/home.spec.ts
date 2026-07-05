import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("shows branding and problem statement", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Proxima Gov/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: /The Problem We Solve/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Citizen Registration/i })).toBeVisible();
  });

  test("skip link targets main content", async ({ page }) => {
    await page.goto("/");
    const skip = page.getByRole("link", { name: /Skip to main content/i });
    await expect(skip).toHaveAttribute("href", "#main-content");
  });
});