import { expect, test } from "@playwright/test";

// The course page trail (DESIGN.md section 9) at a phone width, and the
// homepage trail across the page at 1440px.

for (const path of ["/courses/python", "/courses/c", "/courses/java"]) {
  test(`${path} at 360px: the trail runs down the page, in order, inside the screen, with 48px links`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(path);
    const stops = page.locator("[data-trail-stop]");
    const count = await stops.count();
    expect(count).toBeGreaterThan(0);
    let lastTop = -1;
    for (let i = 0; i < count; i++) {
      const box = (await stops.nth(i).boundingBox())!;
      expect(box.y, `stop ${i + 1} below the one before`).toBeGreaterThan(lastTop);
      expect(box.x + box.width, `stop ${i + 1} inside the screen`).toBeLessThanOrEqual(360);
      lastTop = box.y;
    }
    // Numbers run on from the lessons into the planned topics.
    await expect(stops.locator("span[aria-hidden]")).toHaveText(Array.from({ length: count }, (_, i) => String(i + 1)));
    for (const link of await stops.getByRole("link").all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  });
}

test("planned stops are plain text with the word Planned and a dashed marker", async ({ page }) => {
  await page.goto("/courses/java");
  const planned = page.locator('[data-trail-stop="planned"]');
  expect(await planned.count()).toBeGreaterThan(0);
  await expect(planned.locator("a")).toHaveCount(0);
  await expect(planned.first()).toContainText("Planned");
  expect(await planned.first().locator("span[aria-hidden]").evaluate((el) => getComputedStyle(el).borderStyle)).toBe("dashed");
});

test("the homepage trail runs across the page at 1440px and down it at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const stops = page.locator("[data-trail] [data-trail-stop]");
  const tops = await stops.evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  await page.setViewportSize({ width: 360, height: 800 });
  const narrow = await stops.evaluateAll((items) => items.map((item) => Math.round(item.getBoundingClientRect().top)));
  expect(new Set(narrow).size).toBe(narrow.length);
});
