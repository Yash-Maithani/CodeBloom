import { readFileSync } from "node:fs";
import { expect, test, type Locator, type Page } from "@playwright/test";

// Step-through visuals (SPEC.md FR-V1 to FR-V3). Everything shown must equal
// the verified trace file, which check:examples compares with a fresh run.

type Trace = { steps: Array<{ line: number; variables: Array<{ name: string; value: string; type: string }>; output: string }> };
const VISUALS = [
  { path: "/courses/python/variables", id: "change", file: "python/variables_change" },
  { path: "/courses/python/decisions", id: "vote", file: "python/vote" },
];
const traceOf = (file: string): Trace => JSON.parse(readFileSync(`content/examples/${file}.trace.json`, "utf8"));
const outputLines = (output: string) => (output === "" ? [] : output.replace(/\n$/, "").split("\n"));

/** Everything the stepper shows for the current position (not the live region). */
async function snapshot(visual: Locator) {
  return {
    current: await visual.locator("[data-trace-line][data-current]").evaluateAll((lines) => lines.map((l) => l.getAttribute("data-trace-line"))),
    text: await visual.locator("[data-step-text]").innerText(),
    variables: await visual.locator("[data-variables]").innerText(),
    output: await visual.locator("[data-output-so-far] span.block > span.block").evaluateAll((s) => s.map((x) => x.lastChild?.textContent ?? "")),
    outputText: await visual.locator("[data-output-so-far]").innerText(),
  };
}

async function open(page: Page, path: string, id: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  return page.locator(`[data-visual="${id}"]`);
}

for (const { path, id, file } of VISUALS) {
  test(`${id}: Start is the true pre-run state, and every step shows exactly the verified trace`, async ({ page }) => {
    const visual = await open(page, path, id);
    const trace = traceOf(file);

    const start = await snapshot(visual);
    expect(start.current).toEqual([]);
    expect(start.text).toBe("Start. Nothing has run yet.");
    expect(start.variables).toBe("No variables yet");
    expect(start.outputText).toBe("nothing yet");

    for (const [index, step] of trace.steps.entries()) {
      await visual.getByRole("button", { name: "Next step" }).click();
      const shown = await snapshot(visual);
      expect(shown.current, `step ${index + 1} line`).toEqual([String(step.line)]);
      expect(shown.text).toContain(`Step ${index + 1} of ${trace.steps.length}. Line ${step.line} ran:`);
      const boxes = visual.locator("[data-variable]");
      await expect(boxes).toHaveCount(step.variables.length);
      for (const [v, variable] of step.variables.entries()) {
        await expect(boxes.nth(v)).toHaveAttribute("data-variable", variable.name);
        await expect(boxes.nth(v).locator("span.font-mono")).toHaveText(variable.value);
        await expect(boxes.nth(v)).toContainText(variable.type);
      }
      if (step.output === "") expect(shown.outputText).toBe("nothing yet");
      else expect(shown.output, `step ${index + 1} output`).toEqual(outputLines(step.output));
    }
  });

  test(`${id}: Back and Start again restore each earlier state exactly`, async ({ page }) => {
    const visual = await open(page, path, id);
    const states = [await snapshot(visual)];
    const total = traceOf(file).steps.length;
    for (let i = 0; i < total; i++) {
      await visual.getByRole("button", { name: "Next step" }).click();
      states.push(await snapshot(visual));
    }
    for (let i = total - 1; i >= 0; i--) {
      await visual.getByRole("button", { name: "Back" }).click();
      expect(await snapshot(visual), `Back to position ${i}`).toEqual(states[i]);
    }
    // From every position, Start again returns to the start state.
    for (let position = 1; position <= total; position++) {
      for (let i = 0; i < position; i++) await visual.getByRole("button", { name: "Next step" }).click();
      expect(await snapshot(visual), `position ${position}`).toEqual(states[position]);
      await visual.getByRole("button", { name: "Start again" }).click();
      expect(await snapshot(visual), `Start again from ${position}`).toEqual(states[0]);
    }
  });

  test(`${id}: the ends say where you are and do not move`, async ({ page }) => {
    const visual = await open(page, path, id);
    const announcement = visual.locator("[data-announcement]");
    const back = visual.getByRole("button", { name: "Back" });
    await expect(back).toHaveAttribute("aria-disabled", "true");
    // Playwright will not click an aria-disabled button, but a keyboard user can press it.
    await back.focus();
    await page.keyboard.press("Enter");
    await expect(announcement).toHaveText("This is the start. Nothing has run yet.");
    const next = visual.getByRole("button", { name: "Next step" });
    for (let i = 0; i < traceOf(file).steps.length; i++) await next.click();
    const last = await snapshot(visual);
    await expect(next).toHaveAttribute("aria-disabled", "true");
    await next.focus();
    await page.keyboard.press("Enter");
    await expect(announcement).toHaveText("This is the last step.");
    expect(await snapshot(visual)).toEqual(last);
  });

  test(`${id}: the text table has the start and every step from the trace`, async ({ page }) => {
    const visual = await open(page, path, id);
    const trace = traceOf(file);
    await visual.locator("[data-trace-details] summary").click();
    const rows = visual.locator("[data-trace-details] tbody tr");
    await expect(rows).toHaveCount(trace.steps.length + 1);
    await expect(rows.first()).toContainText("Nothing has run yet");
    for (const [index, step] of trace.steps.entries()) {
      const row = rows.nth(index + 1);
      await expect(row.locator("td").first()).toContainText(`Line ${step.line}:`);
      for (const variable of step.variables) await expect(row).toContainText(`${variable.name} = ${variable.value} (${variable.type})`);
      const lines = await row.locator("td").last().locator("span.block > span.block").evaluateAll((s) => s.map((x) => x.lastChild?.textContent ?? ""));
      if (step.output !== "") expect(lines).toEqual(outputLines(step.output));
    }
  });
}

