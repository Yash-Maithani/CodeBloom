import { expect, test } from "@playwright/test";

// Linking a margin note to its code line (DESIGN.md section 7, code block and
// ink connector; decision D19 as changed by the owner on 2026-11-03).

const LESSON = "/courses/python/decisions";
// The exact class names of a highlighted line, not the hover: or data-[term-active]: variants.
const HIGHLIGHT = /(^|\s)bg-primary-tint(\s|$)/;
const BAR = /(^|\s)border-primary(\s|$)/;

test("at 1440px the notes list is one tab stop; arrow keys move between notes, which highlight their line and draw a connector", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const block = page.locator('[data-example="python/compare"]');
  const notes = block.locator("[data-note]");
  await expect(notes).toHaveCount(4);
  // Exactly one note per list is in the tab order.
  expect(await notes.evaluateAll((items) => items.map((item) => item.getAttribute("tabindex")))).toEqual(["0", "-1", "-1", "-1"]);

  await notes.first().focus();
  await expect(block.locator('[data-line="2"]')).toHaveClass(HIGHLIGHT);
  await expect(block.locator("[data-ink-connector]")).toHaveCount(1);

  await page.keyboard.press("ArrowDown");
  await expect(notes.nth(1)).toBeFocused();
  await expect(notes.nth(1)).toHaveAttribute("tabindex", "0");
  await expect(block.locator('[data-line="3"]')).toHaveClass(HIGHLIGHT);
  await expect(block.locator('[data-line="2"]')).not.toHaveClass(BAR);
  await page.keyboard.press("End");
  await expect(notes.nth(3)).toBeFocused();
  await page.keyboard.press("Home");
  await expect(notes.nth(0)).toBeFocused();

  // Screen readers hear the line number first.
  await expect(notes.nth(0)).toContainText("Line 2:");

  // Leaving the list removes the highlight and the connector.
  await page.keyboard.press("Tab");
  await expect(block.locator("[data-ink-connector]")).toHaveCount(0);
});

test("hovering a note draws the connector; with reduced motion it appears without animating", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const block = page.locator('[data-example="python/compare"]');
  await block.locator('[data-note="3"]').hover();
  await expect(block.locator('[data-line="4"]')).toHaveClass(HIGHLIGHT);
  const animation = await block.locator("[data-ink-connector] g").evaluate((g) => getComputedStyle(g).animationName);
  expect(animation).toBe("none");
});

test("at 360px notes are not tab stops and no connector is drawn", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const block = page.locator('[data-example="python/compare"]');
  expect(await block.locator("[data-note]").evaluateAll((items) => items.filter((item) => item.hasAttribute("tabindex")).length)).toBe(0);
  await expect(block.locator("[data-ink-connector]")).toHaveCount(0);
});
