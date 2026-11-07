import { expect, test } from "@playwright/test";

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("every revealed element on the homepage is visible straight away", async ({ page }) => {
    await page.goto("/medical");
    await page.waitForLoadState("networkidle");
    const hidden = await page.$$eval("[data-reveal], [data-split] .split-word > span, .intro, .intro-scale", (els) =>
      els.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length
    );
    expect(hidden).toBe(0);
  });

  test("the results page shows every card and full-length bars straight away", async ({ page }) => {
    await page.goto("/medical/results?track=ug&rank=25000&quota=aiq&category=general");
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 });
    const hidden = await page.$$eval("[data-reveal], .intro, .intro-scale", (els) => els.filter((el) => Number(getComputedStyle(el).opacity) < 0.99).length);
    expect(hidden).toBe(0);
    // A grown bar has a non-zero horizontal scale; an ungrown one would be scaleX(0).
    const empty = await page.$$eval("article .bar-fill", (els) => els.filter((el) => new DOMMatrix(getComputedStyle(el).transform).a === 0).length);
    expect(empty).toBe(0);
  });
});

test("scrolling reveals sections and counts numbers up to their real values", async ({ page }) => {
  await page.goto("/medical");
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await expect(page.locator("#faq h2[data-split]")).toHaveAttribute("data-in", "");
  await page.locator('section[aria-label="What the data covers"]').scrollIntoViewIfNeeded();
  await expect(page.locator('section[aria-label="What the data covers"] dd').first()).toContainText(/\d/);
});

test("result cards reveal as they scroll in and the what-if counts glide to new values", async ({ page }) => {
  await page.goto("/medical/results?track=ug&rank=25000&quota=aiq&category=general");
  const first = page.locator("article").first();
  await expect(first).toHaveAttribute("data-reveal", "up", { timeout: 15_000 });
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-in", "");
  const safe = page.locator('[data-count="safe"]');
  await expect(safe).toHaveText("0");
  await page.getByLabel(/What if my rank were/).fill("14000");
  await expect(safe).toHaveText(/^[1-9][\d,]*$/);
  await expect(page.getByRole("button", { name: "Back to 25,000" })).toBeVisible();
});
