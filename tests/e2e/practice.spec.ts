import { readFileSync } from "node:fs";
import { expect, test, type Locator } from "@playwright/test";
import { normalizeLineEndings } from "../../src/lib/line-endings.ts";

// Interactive practice (SPEC.md FR-P1 to FR-P5, DESIGN.md "Quiz and feedback").

const LESSONS = ["/courses/c/first-program", "/courses/c/variables", "/courses/c/numbers", "/courses/c/printf-scanf", "/courses/c/decisions", "/courses/c/else-if", "/courses/c/conditions", "/courses/c/loops", "/courses/c/functions", "/courses/c/arrays", "/courses/c/strings", "/courses/c/pointers", "/courses/c/structures", "/courses/python/first-program", "/courses/python/variables", "/courses/python/input-output", "/courses/python/decisions", "/courses/python/elif", "/courses/python/loops", "/courses/python/functions", "/courses/python/lists", "/courses/python/strings", "/courses/python/dictionaries", "/courses/python/files", "/courses/python/numbers", "/courses/python/conditions"];
const verified = (id: string) => normalizeLineEndings(readFileSync(`content/examples/${id}.expected.txt`, "utf8")).replace(/\n$/, "");

const question = (page: import("@playwright/test").Page, n: number) => page.locator(`li[data-question="${n}"]`);
// The visible text of each line: the last child is a text node, except on an empty
// line, where only the screen-reader-only "Line N:" label is there.
const optionLines = (option: Locator) =>
  option.locator("span.block > span.block").evaluateAll((spans) => spans.map((s) => (s.lastChild?.nodeType === Node.TEXT_NODE ? (s.lastChild.textContent ?? "") : "")));

