import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { normalizeLineEndings } from "../../src/lib/line-endings.ts";
import { pythonDecisions } from "../../content/lessons/python/decisions.ts";

// Checks that nothing on the site pretends a feature exists when it does not,
// and that every button does what it says.

const exampleCode = normalizeLineEndings(readFileSync("content/examples/python/vote.py", "utf8")).replace(/\n$/, "");
const exampleOutput = normalizeLineEndings(readFileSync("content/examples/python/vote.expected.txt", "utf8")).replace(/\n$/, "");
const COURSE_PAGES = ["/courses/c", "/courses/cpp", "/courses/java", "/courses/python"];
// The annotated code block with the same program, on its lesson page.
const LESSON = "/courses/python/decisions";
const voteNotes = pythonDecisions.examples.vote.notes;
const lineLabel = (n: { startLine: number; endLine: number }) => (n.startLine === n.endLine ? `Line ${n.startLine}: ` : `Lines ${n.startLine} to ${n.endLine}: `);

test("the homepage figure shows the checked code, its real output and the path from the recorded trace", async ({ page }) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const figure = page.locator("[data-figure]").first();
  const lines = await figure.locator("[data-line] [data-code-text]").evaluateAll((spans) => spans.map((span) => span.textContent ?? ""));
  expect(lines.join("\n")).toBe(exampleCode);
  // Predict then run: the output is hidden (inert) until Show is pressed.
  await expect(figure.getByRole("region", { name: /^Output of the real run/ })).toHaveCount(0);
  await figure.getByRole("button", { name: "Show" }).click();
  await expect(figure.getByRole("region", { name: /^Output of the real run/ })).toHaveText(exampleOutput);
  // The lines that ran are exactly the trace's lines, in order.
  const trace = JSON.parse(readFileSync("content/examples/python/vote.trace.json", "utf8")) as { steps: Array<{ line: number }> };
  await expect(figure.locator('[data-path-step="ran"]')).toHaveText(trace.steps.map((step) => `Line ${step.line} ran`));
});

test("buttons exist only where they do something: one on the homepage, none on course pages, plus the theme toggle", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  // Every page has exactly one theme toggle, in the header; theme.spec.ts tests what it does.
  const pageButtons = page.locator("main").getByRole("button");
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator("[data-theme-toggle]")).toHaveCount(1);
  await expect(page.getByRole("button")).toHaveCount(2);
  // The figure's Show button (predict then run) is the homepage's only other button.
  await expect(pageButtons).toHaveText(["Show"]);
  for (const path of ["/courses", ...COURSE_PAGES]) {
    await page.goto(path, { waitUntil: "networkidle" });
    await expect(pageButtons, path).toHaveCount(0);
    await expect(page.getByRole("button"), path).toHaveCount(1);
    await expect(page.locator("[data-theme-toggle]"), path).toHaveCount(1);
  }
});

test("Copy code puts only the code on the clipboard and says Copied", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(LESSON);
  const block = page.locator('[data-example="python/vote"]');
  await block.getByRole("button", { name: "Copy code" }).click();
  await expect(block.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect(block.getByRole("status")).toHaveText("Code copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(exampleCode);
  // Goes back to "Copy code" after two seconds.
  await expect(block.getByRole("button", { name: "Copy code" })).toBeVisible({ timeout: 4000 });
});

test("Hide notes hides the notes under the code on a phone, and Show notes brings them back", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(LESSON);
  const block = page.locator('[data-example="python/vote"]');
  const noteRows = block.locator("[data-note-row]");
  await expect(noteRows).toHaveCount(voteNotes.length);
  await block.getByRole("button", { name: "Hide notes" }).click();
  await expect(noteRows).toHaveCount(0);
  // The screen reader list is not affected by the visual toggle.
  await expect(block.locator("[data-notes-list] li")).toHaveCount(voteNotes.length);
  await block.getByRole("button", { name: "Show notes" }).click();
  await expect(noteRows).toHaveCount(voteNotes.length);
});

test("screen readers get every note with its line number", async ({ page }) => {
  await page.goto(LESSON);
  const list = page.locator('[data-example="python/vote"]').getByRole("list", { name: "Notes on this code" });
  await expect(list.getByRole("listitem")).toHaveText(voteNotes.map((note, i) => new RegExp(`^${i + 1}${lineLabel(note)}`)));
});

test("courses without lessons say so plainly; planned topics are plain text on every course page", async ({ page }) => {
  for (const path of ["/", "/courses"]) {
    await page.goto(path);
    const cards = page.locator("article");
    await expect(cards).toHaveCount(4);
    for (const name of ["C++", "Java"]) {
      await expect(cards.filter({ has: page.getByRole("link", { name, exact: true }) })).toContainText("No lessons published yet");
    }
  }

  for (const path of COURSE_PAGES) {
    await page.goto(path);
    const hasLessons = path === "/courses/c" || path === "/courses/python";
    await expect(page.getByText("No lessons yet", { exact: true }), path).toHaveCount(hasLessons ? 0 : 1);
    if (hasLessons) {
      // Every topic of these courses has a published lesson, so the whole Planned topics section is gone.
      await expect(page.locator("[data-planned-topics]")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: "Planned topics" })).toHaveCount(0);
      await expect(page.getByText(/^Planned and subject to change/)).toHaveCount(0);
      continue;
    }
    await expect(page.getByText(/^Planned and subject to change/)).toBeVisible();
    const topics = page.locator("[data-planned-topics]");
    expect(await topics.locator("li").count(), path).toBeGreaterThan(0);
    // Planned topics are plain text: no links or buttons pretending lessons exist.
    await expect(topics.locator("a, button"), path).toHaveCount(0);
  }
});

test("practice is described honestly on the homepage: feedback, hints and solutions, with nothing pretending to be there", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Practice questions" })).toBeVisible();
  await expect(page.getByText("Check your answer for instant feedback, show hints one at a time, or open the written solution.")).toBeVisible();
  await expect(page.getByText("planned.", { exact: false }).filter({ hasText: "Hints" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Step through it" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Try it in the playground" })).toBeVisible();
  for (const word of ["Start practice", "Sign up", "Log in", "Check answer"]) {
    await expect(page.getByText(word)).toHaveCount(0);
  }
});

test("on a lesson page, every code block has working Copy code and Hide notes buttons", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/courses/c/variables");
  const figures = page.locator("figure[data-example]");
  for (let index = 0; index < (await figures.count()); index++) {
    const figure = figures.nth(index);
    const id = await figure.getAttribute("data-example");
    const code = normalizeLineEndings(readFileSync(`content/examples/${id}.c`, "utf8")).replace(/\n$/, "");
    await figure.getByRole("button", { name: "Copy code" }).click();
    expect(await page.evaluate(() => navigator.clipboard.readText()), `${id} copy`).toBe(code);
    const hide = figure.getByRole("button", { name: "Hide notes" });
    if ((await hide.count()) > 0) {
      await hide.click();
      await expect(figure.locator("[data-note-row]")).toHaveCount(0);
      await figure.getByRole("button", { name: "Show notes" }).click();
    }
  }
});

test("no page says lessons are missing or still to come, now that lessons exist", async ({ page }) => {
  for (const path of ["/", "/courses", "/courses/c", "/courses/python"]) {
    await page.goto(path);
    const text = await page.locator("main").innerText();
    expect(text, path).not.toMatch(/No lessons are published yet|Lessons will explain|How each lesson will work|first lessons are being written/);
  }
});
