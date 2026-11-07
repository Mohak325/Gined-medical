import { expect, test } from "@playwright/test";

test("the directory filters by state from the tile map", async ({ page }) => {
  await page.goto("/medical/colleges");
  await page.getByRole("button", { name: /^KA/ }).click();
  await expect(page).toHaveURL(/state=KA/);
  await expect(page.getByRole("link", { name: "About counselling in Karnataka" })).toBeVisible();
});

test("a college page labels a rank in Your chances here", async ({ page }) => {
  await page.goto("/medical/college/ug_ap001g1");
  await page.getByLabel("Your NEET rank").fill("21000");
  await expect(page.getByText("Reached in Round 2 or 3")).toBeVisible();
});

test("a college page's section menu jumps to a section", async ({ page }) => {
  await page.goto("/medical/college/ug_ap001g1");
  await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Fees" }).click();
  await expect(page.locator("#fees-heading")).toBeInViewport();
});

test("the directory hero counts colleges and the list view shows a table", async ({ page }) => {
  await page.goto("/medical/colleges");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(/Every medical college/);
  await page.getByRole("button", { name: "List view" }).click();
  await expect(page).toHaveURL(/view=list/);
  await expect(page.locator("table tbody tr").first()).toBeVisible();
});

test("state, guide and pricing pages render", async ({ page }) => {
  for (const [path, heading] of [
    ["/medical/state/karnataka", /medical colleges/],
    ["/medical/guide", /NEET UG counselling/],
    ["/medical/pricing", /Pick the support/],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(heading);
  }
});

test("sitemap and robots are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("/medical/college/ug_ap001g1");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap:");
});

test("share images render for the site, a college and a state", async ({ request }) => {
  for (const path of ["/opengraph-image", "/medical/college/ug_ap001g1/opengraph-image", "/medical/state/karnataka/opengraph-image"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});

test("college pages carry a canonical link and structured data", async ({ page }) => {
  await page.goto("/medical/college/ug_ap001g1");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/medical\/college\/ug_ap001g1$/);
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain("CollegeOrUniversity");
});
