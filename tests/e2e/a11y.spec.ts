import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const PAGES = [
  "/medical",
  "/medical/results?track=ug&rank=25000&quota=aiq&category=general",
  "/medical/colleges",
  "/medical/college/ug_ap001g1",
  "/medical/compare?ids=ug_ap001g1,ug_ka001p3",
  "/medical/seat-matrix",
  "/medical/state/karnataka",
  "/medical/guide",
  "/medical/pricing",
  "/medical/book",
  "/medical/shortlist",
  "/privacy",
  "/medical/no-such-page",
];

for (const path of PAGES) {
  test(`no serious accessibility problems on ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
  });
}
