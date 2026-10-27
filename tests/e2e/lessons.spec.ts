import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";
import { normalizeLineEndings } from "../../src/lib/line-endings.ts";

// Lesson pages and course navigation (SPEC.md FR-C1, FR-C2, FR-L4, FR-L5).

const COURSES = {
  c: { name: "C", lessons: [["/courses/c/first-program", "Your first C program"], ["/courses/c/variables", "Variables and data types"]] },
  python: {
    name: "Python",
    lessons: [
      ["/courses/python/first-program", "Your first Python program"],
      ["/courses/python/variables", "Variables and data types"],
      ["/courses/python/input-output", "Input and output"],
      ["/courses/python/decisions", "Making decisions with if and else"],
      ["/courses/python/elif", "More decisions with elif"],
      ["/courses/python/loops", "Loops: while and for"],
      ["/courses/python/functions", "Functions"],
      ["/courses/python/lists", "Lists"],
    ],
  },
} as const;
const LESSON_PAGES = Object.values(COURSES).flatMap((course) => course.lessons.map(([href]) => href));
const EXTENSIONS: Record<string, string> = { c: ".c", python: ".py" };

/** A file as the page shows it: \n line endings, without the final newline. */
const fileText = (path: string) => normalizeLineEndings(readFileSync(path, "utf8")).replace(/\n$/, "");

function expectationFile(id: string): { path: string; kind: string } {
  for (const [suffix, kind] of [[".expected.txt", "output"], [".compile-error.txt", "compile-error"], [".run-error.txt", "run-error"]]) {
    const path = `content/examples/${id}${suffix}`;
    try {
      readFileSync(path);
      return { path, kind };
    } catch {
      // try the next kind
    }
  }
  throw new Error(`no expectation file for ${id}`);
}

async function codeLines(page: Page, figure: ReturnType<Page["locator"]>) {
  return figure.locator("pre[role=region] [data-line]").evaluateAll((spans) => spans.map((span) => span.lastElementChild?.textContent ?? ""));
}

// ---------- course pages ----------

for (const [slug, course] of Object.entries(COURSES)) {
  test(`/courses/${slug} lists exactly its published lessons, in order, with objectives`, async ({ page }) => {
    await page.goto(`/courses/${slug}`);
    const items = page.locator("[data-lessons] > li");
    await expect(items.getByRole("link")).toHaveText(course.lessons.map(([, title]) => title));
    for (const [index, [href]] of course.lessons.entries()) {
      await expect(items.nth(index).getByRole("link")).toHaveAttribute("href", href);
      await expect(items.nth(index).locator("p")).toHaveText(/\S/);
    }
    // Planned topics are plain text, and a published topic is not listed again.
    await expect(page.locator("[data-planned-topics] a")).toHaveCount(0);
    for (const [, title] of course.lessons) await expect(page.locator("[data-planned-topics]")).not.toContainText(title);
    await expect(page.getByText("No lessons yet")).toHaveCount(0);

    await page.getByRole("link", { name: "Start the first lesson" }).click();
    await expect(page).toHaveURL(new RegExp(`${course.lessons[0][0]}$`));
  });
}

test("Python's planned topics start with Strings now that loops, functions and lists are published, and the replaced topic is gone", async ({ page }) => {
  await page.goto("/courses/python");
  const planned = page.locator("[data-planned-topics] li");
  await expect(planned.first()).toContainText("Strings");
  await expect(planned.filter({ hasText: "Loops: while and for" })).toHaveCount(0);
  await expect(planned.filter({ hasText: "More decisions with elif" })).toHaveCount(0);
  await expect(planned.filter({ hasText: "Decisions with if, elif and else" })).toHaveCount(0);
});

