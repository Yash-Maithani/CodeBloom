import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { normalizeLineEndings } from "../../src/lib/line-endings.ts";

// Checks that nothing on the site pretends a feature exists when it does not,
// and that every button does what it says.

const exampleCode = normalizeLineEndings(readFileSync("content/examples/python/vote.py", "utf8")).replace(/\n$/, "");
const exampleOutput = normalizeLineEndings(readFileSync("content/examples/python/vote.expected.txt", "utf8")).replace(/\n$/, "");
const COURSE_PAGES = ["/courses/c", "/courses/cpp", "/courses/java", "/courses/python"];

test("the homepage example shows the checked code and its real output", async ({ page }) => {
  await page.goto("/");
  const lines = await page.locator("pre[role=region] [data-line]").evaluateAll((spans) =>
    // The last child of each line holds the code; the first two are the gutter.
    spans.map((span) => span.lastElementChild?.textContent ?? ""),
  );
  expect(lines.join("\n")).toBe(exampleCode);
  await expect(page.locator("figure pre").last()).toHaveText(exampleOutput);
});

test("buttons exist only where they do something: two on the homepage, none on course pages", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  await expect(page.getByRole("button")).toHaveText(["Hide notes", "Copy code"]);
  for (const path of ["/courses", ...COURSE_PAGES]) {
    await page.goto(path);
    await expect(page.getByRole("button"), path).toHaveCount(0);
  }
});

test("Copy code puts only the code on the clipboard and says Copied", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Code copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(exampleCode);
  // Goes back to "Copy code" after two seconds.
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible({ timeout: 4000 });
});

test("Hide notes hides the notes under the code on a phone, and Show notes brings them back", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/");
  const noteRows = page.locator("[data-note-row]");
  await expect(noteRows).toHaveCount(3);
  await page.getByRole("button", { name: "Hide notes" }).click();
  await expect(noteRows).toHaveCount(0);
  // The screen reader list is not affected by the visual toggle.
  await expect(page.locator("[data-notes-list] li")).toHaveCount(3);
  await page.getByRole("button", { name: "Show notes" }).click();
  await expect(noteRows).toHaveCount(3);
});

test("screen readers get every note with its line number", async ({ page }) => {
  await page.goto("/");
  const list = page.getByRole("list", { name: "Notes on this code" });
  await expect(list.getByRole("listitem")).toHaveText([/^1Line 1: /, /^2Line 2: /, /^3Lines 4 to 5: /]);
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
    await expect(page.getByText(/^Planned and subject to change/)).toBeVisible();
    const topics = page.locator("[data-planned-topics]");
    expect(await topics.locator("li").count(), path).toBeGreaterThan(0);
    // Planned topics are plain text: no links or buttons pretending lessons exist.
    await expect(topics.locator("a, button"), path).toHaveCount(0);
  }
});

test("practice is described honestly: written solutions now, hints and feedback planned", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Practice questions" })).toBeVisible();
  await expect(page.getByText("Hints and instant feedback are planned.")).toBeVisible();
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
