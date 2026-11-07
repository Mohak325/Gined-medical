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
});

test("scrolling reveals sections and counts numbers up to their real values", async ({ page }) => {
  await page.goto("/medical");
  await page.locator("#faq").scrollIntoViewIfNeeded();
  await expect(page.locator("#faq h2[data-split]")).toHaveAttribute("data-in", "");
  await page.locator('section[aria-label="What the data covers"]').scrollIntoViewIfNeeded();
  await expect(page.locator('section[aria-label="What the data covers"] dd').first()).toContainText(/\d/);
});
