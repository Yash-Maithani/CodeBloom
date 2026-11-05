import { readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

// Explorers (DESIGN.md section 7): every value is a verified variant. The
// expected results are read from the same files check:examples verified.
const file = (path: string) => readFileSync(`content/examples/${path}`, "utf8").replace(/\n$/, "");
const result = (id: string, value: string, base: string) => {
  const [language, name] = id.split("/");
  if (value === base) return file(`${language}/${name}.expected.txt`);
  for (const suffix of [".expected.txt", ".run-error.txt"]) {
    try {
      return file(`${language}/${name}@${value}${suffix}`);
    } catch {
      // try the next kind
    }
  }
  throw new Error(`no result for ${id}@${value}`);
};

const SLIDERS = [
  { path: "/courses/python/decisions", id: "python/vote", values: ["16", "17", "18", "19"], base: "17" },
  { path: "/courses/python/loops", id: "python/explore_range", values: ["0", "1", "2", "3", "4", "5"], base: "3" },
  { path: "/courses/python/lists", id: "python/explore_index", values: ["0", "1", "2", "3"], base: "0" },
];

function watchPyodide(page: Page) {
  const requests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/pyodide/") || path === "/python-worker.mjs") requests.push(path);
  });
  return requests;
}

for (const { path, id, values, base } of SLIDERS) {
  test(`${path}: the ${id} slider shows each verified result, from the keyboard, and announces it`, async ({ page }) => {
    const pyodide = watchPyodide(page);
    await page.goto(path, { waitUntil: "networkidle" });
    const block = page.locator(`[data-explorer-block="${id}"]`);
    const slider = block.getByRole("slider");
    const output = block.locator("[data-figure] pre[role=region]").last();
    await expect(slider).toHaveAttribute("aria-valuetext", new RegExp(` is ${base}$`));
    await expect(output).toHaveText(result(id, base, base));
    await slider.focus();
    await page.keyboard.press("Home");
    for (const [index, value] of values.entries()) {
      if (index > 0) await page.keyboard.press("ArrowRight");
      await expect(block.locator("[data-explorer]")).toHaveAttribute("data-explorer-value", value);
      await expect(slider).toHaveAttribute("aria-valuetext", new RegExp(` is ${value}$`));
      await expect(output).toHaveText(result(id, value, base));
      // The code shows the value that was run.
      await expect(block.locator("[data-figure] [data-code-text]").filter({ hasText: value }).first()).toBeVisible();
      if (index > 0) await expect(block.locator("[data-explorer-announcement]")).toContainText(`is ${value}.`);
    }
    await expect(slider).toBeFocused();
    expect(pyodide).toEqual([]);
  });
}

test("the range explorer says when the loop runs zero times, and the list explorer shows the real IndexError", async ({ page }) => {
  await page.goto("/courses/python/loops", { waitUntil: "networkidle" });
  const range = page.locator('[data-explorer-block="python/explore_range"]');
  await range.getByRole("slider").focus();
  await page.keyboard.press("Home");
  await expect(range.locator("[data-explorer-announcement]")).toHaveText("count is 0. It prints: Done.");
  await page.goto("/courses/python/lists", { waitUntil: "networkidle" });
  const index = page.locator('[data-explorer-block="python/explore_index"]');
  await index.getByRole("slider").focus();
  await page.keyboard.press("End");
  await expect(index.locator("pre[data-output-failed]")).toContainText("IndexError: list index out of range");
  await expect(index.getByText("Error message from the real run")).toBeVisible();
  await expect(index.locator("[data-explorer-announcement]")).toHaveText("position is 3. The program stops with an error: IndexError: list index out of range");
});

test("the vote explorer's path and True or False chip come from each variant's trace", async ({ page }) => {
  await page.goto("/courses/python/decisions", { waitUntil: "networkidle" });
  const block = page.locator('[data-explorer-block="python/vote"]');
  await expect(block.locator('[data-line="2"]')).toContainText("False");
  await expect(block.locator("[data-path-step]")).toHaveText(["Line 1 ran", "Line 2 ran", "Line 3 skipped", "Line 5 ran"]);
  await block.getByRole("slider").focus();
  await page.keyboard.press("ArrowRight");
  await expect(block.locator('[data-line="2"]')).toContainText("True");
  await expect(block.locator("[data-path-step]")).toHaveText(["Line 1 ran", "Line 2 ran", "Line 3 ran"]);
  await expect(block.locator("[data-explorer-announcement]")).toHaveText("age is 18. Lines that ran: 1, 2 and 3. It prints: You can vote.");
});

