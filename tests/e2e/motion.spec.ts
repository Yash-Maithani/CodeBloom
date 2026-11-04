import { expect, test, type Page } from "@playwright/test";

// Motion that gives feedback (DESIGN.md sections 6 and 7): the bloom beside a
// correct answer and the fade-in of feedback. Both are off with reduced motion,
// and nothing about the answer depends on them.

async function answerCorrectly(page: Page) {
  await page.goto("/courses/python/decisions", { waitUntil: "networkidle" });
  const q = page.locator('li[data-question="1"]');
  await q.getByRole("radio", { name: "Delivery fee: 0", exact: true }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  return q;
}

test("a correct answer shows the bloom beside Correct, once per check, hidden from screen readers", async ({ page }) => {
  const q = await answerCorrectly(page);
  const bloom = q.locator("[data-feedback=correct] [data-bloom]");
  await expect(bloom).toHaveCount(1);
  await expect(bloom).toHaveAttribute("aria-hidden", "true");
  expect(await bloom.evaluate((el) => getComputedStyle(el).animationName)).toBe("bloom");
  expect(await q.locator("[data-feedback=correct]").evaluate((el) => getComputedStyle(el).animationName)).toBe("appear");
  // A wrong answer never blooms.
  await q.getByRole("radio", { name: "Nothing is printed" }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(q.locator("[data-bloom]")).toHaveCount(0);
});

test("with reduced motion the bloom and the feedback appear without animating", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const q = await answerCorrectly(page);
  await expect(q.locator("[data-feedback=correct]")).toContainText("Correct");
  expect(await q.locator("[data-bloom]").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  expect(await q.locator("[data-feedback=correct]").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});