test("a wrong answer says Not quite with that option's own explanation, then the correct answer says Correct", async ({ page }) => {
  await page.goto("/courses/python/decisions");
  const q = question(page, 1);
  const status = q.locator("[data-feedback-region]");

  await q.getByRole("radio", { name: "Delivery fee: 5", exact: true }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(status.locator("[data-feedback=wrong]")).toContainText("Not quite");
  await expect(status).toContainText("Line 4 is indented, so it belongs to the if and is skipped too.");
  await expect(status).toContainText("Try again, or show a hint.");

  // A different wrong answer gets a different, specific explanation.
  await q.getByRole("radio", { name: "Nothing is printed" }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(status).toContainText("Line 6 is not indented");

  await expect(q.locator("[data-status]")).toHaveCount(0);
  await q.getByRole("radio", { name: "Delivery fee: 0", exact: true }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(status.locator("[data-feedback=correct]")).toContainText("Correct");
  await expect(q.locator("[data-status]")).toHaveText("Answered correctly");
  await expect(page.locator("[data-practice-summary]")).toHaveText("1 of 3 questions answered correctly on this page");
});

test("checking with nothing chosen says what to do, and counts nothing", async ({ page }) => {
  await page.goto("/courses/c/variables");
  const q = question(page, 3);
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(q.locator("[data-feedback-region]")).toHaveText("Choose an answer first.");
  await expect(page.locator("[data-practice-summary]")).toHaveText("0 of 3 questions answered correctly on this page");
});

test("answering the same question correctly twice counts it once", async ({ page }) => {
  await page.goto("/courses/c/variables");
  const q = question(page, 3);
  await q.getByRole("radio", { name: "apples = 10;", exact: true }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(page.locator("[data-practice-summary]")).toHaveText("1 of 3 questions answered correctly on this page");
});

test("hints appear one at a time, stay visible, and the button goes after the last one", async ({ page }) => {
  await page.goto("/courses/python/variables");
  const q = question(page, 1);
  const hints = q.locator("[data-hints] li");
  await expect(hints).toHaveCount(0);
  for (const n of [1, 2, 3]) {
    await q.getByRole("button", { name: `Show hint ${n} of 3` }).click();
    await expect(hints).toHaveCount(n);
    await expect(hints.nth(n - 1)).toContainText(`Hint ${n}:`);
  }
  await expect(q.getByRole("button", { name: /Show hint/ })).toHaveCount(0);
  // Keyboard focus is not lost when the button disappears: it moves to Check answer.
  await expect(q.getByRole("button", { name: "Check answer" })).toBeFocused();
  await expect(q.locator("[data-hints]")).toHaveAttribute("aria-live", "polite");
});

test("keyboard only: arrow keys choose, Enter checks, the result is announced in the live region", async ({ page }) => {
  await page.goto("/courses/c/first-program");
  const q = question(page, 2);
  const first = q.getByRole("radio").first();
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(q.getByRole("radio").nth(2)).toBeChecked();
  await page.keyboard.press("Tab");
  // Tab leaves the radio group (one stop per group) and reaches Check answer.
  await expect(q.getByRole("button", { name: "Check answer" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(q.locator("[data-feedback-region]")).toContainText("Correct");
  await page.keyboard.press("Tab");
  await expect(q.getByRole("button", { name: "Show hint 1 of 2" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(q.locator("[data-hints] li")).toHaveCount(1);
});

test("each question is a fieldset named by its question, and options are radios named by their text", async ({ page }) => {
  await page.goto("/courses/c/first-program");
  const group = page.getByRole("group", { name: /^Question 1\. What does this program print\?/ });
  await expect(group).toHaveCount(1);
  await expect(group.getByRole("radio")).toHaveCount(3);
  // Multi-line output is read with line numbers, so it cannot be misheard as one line.
  await expect(group.getByRole("radio", { name: "Line 1: Good morning Line 2: everyone" })).toHaveCount(1);
});

test("multi-line output options are real separate lines in monospace", async ({ page }) => {
  await page.goto("/courses/c/first-program");
  const options = question(page, 1).locator("label");
  expect(await optionLines(options.nth(0))).toEqual(["Good", "morning", "everyone"]);
  expect(await optionLines(options.nth(1))).toEqual(["Good morning", "everyone"]);
  const font = await options.nth(1).locator("span.font-mono").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(font).toMatch(/Atkinson Hyperlegible Mono/);
});

for (const path of LESSONS) {
  test(`${path}: every predict-the-output question's correct option is its verified output`, async ({ page }) => {
    await page.goto(path);
    const questions = page.locator("li[data-question]");
    for (let i = 0; i < (await questions.count()); i++) {
      const q = questions.nth(i);
      if ((await q.locator("figure[data-example]").count()) === 0) continue; // a choice question
      const id = (await q.locator("figure[data-example]").getAttribute("data-example"))!;
      // Find the correct option by trying each one; only the verified output may say Correct.
      const labels = q.locator("label");
      let correct: string[] | null = null;
      for (let o = 0; o < (await labels.count()); o++) {
        await labels.nth(o).click();
        await q.getByRole("button", { name: "Check answer" }).click();
        if ((await q.locator("[data-feedback]").getAttribute("data-feedback")) === "correct") {
          expect(correct, `${id}: only one option is correct`).toBeNull();
          correct = await optionLines(labels.nth(o));
        }
      }
      expect(correct?.join("\n"), id).toBe(verified(id));
    }
  });
}

test("the solution can be opened at any time and shows the verified output", async ({ page }) => {
  await page.goto("/courses/python/variables");
  const q = question(page, 2);
  await q.locator("summary").click();
  await expect(q.locator("details [data-output=output]")).toHaveText(verified("python/practice_quotes"));
  // Opening the solution does not count as answering.
  await expect(page.locator("[data-practice-summary]")).toHaveText("0 of 3 questions answered correctly on this page");
});

test("a choice question's solution names the answer", async ({ page }) => {
  await page.goto("/courses/python/decisions");
  const q = question(page, 3);
  await q.locator("summary").click();
  await expect(q.locator("details")).toContainText("Answer: if age == 18:");
});

test("nothing about answers is stored: a reload starts fresh", async ({ page }) => {
  await page.goto("/courses/c/variables");
  const q = question(page, 3);
  await q.getByRole("radio", { name: "apples = 10;", exact: true }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(page.locator("[data-practice-summary]")).toHaveText(/^1 of 3/);
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.reload();
  await expect(page.locator("[data-practice-summary]")).toHaveText(/^0 of 3/);
});

test("checking the same option again announces the result again, and a new choice clears old feedback", async ({ page }) => {
  await page.goto("/courses/c/variables");
  const q = question(page, 1);
  const region = q.locator("[data-feedback-region]");
  await q.getByRole("radio", { name: "10", exact: true }).check();
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect(region).toContainText("Not quite");
  // Count what is added to the live region, which is what screen readers announce.
  await region.evaluate((el) => {
    (window as unknown as { added: number }).added = 0;
    new MutationObserver((records) => {
      for (const r of records) (window as unknown as { added: number }).added += r.addedNodes.length;
    }).observe(el, { childList: true, subtree: true });
  });
  await q.getByRole("button", { name: "Check answer" }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { added: number }).added)).toBeGreaterThan(0);
  await q.getByRole("radio", { name: "15", exact: true }).check();
  await expect(region.locator("[data-feedback]")).toHaveCount(0);
});

test("the hints list is in the page before the first hint, so its first hint is announced", async ({ page }) => {
  await page.goto("/courses/python/variables");
  const list = question(page, 1).locator("[data-hints]");
  await expect(list).toHaveAttribute("aria-live", "polite");
  await expect(list.locator("li")).toHaveCount(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("Check answer and hint buttons are hidden and unfocusable; options and Show solution still work", async ({ page }) => {
    await page.goto("/courses/python/decisions");
    const q = question(page, 1);
    await expect(q.getByRole("button", { name: "Check answer" })).toBeHidden();
    await expect(q.getByRole("radio")).toHaveCount(4);
    await q.locator("summary").click();
    await expect(q.locator("details [data-output=output]")).toHaveText(verified("python/practice_fee"));
  });
});
