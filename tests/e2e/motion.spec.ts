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

test("step-through: the highlight slides to the line that ran, and a changed value fades in; reduced motion makes both instant", async ({ page }) => {
  await page.goto("/courses/python/loops", { waitUntil: "networkidle" });
  const visual = page.locator('[data-visual="count"]');
  const bar = visual.locator("[data-highlight-bar]");
  await expect(bar).toHaveClass(/opacity-0/);
  const next = visual.getByRole("button", { name: "Next step" });
  await next.click();
  // Step 1 gives count its first value: it fades and settles in.
  const changed = visual.locator("[data-variable] .appear");
  await expect(changed.first()).toBeVisible();
  expect(await changed.first().evaluate((el) => getComputedStyle(el).animationName)).toBe("appear");
  await next.click();
  // The bar sits on the current line, moved with transform only.
  const current = visual.locator("[data-trace-line][data-current]");
  await expect.poll(async () => {
    const [barTop, lineTop] = await Promise.all([bar.evaluate((el) => el.getBoundingClientRect().top), current.evaluate((el) => el.getBoundingClientRect().top)]);
    return Math.round(barTop - lineTop);
  }).toBe(0);
  const style = await bar.evaluate((el) => ({ property: getComputedStyle(el).transitionProperty, duration: getComputedStyle(el).transitionDuration, transform: getComputedStyle(el).transform }));
  expect(style.property).toBe("transform, opacity");
  expect(style.duration).toBe("0.2s");
  expect(style.transform).toMatch(/^matrix\(1, 0, 0, 1, 0, [\d.]+\)$/);

  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await bar.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
  await visual.getByRole("button", { name: "Start again" }).click();
  await next.click();
  expect(await visual.locator("[data-variable] .appear").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});
