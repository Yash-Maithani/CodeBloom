import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { normalizeLineEndings } from "../../src/lib/line-endings.ts";

// The Typed input panel (scripts/lib/example-runner.mjs feeds the input file to a C
// program as standard input). The Expected output panel holds only what the program
// printed; the typed lines are in their own panel above it.

const file = (name: string, suffix: string) => normalizeLineEndings(readFileSync(`content/examples/c/${name}${suffix}`, "utf8")).replace(/\n$/, "");
const panel = (page: import("@playwright/test").Page, example: string) => page.locator(`figure[data-example="c/${example}"] [data-typed-input]`);

test("a C example that reads input shows the typed lines above the output, and the output does not contain them", async ({ page }) => {
  await page.goto("/courses/c/printf-scanf");
  const typed = panel(page, "io_age");
  await expect(typed).toHaveCount(1);
  await expect(typed).toHaveText(file("io_age", ".input.txt"));
  await expect(typed).toHaveAttribute("aria-label", "Typed input for C code: Asking for an age");
  await expect(typed).toHaveAttribute("tabindex", "0");

  const figure = page.locator('figure[data-example="c/io_age"]');
  const output = figure.locator('[data-output="output"]');
  await expect(output).toHaveText(file("io_age", ".expected.txt"));
  expect(await output.innerText()).not.toContain(file("io_age", ".input.txt").split("\n")[0] + "\n");
  const [typedBox, outputBox] = [await typed.boundingBox(), await output.boundingBox()];
  expect(typedBox!.y, "the typed input is above the output").toBeLessThan(outputBox!.y);
  await expect(figure.getByText("A person typed these lines while the program ran.")).toBeVisible();
});

test("every C example with an input file gets a panel, with its own lines, and nothing else does", async ({ page }) => {
  const expected: Record<string, string[]> = {
    "/courses/c/printf-scanf": ["io_age", "io_sum", "io_double", "io_count", "io_no_amp_fix", "io_wrong_format_fix", "io_bad_input"],
    "/courses/c/decisions": ["dec_scanf_check"],
    "/courses/c/numbers": [],
  };
  for (const [path, examples] of Object.entries(expected)) {
    await page.goto(path);
    await expect(page.locator("[data-typed-input]"), path).toHaveCount(examples.length);
    for (const example of examples) await expect(panel(page, example), example).toHaveText(file(example, ".input.txt"));
  }
});

test("Python lessons keep the typed line inside the output and show no Typed input panel", async ({ page }) => {
  await page.goto("/courses/python/input-output");
  await expect(page.locator("[data-typed-input]")).toHaveCount(0);
  await expect(page.getByText("Typed input")).toHaveCount(0);
});
