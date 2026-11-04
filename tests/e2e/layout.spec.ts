import { expect, test } from "@playwright/test";
import { pythonDecisions } from "../../content/lessons/python/decisions.ts";

// The annotated code block on its lesson page (the homepage shows a figure).
const VOTE = '[data-example="python/vote"]';
const voteNotes = pythonDecisions.examples.vote.notes;

// Responsive and theme checks at 360px and 1440px, light and dark.
// Screenshots are attached to the test report (not committed).

const PAGES = ["/", "/courses", "/courses/c", "/courses/c/first-program", "/courses/python/variables"];
// The canvas token from DESIGN.md section 2: #F7F4EE light, #0F1D1A dark.
const CANVAS = { light: "rgb(247, 244, 238)", dark: "rgb(15, 29, 26)" };

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
        expect(layout.background).toBe(CANVAS[theme]);
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
for (const path of ["/courses/c/first-program", "/courses/c/variables", "/courses/c/numbers", "/courses/c/printf-scanf", "/courses/c/decisions", "/courses/c/else-if", "/courses/c/conditions", "/courses/c/loops", "/courses/c/functions", "/courses/c/arrays", "/courses/c/strings", "/courses/c/pointers", "/courses/c/structures", "/courses/c/files", "/courses/python/first-program", "/courses/python/variables", "/courses/python/input-output", "/courses/python/decisions", "/courses/python/elif", "/courses/python/loops", "/courses/python/functions", "/courses/python/lists", "/courses/python/strings", "/courses/python/dictionaries", "/courses/python/files", "/courses/python/numbers", "/courses/python/conditions"]) {
  for (const width of [320, 768, 1024]) {
    test(`${path} at ${width}px: no horizontal scroll, solutions open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // Open every visible disclosure (the solutions). The step rail's phone disclosure is hidden from 1024px on purpose.
      for (const summary of await page.locator("details summary").filter({ visible: true }).all()) await summary.click();
      const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
      expect(scrollWidth, "page must not scroll sideways").toBeLessThanOrEqual(innerWidth);
    });
  }
}

test("at 1440px the notes sit in a column beside the code", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/courses/python/decisions");
  const block = page.locator(VOTE);
  const code = await block.locator("pre[role=region]:has([data-line])").boundingBox();
  const notes = await block.locator("[data-notes-list]").boundingBox();
  expect(notes!.width).toBeGreaterThan(100);
  expect(notes!.x).toBeGreaterThanOrEqual(code!.x + code!.width - 1);
  await expect(block.locator("[data-note-row]").first()).toBeHidden();
  await expect(block.getByRole("button", { name: "Hide notes" })).toBeHidden();

  // Each note starts level with, or below, the line it explains.
  for (const [index, note] of voteNotes.entries()) {
    const noteTop = (await block.locator(`[data-note="${index + 1}"]`).boundingBox())!.y;
    const lineTop = (await block.locator(`[data-line="${note.startLine}"]`).boundingBox())!.y;
    expect(noteTop, `note ${index + 1}`).toBeGreaterThanOrEqual(lineTop - 1);
  }
});

test("at 360px each note sits under its line and the list is kept for screen readers", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/courses/python/decisions");
  const block = page.locator(VOTE);
  for (const [index, note] of voteNotes.entries()) {
    const row = block.locator(`[data-note-row="${index + 1}"]`);
    await expect(row).toBeVisible();
    const rowTop = (await row.boundingBox())!.y;
    const lineBox = (await block.locator(`[data-line="${note.startLine}"]`).boundingBox())!;
    expect(rowTop, `note ${index + 1} below line ${note.startLine}`).toBeGreaterThanOrEqual(lineBox.y + lineBox.height - 1);
  }
  const listBox = await block.locator("[data-notes-list]").boundingBox();
  expect(listBox === null || listBox.width <= 1).toBe(true);
});
