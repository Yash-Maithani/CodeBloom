import { expect, test, type Page } from "@playwright/test";

// The sticky step rail (DESIGN.md section 7, step rail).
const LESSON = "/courses/python/variables";

/** Starts collecting layout shifts that are not caused by input. */
async function watchShifts(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { cls: number };
    w.cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
        if (!entry.hadRecentInput) w.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const cls = (page: Page) => page.evaluate(() => (window as unknown as { cls: number }).cls);

const headings = (page: Page) => page.locator("section[data-step] > h2");

test("1440px: the rail stays in view while scrolling to the last step, and the current step follows", async ({ page }) => {
  await watchShifts(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const rail = page.locator("[data-rail-full]");
  const current = rail.locator('a[aria-current="step"]');
  await expect(current).toHaveAccessibleName("The idea");
  await expect(rail.locator("a[data-passed]")).toHaveCount(0);

  // Scroll with the mouse wheel to the third step: the current step changes and the first two are "passed".
  const titles = await headings(page).allInnerTexts();
  await headings(page).nth(2).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 100));
  await expect(current).toHaveAccessibleName(titles[2]);
  await expect(rail.locator("a[data-passed]")).toHaveCount(2);

  // The last step: the rail is still on screen, below the top edge.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(current).toHaveAccessibleName(titles.at(-1)!);
  const box = await rail.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(900);
  // It never claims completion: passed steps carry no text about being done.
  expect(await rail.innerText()).not.toMatch(/done|complete|finished/i);
  expect(await cls(page)).toBe(0);
});

test("1440px: a rail taller than the screen scrolls inside itself", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 300 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const style = await page.locator("[data-rail-full]").evaluate((el) => ({ overflow: getComputedStyle(el).overflowY, scrolls: el.scrollHeight > el.clientHeight }));
  expect(style).toEqual({ overflow: "auto", scrolls: true });
});

test("keyboard: choosing a step moves focus to its heading and marks it current", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const titles = await headings(page).allInnerTexts();
  const link = page.locator("[data-rail-full] a").nth(3);
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(headings(page).nth(3)).toBeFocused();
  await expect(page).toHaveURL(new RegExp(`#${await headings(page).nth(3).getAttribute("id")}$`));
  await expect(page.locator('[data-rail-full] a[aria-current="step"]')).toHaveAccessibleName(titles[3]);
  await expect.poll(() => headings(page).nth(3).evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBeLessThan(120);
});

test("reduced motion: choosing a step jumps there at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  await page.locator("[data-rail-full] a").nth(4).click();
  // No smooth scroll: the heading is at the top in the same frame.
  const top = await headings(page).nth(4).evaluate((el) => el.getBoundingClientRect().top);
  expect(top).toBeLessThan(120);
});

test("360px: a slim sticky bar shows the current step and opens the full list from the keyboard", async ({ page }) => {
  await watchShifts(page);
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const bar = page.locator("[data-rail-bar] button");
  const count = await headings(page).count();
  const titles = await headings(page).allInnerTexts();
  await expect(bar).toHaveText(new RegExp(`^Step 1 of ${count}\\s*${titles[0]}`));
  await expect(bar).toHaveAttribute("aria-expanded", "false");

  await headings(page).nth(3).evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80));
  await expect(bar).toHaveText(new RegExp(`^Step 4 of ${count}\\s*${titles[3]}`));
  const box = await bar.boundingBox();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(10);

  // Keyboard: open with Enter, Escape closes and returns focus, then pick a step.
  await bar.focus();
  await page.keyboard.press("Enter");
  await expect(bar).toHaveAttribute("aria-expanded", "true");
  const list = page.locator("[data-rail-bar] ol a");
  await expect(list.first()).toBeVisible();
  // The list opens over the page: nothing below it moves.
  expect(await cls(page)).toBe(0);
  await expect(page.locator('[data-rail-bar] a[aria-current="step"]')).toHaveAccessibleName(titles[3]);
  await page.keyboard.press("Escape");
  await expect(bar).toHaveAttribute("aria-expanded", "false");
  await expect(bar).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await expect(list.first()).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(bar).toHaveAttribute("aria-expanded", "false");
  await expect(headings(page).nth(1)).toBeFocused();
  await expect(bar).toHaveText(new RegExp(`^Step 2 of ${count}`));
  // The heading lands below the bar, not under it.
  await expect.poll(async () => (await headings(page).nth(1).boundingBox())!.y).toBeGreaterThanOrEqual((await bar.boundingBox())!.height);
  expect(await cls(page)).toBe(0);
});
