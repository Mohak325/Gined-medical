import { expect, test } from "@playwright/test";

test("compare shows each college, an open slot, and removes a college", async ({ page }) => {
  await page.goto("/medical/compare?ids=ug_ap001g1,ug_ka001p3");
  await expect(page.getByRole("link", { name: "Add a college" })).toBeVisible();
  const remove = page.getByRole("button", { name: /^Remove / });
  await expect(remove).toHaveCount(2);
  await remove.first().click();
  await expect(page).toHaveURL(/ids=ug_ka001p3$/);
  await expect(page.getByRole("button", { name: /^Remove / })).toHaveCount(1);
});

test("the seat matrix totals follow the search box", async ({ page }) => {
  await page.goto("/medical/seat-matrix");
  const seats = page.locator("section[aria-label='Seats'] dd").first();
  await expect(seats).toHaveText(/^[1-9][\d,]*$/, { timeout: 15_000 });
  const before = await seats.textContent();
  await page.getByLabel("Search").fill("Nellore");
  await expect(page).toHaveURL(/search=Nellore/);
  await expect(seats).not.toHaveText(before ?? "");
  await expect(page.locator("tbody tr").first()).toContainText("Nellore");
});

test("the shortlist reorders with the arrow buttons", async ({ page }) => {
  await page.goto("/medical/results?track=ug&rank=25000&quota=aiq&category=general");
  const save = page.getByRole("button", { name: /^Save / });
  await save.nth(0).click();
  await save.nth(1).click();
  await page.goto("/medical/shortlist");
  const rows = page.locator("main ol li");
  await expect(rows).toHaveCount(2);
  const first = (await rows.nth(0).locator("a").first().textContent()) ?? "";
  await page.getByRole("button", { name: `Move ${first} down` }).click();
  await expect(rows.nth(1).locator("a").first()).toHaveText(first);
});
