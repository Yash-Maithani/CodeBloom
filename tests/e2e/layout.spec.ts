import { expect, test } from "@playwright/test";

// Responsive and theme checks at 360px and 1440px, light and dark.
// Screenshots are attached to the test report (not committed).

const PAGES = ["/", "/courses", "/courses/c", "/courses/c/first-program", "/courses/python/variables"];
const PAPER = { light: "rgb(248, 247, 242)", dark: "rgb(22, 26, 24)" };

for (const path of PAGES) {
  for (const width of [360, 1440]) {
    for (const theme of ["light", "dark"] as const) {
      test(`${path} at ${width}px in ${theme}: theme applied, no horizontal scroll`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        await page.emulateMedia({ colorScheme: theme });
        await page.goto(path);

        const layout = await page.evaluate(() => ({
          background: getComputedStyle(document.body).backgroundColor,
          scrollWidth: document.documentElement.scrollWidth,
          innerWidth: window.innerWidth,
        }));
        expect(layout.background).toBe(PAPER[theme]);
        expect(layout.scrollWidth, "page must not scroll sideways").toBeLessThanOrEqual(layout.innerWidth);

        await testInfo.attach(`${path} ${width} ${theme}`, {
          body: await page.screenshot({ fullPage: true }),
          contentType: "image/png",
        });
      });
    }
  }
}

// Lesson pages at the other widths in SPEC.md AR-6 and AR-8.
for (const path of ["/courses/c/first-program", "/courses/c/variables", "/courses/c/numbers", "/courses/c/printf-scanf", "/courses/c/decisions", "/courses/c/else-if", "/courses/c/conditions", "/courses/c/loops", "/courses/python/first-program", "/courses/python/variables", "/courses/python/input-output", "/courses/python/decisions", "/courses/python/elif", "/courses/python/loops", "/courses/python/functions", "/courses/python/lists", "/courses/python/strings", "/courses/python/dictionaries", "/courses/python/files", "/courses/python/numbers", "/courses/python/conditions"]) {
  for (const width of [320, 768, 1024]) {
    test(`${path} at ${width}px: no horizontal scroll, solutions open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      for (const summary of await page.locator("details summary").all()) await summary.click();
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      expect(scrollWidth, "page must not scroll sideways").toBeLessThanOrEqual(innerWidth);
    });
  }
}

test("at 1440px the notes sit in a column beside the code", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const code = await page.locator("pre[role=region]:has([data-line])").boundingBox();
  const notes = await page.locator("[data-notes-list]").boundingBox();
  expect(notes!.width).toBeGreaterThan(100);
  expect(notes!.x).toBeGreaterThanOrEqual(code!.x + code!.width - 1);
  await expect(page.locator("[data-note-row]").first()).toBeHidden();
  await expect(page.getByRole("button", { name: "Hide notes" })).toBeHidden();

  // Each note starts level with, or below, the line it explains.
  for (const [note, line] of [[1, 1], [2, 2], [3, 4]]) {
    const noteTop = (await page.locator(`[data-note="${note}"]`).boundingBox())!.y;
    const lineTop = (await page.locator(`[data-line="${line}"]`).boundingBox())!.y;
    expect(noteTop, `note ${note}`).toBeGreaterThanOrEqual(lineTop - 1);
  }
});

test("at 360px each note sits under its line and the list is kept for screen readers", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  for (const [note, line] of [[1, 1], [2, 2], [3, 4]]) {
    const row = page.locator(`[data-note-row="${note}"]`);
    await expect(row).toBeVisible();
    const rowTop = (await row.boundingBox())!.y;
    const lineBox = (await page.locator(`[data-line="${line}"]`).boundingBox())!;
    expect(rowTop, `note ${note} below line ${line}`).toBeGreaterThanOrEqual(lineBox.y + lineBox.height - 1);
  }
  const listBox = await page.locator("[data-notes-list]").boundingBox();
  expect(listBox === null || listBox.width <= 1).toBe(true);
});
