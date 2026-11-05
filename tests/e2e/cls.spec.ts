import { expect, test } from "@playwright/test";

// Layout stability (DESIGN.md section 6: CLS stays 0). Fonts have metric-matched
// fallbacks (globals.css), the prose measure does not depend on the font, and
// predict then run keeps the same space before and after JavaScript runs.
for (const path of ["/", "/courses/python/decisions", "/courses/c/pointers"]) {
  for (const [width, height] of [[360, 740], [1280, 720], [1440, 900]]) {
    test(`${path} at ${width}px loads without layout shift`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.addInitScript(() => {
        const w = window as unknown as { cls: number };
        w.cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!entry.hadRecentInput) w.cls += entry.value;
        }).observe({ type: "layout-shift", buffered: true });
      });
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(300);
      expect(await page.evaluate(() => (window as unknown as { cls: number }).cls)).toBe(0);
    });
  }
}

test("predict then run: the placeholder and the output take the same space, before and after Show", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/", { waitUntil: "networkidle" });
  const box = page.locator("[data-predict]").first();
  const before = (await box.boundingBox())!.height;
  await expect(box.locator("[data-predict-placeholder]")).toBeVisible();
  await box.getByRole("button", { name: "Show" }).click();
  await expect(box).toHaveAttribute("data-predict", "shown");
  await expect(box.locator("[data-predict-placeholder]")).toBeHidden();
  expect((await box.boundingBox())!.height).toBe(before);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("predict then run shows the output and keeps the same space", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto("/");
    const box = page.locator("[data-predict]").first();
    await expect(box).toHaveAttribute("data-predict", "shown");
    await expect(box.locator("[data-predict-placeholder]")).toBeHidden();
    await expect(box.locator("pre")).toBeVisible();
  });
});
