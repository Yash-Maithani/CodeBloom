import { expect, test } from "@playwright/test";

// Keyboard-only use (SPEC.md AR-2): skip link first, every control reachable
// with Tab, a visible 2px ink focus ring, and no keyboard trap.

test("the skip link is the first stop and moves focus to the main content", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main#main")).toBeFocused();
});

for (const width of [360, 1440]) {
  test(`at ${width}px, Tab reaches every control once, each with a visible focus ring`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const expected = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button, [tabindex='0']")]
        .filter((el) => el.offsetParent !== null || el.getAttribute("href") === "#main")
        .map((el) => el.textContent?.trim() || el.getAttribute("aria-label") || el.tagName),
    );

    const reached: string[] = [];
    for (let step = 0; step < expected.length + 2; step++) {
      await page.keyboard.press("Tab");
      const focus = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement;
        // Course card links draw their ring on the card around them.
        const ringOwner = el.closest("article") ?? el;
        const style = getComputedStyle(ringOwner);
        return {
          label: el.textContent?.trim() || el.getAttribute("aria-label") || el.tagName,
          isBody: el === document.body,
          ring: `${style.outlineWidth} ${style.outlineStyle}`,
        };
      });
      if (focus.isBody) break;
      expect(focus.ring, `focus ring on "${focus.label}"`).toBe("2px solid");
      reached.push(focus.label);
    }

    expect(reached).toEqual(expected);
  });
}

test("Enter on a course card opens that course", async ({ page }) => {
  await page.goto("/");
  await page.locator("article").getByRole("link", { name: "Python" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/courses\/python$/);
  await expect(page.getByRole("heading", { level: 1, name: "Python" })).toBeVisible();
});

test("the code block buttons work from the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await page.getByRole("button", { name: "Hide notes" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Show notes" })).toBeFocused();
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Hide notes" })).toBeFocused();
});