for (const slug of ["cpp", "java"]) {
  test(`/courses/${slug} has no lessons yet and says so`, async ({ page }) => {
    await page.goto(`/courses/${slug}`);
    await expect(page.getByText("No lessons yet")).toBeVisible();
    await expect(page.locator("[data-lessons]")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Start the first lesson" })).toHaveCount(0);
    await expect(page.locator("[data-planned-topics] li").first()).toBeVisible();
  });
}

test("course cards show the real number of published lessons", async ({ page }) => {
  await page.goto("/courses");
  const status = (name: string) => page.locator("article").filter({ has: page.getByRole("link", { name, exact: true }) }).locator("p").last();
  await expect(status("C")).toHaveText("2 lessons published");
  await expect(status("Python")).toHaveText("8 lessons published");
  await expect(status("C++")).toHaveText("No lessons published yet");
  await expect(status("Java")).toHaveText("No lessons published yet");
});

// ---------- previous and next ----------

for (const [slug, course] of Object.entries(COURSES)) {
  test(`${course.name}: next and previous follow the published lessons, with no previous on the first and no next on the last`, async ({ page }) => {
    const nav = page.getByRole("navigation", { name: "Lesson navigation" });
    const lessons = course.lessons;
    const first = lessons[0];
    const last = lessons[lessons.length - 1];

    // Every lesson links to the next one in topic order, and every next lesson links back.
    for (const [index, [href]] of lessons.entries()) {
      await page.goto(href);
      if (index === 0) await expect(nav.getByRole("link", { name: /Previous lesson/ })).toHaveCount(0);
      else await expect(nav.getByRole("link", { name: /Previous lesson/ })).toHaveAttribute("href", lessons[index - 1][0]);
      if (index === lessons.length - 1) await expect(nav.getByRole("link", { name: /Next lesson/ })).toHaveCount(0);
      else await expect(nav.getByRole("link", { name: /Next lesson/ })).toHaveAttribute("href", lessons[index + 1][0]);
    }

    await page.goto(first[0]);
    if (lessons.length > 1) {
      await nav.getByRole("link", { name: `Next lesson ${lessons[1][1]}` }).click();
      await expect(page).toHaveURL(new RegExp(`${lessons[1][0]}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(lessons[1][1]);
    }

    await page.goto(last[0]);
    await expect(nav.getByRole("link", { name: /Next lesson/ })).toHaveCount(0);
    await expect(nav).toContainText(`This is the last published lesson in the ${course.name} course.`);
    await nav.getByRole("link", { name: `Back to the ${course.name} course` }).click();
    await expect(page).toHaveURL(new RegExp(`/courses/${slug}$`));

    await page.goto(last[0]);
    await nav.getByRole("link", { name: `Previous lesson ${lessons[lessons.length - 2][1]}` }).click();
    await expect(page).toHaveURL(new RegExp(`${lessons[lessons.length - 2][0]}$`));
  });
}

test("unknown lesson addresses return the 404 page", async ({ page }) => {
  for (const path of ["/courses/c/no-such-lesson", "/courses/cpp/variables", "/courses/python/strings"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
  }
});

// ---------- what each lesson shows ----------

for (const path of LESSON_PAGES) {
  test(`${path}: every code block, output and error message is exactly its checked file`, async ({ page }) => {
    await page.goto(path);
    const figures = page.locator("figure[data-example]");
    const count = await figures.count();
    expect(count).toBeGreaterThan(3);

    for (let index = 0; index < count; index++) {
      const figure = figures.nth(index);
      const id = (await figure.getAttribute("data-example"))!;
      const [language] = id.split("/");
      expect((await codeLines(page, figure)).join("\n"), `${id} code`).toBe(fileText(`content/examples/${id}${EXTENSIONS[language]}`));

      const { path: resultPath, kind } = expectationFile(id);
      // A practice question's solution sits in the same question item as its code.
      const question = await figure.evaluate((f) => f.closest("li[data-question]")?.getAttribute("data-question") ?? null);
      const solution = page.locator(`li[data-question="${question}"] details[data-solution]`);
      if (question !== null) {
        // Practice: the output is hidden until the learner opens the solution.
        await expect(figure.locator("[data-output]")).toHaveCount(0);
        await expect(solution.locator("[data-output]")).toBeHidden();
        await solution.locator("summary").click();
        await expect(solution.locator(`[data-output="${kind}"]`)).toHaveText(fileText(resultPath), { useInnerText: true });
      } else {
        await expect(figure.locator(`[data-output="${kind}"]`), `${id} result`).toHaveText(fileText(resultPath), { useInnerText: true });
      }
    }
  });

  test(`${path}: structure, honest labels and unique names for screen readers`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByText("Goal:")).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Recap" })).toBeVisible();
    await expect(page.getByRole("link", { name: /course$/ }).first()).toBeVisible();

    const names = await page.locator("pre[role=region]").evaluateAll((regions) => regions.map((r) => r.getAttribute("aria-label")));
    expect(new Set(names).size, `region names: ${names.join(" | ")}`).toBe(names.length);

    // Examples meant to fail are labeled as mistakes, and only inside "Common mistakes".
    const mistakes = page.locator("section[aria-label^='Common mistake:']");
    const labels = await page.locator("figure[data-example]").evaluateAll((figures) =>
      figures.map((f) => ({ mistake: f.textContent?.includes("Example with a mistake"), inMistakes: !!f.closest("section[aria-label^='Common mistake:']") })),
    );
    for (const label of labels) expect(label.mistake ? label.inMistakes : true).toBe(true);
    expect(await mistakes.count()).toBeGreaterThan(0);
  });
}

test("Show solution opens and closes from the keyboard, and its label says what it will do", async ({ page }) => {
  await page.goto("/courses/python/variables");
  const solution = page.locator("details[data-solution]").first();
  const summary = solution.locator("summary");
  await expect(summary).toHaveText("Show solution", { useInnerText: true });
  await expect(summary).toHaveAccessibleName("Show solution");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(solution).toHaveAttribute("open", "");
  await expect(summary).toHaveText("Hide solution", { useInnerText: true });
  await expect(summary).toHaveAccessibleName("Hide solution");
  await expect(solution.locator("[data-output]")).toBeVisible();
  await page.keyboard.press("Space");
  await expect(solution).not.toHaveAttribute("open");
  await expect(summary).toHaveText("Show solution", { useInnerText: true });
});

test("the shared idea links the same lesson in the other language, both ways", async ({ page }) => {
  await page.goto("/courses/python/variables");
  await page.getByText("This part is the same in the").getByRole("link", { name: "C lesson" }).click();
  await expect(page).toHaveURL(/\/courses\/c\/variables$/);
  await page.getByText("This part is the same in the").getByRole("link", { name: "Python lesson" }).click();
  await expect(page).toHaveURL(/\/courses\/python\/variables$/);
  await page.goto("/courses/python/decisions");
  await expect(page.getByText("This part is the same in the")).toHaveCount(0);
});

test("the shared idea is the same text on both Variables pages", async ({ page }) => {
  const idea = async (path: string) => {
    await page.goto(path);
    return page.locator("section[aria-labelledby=the-idea] p:not(.text-ink-muted)").allInnerTexts();
  };
  const python = await idea("/courses/python/variables");
  expect(python.length).toBe(4);
  expect(await idea("/courses/c/variables")).toEqual(python);
});

test("the C Variables lesson links to the first C lesson", async ({ page }) => {
  await page.goto("/courses/c/variables");
  await page.getByRole("main").getByRole("link", { name: "Your first C program" }).first().click();
  await expect(page).toHaveURL(/\/courses\/c\/first-program$/);
});

test("the homepage example links to the lesson it comes from", async ({ page }) => {
  await page.goto("/");
  await page.getByText("This example comes from the lesson").getByRole("link", { name: "Making decisions with if and else" }).click();
  await expect(page).toHaveURL(/\/courses\/python\/decisions$/);
});
