import { test, expect } from "@playwright/test";

test.describe("Public navigation", () => {
  test("home page is accessible without authentication", async ({ page }) => {
    await page.goto("/");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("cards page is accessible without authentication", async ({ page }) => {
    await page.goto("/cards");
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("collection page redirects unauthenticated users to login", async ({
    page,
  }) => {
    await page.goto("/collection");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page).not.toHaveURL(/\/$/);
    await expect(page.locator("body")).toBeVisible();
  });
});
