import { expect, test } from "@playwright/test";

test("an unknown address shows the 404 page with a way back", async ({ page }) => {
  const response = await page.goto("/medical/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("This page isn't on the list.");
  await expect(page.getByRole("link", { name: "Browse colleges" })).toBeVisible();
});

test("ticking a document on the guide updates the count", async ({ page }) => {
  await page.goto("/medical/guide");
  const section = page.locator("section[data-section='documents']");
  await section.locator("input[type=checkbox]").first().check({ force: true });
  await expect(section.locator("[aria-live]")).toContainText(/1\s*\/\s*\d+/);
});

test("a college with a Wikimedia photo shows it with the photographer and licence", async ({ page }) => {
  await page.goto("/medical/college/ug_in002i1");
  await expect(page.locator("main section").first().locator("img")).toHaveAttribute("src", /^https:\/\/upload\.wikimedia\.org\//);
  const credit = page.getByText(/via Wikimedia Commons/);
  await expect(credit).toBeVisible();
  await expect(credit.getByRole("link").first()).toHaveAttribute("href", /commons\.wikimedia\.org\/wiki\/File:/);
});

test("the privacy page lists its sections", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Privacy Policy");
  await expect(page.getByRole("heading", { name: "Information kept in your browser" })).toBeVisible();
});
