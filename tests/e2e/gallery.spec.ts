import { expect, test } from "@playwright/test";

// The component gallery (/dev/components): a development page that shows every
// component and state in light and dark, built from real lesson content.

test("the gallery opens, is not indexed, and shows every section in light and dark", async ({ page }) => {
  const response = await page.goto("/dev/components", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  for (const id of ["buttons", "cards", "chips", "callouts", "code", "typed", "figure", "explorer", "rail", "marks", "mistake", "practice"]) {
    const section = page.locator(`section:has(h2#${id})`);
    await expect(section, id).toHaveCount(1);
    await expect(section.locator('[data-theme="light"]'), `${id} light`).toHaveCount(1);
    await expect(section.locator('[data-theme="dark"]'), `${id} dark`).toHaveCount(1);
  }
  // The preview compares the current page (a screenshot) with the new components.
  const preview = page.locator("section:has(h2#preview)");
  await expect(preview.locator("picture img")).toHaveAttribute("alt", /current Python Decisions lesson/);
  await expect(preview.getByRole("heading", { level: 3, name: "Making decisions with if and else" })).toBeVisible();
  await expect(preview.locator("[data-step-rail]")).toHaveCount(1);
});

test("forced states render with their tokens: hover fill, pressed position, dark theme colours", async ({ page }) => {
  await page.goto("/dev/components", { waitUntil: "networkidle" });
  const light = page.locator('section:has(h2#buttons) [data-theme="light"]');
  const color = (selector: string) => light.locator(selector).first().evaluate((el) => getComputedStyle(el).backgroundColor);
  // action #F4C542, action-hover #E3B22C (DESIGN.md section 2)
  expect(await color("button:not([data-state]):not([aria-disabled])")).toBe("rgb(244, 197, 66)");
  expect(await color('button[data-state="hover"]')).toBe("rgb(227, 178, 44)");
  // Tailwind 4 moves elements with the translate property.
  expect(await light.locator('button[data-state="pressed"]').first().evaluate((el) => getComputedStyle(el).translate)).not.toBe("none");
  // The dark panel really uses the dark surface (#172925).
  const dark = page.locator('section:has(h2#cards) [data-theme="dark"] article').first();
  expect(await dark.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgb(23, 41, 37)");
});

test("the figure's path and chip come from the vote trace, and predict then run hides the output until Show", async ({ page }) => {
  await page.goto("/dev/components", { waitUntil: "networkidle" });
  const figure = page.locator('section:has(h2#figure) [data-theme="light"] [data-figure]');
  await expect(figure.locator("[data-path-step]")).toHaveText(["Line 1 ran", "Line 2 ran", "Line 3 skipped", "Line 5 ran"]);
  await expect(figure.locator('[data-line="2"]')).toContainText("False");
  // Syntax colours work in the server-rendered figure too: 17 is a literal (#8A4B00).
  expect(await figure.locator('[data-line="1"] [data-code-text] span').filter({ hasText: "17" }).evaluate((el) => getComputedStyle(el).color)).toBe("rgb(138, 75, 0)");
  // Only the condition line has a chip.
  expect(await figure.locator("[data-line] .rounded-chip").count()).toBe(1);
  await expect(figure.getByText("Think about what line 5 prints, then press Show.")).toBeVisible();
  await expect(figure.locator('[data-predict="waiting"] pre')).toBeHidden();
  await figure.getByRole("button", { name: "Show" }).click();
  await expect(figure.locator('[data-predict="shown"] pre')).toHaveText("Not yet");
});

test("the gallery explorers are the lessons' verified variants: four ages and three pointer targets", async ({ page }) => {
  await page.goto("/dev/components", { waitUntil: "networkidle" });
  const light = page.locator('section:has(h2#explorer) [data-theme="light"]');
  const slider = light.locator('[data-explorer="python/vote"]').getByRole("slider");
  await expect(slider).toBeEnabled();
  await expect(slider).toHaveAttribute("max", "3");
  await expect(light.locator('[data-explorer="c/explore_target"]').getByRole("radio")).toHaveCount(3);
});

test("nothing links to the gallery", async ({ page }) => {
  for (const path of ["/", "/courses", "/courses/python/decisions", "/playground"]) {
    await page.goto(path);
    await expect(page.locator('a[href^="/dev"]'), path).toHaveCount(0);
  }
});
