import { expect, test } from "@playwright/test";

test("the homepage finder opens results with quota tabs and labelled colleges", async ({ page }) => {
  await page.goto("/medical");
  await page.getByLabel("NEET UG Rank").fill("25000");
  await page.getByRole("button", { name: "See my colleges" }).click();
  await expect(page).toHaveURL(/\/medical\/results\?.*rank=25000/);
  await expect(page.getByRole("button", { name: /All India\s*\d+ options?/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("article").first()).toContainText(/Safe|Moderate|Ambitious/);
});

test("the what-if slider relabels without a new search", async ({ page }) => {
  await page.goto("/medical/results?track=ug&rank=25000&quota=aiq&category=general");
  const safe = page.locator('[data-count="safe"]');
  await expect(safe).toHaveText("0");
  await page.getByLabel(/What if my rank were/).fill("14000");
  await expect(safe).not.toHaveText("0");
});

test("saving a college adds it to the shortlist", async ({ page }) => {
  await page.goto("/medical/results?track=ug&rank=25000&quota=aiq&category=general");
  await page.getByRole("button", { name: /^Save / }).first().click();
  await expect(page.getByRole("link", { name: "Your shortlist, 1 saved" })).toBeVisible();
  await page.goto("/medical/shortlist");
  await expect(page.locator("main ol li")).toHaveCount(1);
});