test("C pointer boxes: the arrow goes to the variable that changed in the verified output, never an address", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/courses/c/pointers", { waitUntil: "networkidle" });
  const block = page.locator('[data-explorer-block="c/explore_target"]');
  const boxes = block.locator("[data-pointer-boxes]");
  await expect(boxes).toHaveAttribute("data-pointer-target", "b");
  const group = block.getByRole("group", { name: "Choose what p points to" });
  await group.getByRole("radio", { name: "&b" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(group.getByRole("radio", { name: "&c" })).toBeChecked();
  await expect(boxes).toHaveAttribute("data-pointer-target", "c");
  await expect(block.locator('[data-pointer-box="c"]')).toContainText("99");
  await expect(block.locator('[data-pointer-box="c"]')).toContainText("was 30");
  await expect(block.locator("pre[role=region]").last()).toHaveText(result("c/explore_target", "c", "b"));
  await expect(block.locator("[data-explorer-announcement]")).toHaveText("p points to c. Writing through p changed c from 30 to 99; a stayed 10 and b stayed 20.");
  await expect(block.locator('[data-line="7"]')).toContainText("int *p = &c;");
  expect(await block.innerText()).not.toMatch(/0x[0-9a-f]+/i);
  // Fits at 360px without page scroll.
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
});

test("homepage hero: the output waits for a prediction, and moving the slider reveals each verified run", async ({ page }) => {
  const pyodide = watchPyodide(page);
  await page.goto("/", { waitUntil: "networkidle" });
  const hero = page.locator('[data-explorer="python/vote"]');
  await expect(hero.locator('[data-predict="waiting"]')).toHaveCount(1);
  await expect(hero.getByText("Think about what line 5 prints, then press Show.")).toBeVisible();
  await hero.getByRole("slider").focus();
  await page.keyboard.press("ArrowRight");
  await expect(hero.locator('[data-predict="shown"]')).toHaveCount(1);
  await expect(hero.locator("pre[role=region]").last()).toHaveText("You can vote");
  await expect(hero.locator("[data-figure-note]")).toContainText("The chip on line 2 shows the answer for this run.");
  expect(pyodide).toEqual([]);
});

test("reduced motion: the pointer arrow and boxes change at once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/courses/c/pointers", { waitUntil: "networkidle" });
  const line = page.locator("[data-pointer-boxes] line").first();
  expect(await line.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0s");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  for (const { path, id, values, base } of [...SLIDERS, { path: "/courses/c/pointers", id: "c/explore_target", values: ["a", "b", "c"], base: "b" }]) {
    test(`${path}: every result of ${id} is in a table, and the control is hidden`, async ({ page }) => {
      await page.goto(path);
      const block = page.locator(`[data-explorer-block="${id}"]`);
      await expect(block.locator("[data-explorer-control]")).toBeHidden();
      const rows = block.locator("table[data-explorer-table]").filter({ visible: true }).locator("tbody tr");
      await expect(rows).toHaveCount(values.length);
      for (const [index, value] of values.entries()) {
        const expected = result(id, value, base);
        const shown = expected.includes("Traceback") ? expected.split("\n").at(-1)! : expected.split("\n")[0];
        await expect(rows.nth(index)).toContainText(shown);
      }
    });
  }
  test("homepage: the hero lists every age's result", async ({ page }) => {
    await page.goto("/");
    const table = page.locator("table[data-explorer-table]").filter({ visible: true });
    await expect(table.locator("tbody tr")).toHaveCount(4);
    await expect(page.locator('[data-explorer="python/vote"] [data-explorer-control]')).toBeHidden();
  });
});

// Output and error panels wrap long lines; only the display changes, never the text.
for (const width of [360, 1440]) {
  test(`at ${width}px output and error panels show whole lines by wrapping, with the text exactly as verified`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const cases = [
      { path: "/courses/python/lists", block: "python/explore_index", choose: async () => { await page.locator('[data-explorer-block="python/explore_index"]').getByRole("slider").focus(); await page.keyboard.press("End"); }, file: "python/explore_index@3.run-error.txt", key: "IndexError: list index out of range" },
      { path: "/courses/c/pointers", block: "c/explore_target", choose: async () => {}, file: "c/explore_target.expected.txt", key: "c = 30" },
    ];
    for (const { path, block, choose, file: verified, key } of cases) {
      await page.goto(path, { waitUntil: "networkidle" });
      await choose();
      const panel = page.locator(`[data-explorer-block="${block}"] [data-figure] pre[role=region]`).last();
      await expect(panel).toContainText(key);
      const shown = await panel.evaluate((el) => ({
        text: el.textContent,
        whiteSpace: getComputedStyle(el).whiteSpace,
        indent: getComputedStyle(el).textIndent,
        overflows: el.scrollWidth > el.clientWidth,
      }));
      // Character for character the verified file, without its final newline.
      expect(shown.text, block).toBe(file(verified));
      expect(shown.whiteSpace, block).toBe("pre-wrap");
      // A wrapped part is indented, so it cannot be mistaken for a new line of output.
      expect(shown.indent, block).toMatch(/hanging/);
      expect(shown.indent, block).toMatch(/each-line/);
      expect(shown.overflows, `${block} hides part of a line`).toBe(false);
      // The code above keeps its lines and scrolls sideways instead.
      const code = page.locator(`[data-explorer-block="${block}"] [data-figure] pre[role=region]`).first();
      expect(await code.locator("[data-code-text]").first().evaluate((el) => getComputedStyle(el).whiteSpace)).toBe("pre");
    }
  });
}

test("explorers in lessons have no repeated figure title under their heading; the hero keeps its own", async ({ page }) => {
  await page.goto("/courses/python/lists", { waitUntil: "networkidle" });
  await expect(page.locator('[data-explorer-block="python/explore_index"] figcaption')).toHaveCount(0);
  await expect(page.locator('[data-explorer-block="python/explore_index"]').getByText("Python program", { exact: true })).toHaveCount(0);
  await page.goto("/", { waitUntil: "networkidle" });
  await expect(page.locator('[data-explorer="python/vote"] figcaption')).toHaveText("Your turn: what does this print?");
});
