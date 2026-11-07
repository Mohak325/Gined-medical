import { expect, test } from "@playwright/test";

test("booking sends contact first, then details with the same lead id", async ({ page, request }) => {
  await page.goto("/medical/book?source=finder-results&rank=25000&quota=aiq&category=general");
  await page.getByLabel("Full name").fill("Test Student");
  await page.getByLabel("Phone number").fill("9000000000");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByLabel("NEET rank")).toHaveValue("25000");
  await page.getByRole("button", { name: "Send details" }).click();
  await expect(page.getByRole("heading", { name: /Request received/ })).toBeVisible();

  const leads = (await (await request.get("http://localhost:3201/received")).json()) as { stage: string; leadId: string; rank?: string }[];
  const mine = leads.slice(-2);
  expect(mine.map((l) => l.stage)).toEqual(["contact", "details"]);
  expect(mine[0].leadId).toBe(mine[1].leadId);
  expect(mine[1].rank).toBe("25000");
});