test("each step is announced in words, with multi-line output as real separate lines", async ({ page }) => {
  const visual = await open(page, "/courses/python/variables", "change");
  const announcement = visual.locator("[data-announcement]");
  await expect(announcement).toHaveAttribute("role", "status");
  const next = visual.getByRole("button", { name: "Next step" });
  await next.click();
  await expect(announcement).toContainText("Step 1 of 4. Line 1 ran: apples = 3. apples is now 3.");
  await next.click();
  await next.click();
  await expect(announcement).toContainText("Step 3 of 4. Line 3 ran: apples = apples + 2. apples changed from 3 to 5.");
  await next.click();
  // Output 3 then 5: two real lines in monospace, read as "Line 1:", "Line 2:", in the panel and the announcement.
  for (const area of [visual.locator("[data-output-so-far]"), announcement]) {
    const lines = area.locator("span.font-mono > span.block");
    await expect(lines).toHaveCount(2);
    await expect(lines.nth(0)).toHaveText("Line 1: 3");
    await expect(lines.nth(1)).toHaveText("Line 2: 5");
  }
});

test("the branch visual says where Python jumped, from the trace", async ({ page }) => {
  const visual = await open(page, "/courses/python/decisions", "vote");
  for (let i = 0; i < 3; i++) await visual.getByRole("button", { name: "Next step" }).click();
  await expect(visual.locator("[data-step-text]")).toContainText("Python went from line 2 to line 5.");
  // Lines 3 and 4 never run, so they are never the current line.
  const seen = new Set<string>();
  await visual.getByRole("button", { name: "Start again" }).click();
  for (let i = 0; i < 3; i++) {
    await visual.getByRole("button", { name: "Next step" }).click();
    for (const l of await visual.locator("[data-current]").evaluateAll((x) => x.map((e) => e.getAttribute("data-trace-line")!))) seen.add(l);
  }
  expect([...seen].sort()).toEqual(["1", "2", "5"]);
});

test("keyboard only: Tab to the controls, Enter and Space step, focus stays on the button", async ({ page }) => {
  const visual = await open(page, "/courses/python/variables", "change");
  const next = visual.getByRole("button", { name: "Next step" });
  await visual.getByRole("button", { name: "Back" }).focus();
  await page.keyboard.press("Tab");
  await expect(next).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");
  await expect(visual.locator("[data-step-text]")).toContainText("Step 2 of 4");
  await expect(next).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(visual.getByRole("button", { name: "Start again" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(visual.locator("[data-step-text]")).toHaveText("Start. Nothing has run yet.");
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(visual.getByRole("button", { name: "Back" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(visual.locator("[data-announcement]")).toHaveText("This is the start. Nothing has run yet.");
});

test("at 360px the visual fits without page scroll, and with reduced motion the line change is instant", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const visual = await open(page, "/courses/python/decisions", "vote");
  await visual.getByRole("button", { name: "Next step" }).click();
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  const duration = await visual.locator("[data-current]").evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(duration).toBe("0s");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the stepper is hidden and the full table is shown open", async ({ page }) => {
    await page.goto("/courses/python/variables");
    const visual = page.locator('[data-visual="change"]');
    await expect(visual.locator("[data-stepper]")).toBeHidden();
    await expect(visual.locator("[data-trace-details]")).toBeHidden();
    const table = visual.locator("noscript ~ * [data-trace-table], [data-trace-table]").filter({ visible: true });
    await expect(table).toHaveCount(1);
    await expect(table.locator("tbody tr")).toHaveCount(5);
  });
});
