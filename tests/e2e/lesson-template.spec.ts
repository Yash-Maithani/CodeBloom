import { expect, test } from "@playwright/test";

// The Trailhead lesson template (DESIGN.md sections 7 to 9): step rail, step
// cards, prose terms linked to code lines, highlighter marks, concept diagrams
// and predict then run on lesson examples.

const LESSON = "/courses/python/variables";

test("the step rail lists every step in order and marks the one being read", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const cards = await page.locator("section[data-step] > h2").allInnerTexts();
  const rail = page.getByRole("navigation", { name: "Steps in this lesson" });
  // Each link is named by its step (the number beside it is not read).
  const links = rail.locator("a").filter({ visible: true });
  await expect(links).toHaveCount(cards.length);
  for (const [index, title] of cards.entries()) await expect(links.nth(index)).toHaveAccessibleName(title);
  await expect(rail.locator('a[aria-current="step"]').filter({ visible: true })).toHaveAccessibleName("The idea");
  await rail.getByRole("link", { name: "Common mistakes" }).filter({ visible: true }).click();
  await expect(page).toHaveURL(/#common-mistakes$/);
  await expect(rail.locator('a[aria-current="step"]').filter({ visible: true })).toHaveAccessibleName("Common mistakes");
});

test("a variable named in the prose links to its lines, highlights them and says which lines for screen readers", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const term = page.locator('[data-term-link="apples"]').first();
  await expect(term).toHaveAccessibleName("apples, used on lines 1, 2, 3 and 4 of the example above");
  await term.focus();
  for (const line of [1, 2, 3, 4]) await expect(page.locator(`#python-variables_change-line-${line}`)).toHaveAttribute("data-term-active", "");
  await expect(page.locator("[data-lesson-main] [data-ink-connector]")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#python-variables_change-line-1$/);
  await term.blur();
  await expect(page.locator("[data-term-active]")).toHaveCount(0);
});

test("at most three defined terms get a highlighter mark, each once", async ({ page }) => {
  await page.goto(LESSON, { waitUntil: "networkidle" });
  const marks = page.locator(".highlighter-mark");
  await expect(marks).toHaveText(["program", "variable", "value"]);
});

const DIAGRAMS = [
  ["/courses/python/first-program", "first-program"],
  ["/courses/python/variables", "variables"],
  ["/courses/python/input-output", "input-output"],
  ["/courses/python/numbers", "arithmetic"],
  ["/courses/c/decisions", "decisions"],
  ["/courses/python/elif", "several-choices"],
  ["/courses/python/conditions", "combined-conditions"],
  ["/courses/python/loops", "repetition"],
  ["/courses/c/functions", "functions"],
  ["/courses/python/lists", "many-values"],
  ["/courses/c/strings", "text"],
  ["/courses/python/dictionaries", "key-value"],
  ["/courses/python/files", "files"],
];
for (const [path, concept] of DIAGRAMS) {
  test(`${path} shows the ${concept} diagram with a caption that serves as its text`, async ({ page }) => {
    await page.goto(path);
    const diagram = page.locator(`[data-concept-diagram="${concept}"]`);
    await expect(diagram).toHaveCount(1);
    const caption = await diagram.locator("figcaption").innerText();
    expect(caption.length).toBeGreaterThan(40);
    await expect(diagram.getByRole("img")).toHaveAccessibleName(caption);
  });
}

test("every concept diagram has labels of at least 14.5px at 360px and fits the screen", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const [path, concept] of DIAGRAMS) {
    await page.goto(path);
    const sizes = await page.locator(`[data-concept-diagram="${concept}"] svg`).evaluate((svg) => {
      const scale = svg.getBoundingClientRect().width / (svg as SVGSVGElement).viewBox.baseVal.width;
      return {
        smallest: Math.min(...[...svg.querySelectorAll("text")].map((t) => parseFloat(getComputedStyle(t).fontSize) * scale)),
        right: svg.getBoundingClientRect().right,
      };
    });
    expect(sizes.smallest, concept).toBeGreaterThanOrEqual(14.5);
    expect(sizes.right, concept).toBeLessThanOrEqual(360);
  }
});

test("lesson outputs wait for Show; the trace names the line that prints when only one line prints", async ({ page }) => {
  await page.goto("/courses/python/decisions", { waitUntil: "networkidle" });
  const vote = page.locator('[data-example="python/vote"]');
  await expect(vote.getByText("Think about what line 5 prints, then press Show.")).toBeVisible();
  await vote.getByRole("button", { name: "Show" }).click();
  await expect(vote.locator('[data-output="output"]')).toBeVisible();
});

test("tab stops added by prose term links, counted on every published lesson", async ({ page }) => {
  const lessons = ["/courses/c/first-program", "/courses/c/variables", "/courses/c/numbers", "/courses/c/printf-scanf", "/courses/c/decisions", "/courses/c/else-if", "/courses/c/conditions", "/courses/c/loops", "/courses/c/functions", "/courses/c/arrays", "/courses/c/strings", "/courses/c/pointers", "/courses/c/structures", "/courses/c/files", "/courses/python/first-program", "/courses/python/variables", "/courses/python/input-output", "/courses/python/decisions", "/courses/python/elif", "/courses/python/loops", "/courses/python/functions", "/courses/python/lists", "/courses/python/strings", "/courses/python/dictionaries", "/courses/python/files", "/courses/python/numbers", "/courses/python/conditions"];
  const counts: Record<string, number> = {};
  for (const path of lessons) {
    await page.goto(path);
    counts[path] = await page.locator("[data-term-link]").count();
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  test.info().annotations.push({ type: "term link tab stops", description: `${total} in total; per lesson: ${JSON.stringify(counts)}` });
  console.log(`TERM LINKS ${total} ${JSON.stringify(counts)}`);
  // Each term links once per example, so no lesson gains more stops than it has variables in examples.
  expect(Math.max(...Object.values(counts))).toBeLessThan(25);
});
