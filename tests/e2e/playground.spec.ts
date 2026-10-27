import { expect, test, type Page } from "@playwright/test";

// The Python playground (SPEC.md Milestone 5) with the real Pyodide worker.
// Each run starts a fresh Python, so the first run of a page downloads Python
// (from the local build) and later runs use the browser cache.

async function open(page: Page) {
  await page.goto("/playground", { waitUntil: "networkidle" });
  return page.locator("[data-playground]");
}

async function runCode(page: Page, code: string, input = "") {
  const playground = page.locator("[data-playground]");
  await page.locator("[data-code]").fill(code);
  await page.locator("[data-input]").fill(input);
  await playground.getByRole("button", { name: "Run" }).click();
  await expect(playground).toHaveAttribute("data-state", /^(finished|error|timeout|cut|stopped|download-failed|crashed)$/, { timeout: 60_000 });
  return {
    state: await playground.getAttribute("data-state"),
    status: await page.locator("[data-status]").innerText(),
    output: await page.locator("[data-run-output]").innerText(),
    error: (await page.locator("[data-run-error]").count()) ? await page.locator("[data-run-error]").innerText() : "",
  };
}

test("nothing is downloaded until Run, then progress counts real bytes up to the exact total", async ({ page }) => {
  const requests: string[] = [];
  page.context().on("request", (request) => requests.push(new URL(request.url()).pathname));
  const playground = await open(page);
  await expect(page.locator("[data-download-note]")).toHaveText("The first run downloads Python (13.5 MB). Your browser keeps a copy for next time.");
  expect(requests.filter((path) => path.startsWith("/pyodide/") || path === "/python-worker.mjs")).toEqual([]);

  const seen: string[] = [];
  await page.exposeFunction("recordStatus", (text: string) => seen.push(text));
  await page.evaluate(() => {
    const status = document.querySelector("[data-status]")!;
    new MutationObserver(() => (window as unknown as { recordStatus(t: string): void }).recordStatus(status.textContent ?? "")).observe(status, { subtree: true, characterData: true, childList: true });
  });
  await playground.getByRole("button", { name: "Run" }).click();
  await expect(playground).toHaveAttribute("data-state", "finished", { timeout: 60_000 });
  const downloads = seen.filter((text) => text.startsWith("Downloading Python"));
  expect(downloads.length).toBeGreaterThan(0);
  for (const text of downloads) expect(text).toMatch(/^Downloading Python: \d+\.\d of 13\.5 MB$/);
  // Python is the five pinned files. (Playwright also lists the background
  // worker's requests, which a normal browser answers from its cache.)
  const files = [...new Set(requests.filter((path) => path.startsWith("/pyodide/")))];
  expect(files.sort()).toEqual(["pyodide-lock.json", "pyodide.asm.mjs", "pyodide.asm.wasm", "pyodide.mjs", "python_stdlib.zip"].map((f) => `/pyodide/314.0.7/${f}`));
  await expect(page.locator("[data-run-output]")).toHaveText("Fruit: 7\n");
  await expect(page.locator("[data-download-note]")).toHaveCount(0);
});

test("normal output, no output, syntax error and runtime error each have their own state", async ({ page }) => {
  await open(page);
  let run = await runCode(page, "x = 3\nprint(x + 2)\nprint('done')");
  expect([run.state, run.status, run.output]).toEqual(["finished", "Finished.", "5\ndone\n"]);

  run = await runCode(page, "x = 3");
  expect([run.state, run.status, run.output]).toEqual(["finished", "Finished. Your program printed nothing.", ""]);

  run = await runCode(page, "print('hi'\n");
  expect(run.state).toBe("error");
  expect(run.status).toBe("Python could not run your program: there is a mistake on line 1. Nothing ran.");
  expect(run.error).toBe("  File \"main.py\", line 1\n    print('hi'\n         ^\nSyntaxError: '(' was never closed");

  run = await runCode(page, "print('before')\nprint(1/0)");
  expect(run.status).toBe("Your program stopped with an error on line 2.");
  expect(run.output).toBe("before\n");
  expect(run.error).toBe("Traceback (most recent call last):\n  File \"main.py\", line 2, in <module>\n    print(1/0)\n          ~^~\nZeroDivisionError: division by zero");
  expect(run.error).not.toContain("_pyodide");
});

test("an endless loop stops after 5 seconds, keeps earlier output, and the next run works", async ({ page }) => {
  await open(page);
  await runCode(page, "print('warm up')");
  const started = Date.now();
  const run = await runCode(page, "print('before the loop')\nwhile True:\n    pass");
  const took = Date.now() - started;
  expect(run.state).toBe("timeout");
  expect(run.status).toBe("Stopped after 5 seconds. Your program may have a loop that never ends.");
  expect(run.output).toBe("before the loop\n");
  expect(took).toBeGreaterThanOrEqual(5000);
  expect(took).toBeLessThan(15000);
  expect((await runCode(page, "print('next run')")).output).toBe("next run\n");
});

test("output is cut off at exactly 10,000 characters and the program stopped", async ({ page }) => {
  await open(page);
  const run = await runCode(page, "for i in range(100000):\n    print('x' * 9)");
  expect(run.state).toBe("cut");
  expect(run.status).toBe("Output cut off after 10,000 characters, and your program was stopped.");
  const text = await page.locator("[data-run-output] code").evaluate((code) => code.textContent ?? "");
  expect(text.length).toBe(10000);
});

test("the Input box gives one line per input() call; too few lines is explained", async ({ page }) => {
  await open(page);
  let run = await runCode(page, "name = input('Name? ')\nage = int(input())\nprint(name, age + 1)", "Ana\n17\n");
  expect(run.output).toBe("Name? Ana\n17\nAna 18\n");
  run = await runCode(page, "a = input()\nb = input()", "only one");
  expect(run.status).toBe("Your program asked for more input than the Input box has (EOFError on line 2).");
});

test("every run is a fresh Python: a changed builtin or module does not leak into the next run", async ({ page }) => {
  await open(page);
  await runCode(page, "import builtins, json\nbuiltins.print = lambda *a: None\njson.dumps = None\nsecret = 1");
  const run = await runCode(page, "import json\nprint(json.dumps([1]))\nprint('secret' in globals())");
  expect(run.output).toBe("[1]\nFalse\n");
});

test("learner code has no network and no packages", async ({ page }) => {
  await open(page);
  let run = await runCode(page, "import js\nprint([hasattr(js, name) for name in ['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'importScripts']])");
  expect(run.output).toBe("[False, False, False, False, False]\n");
  run = await runCode(page, "import numpy");
  expect(run.status).toBe("This playground has only Python's standard library, so packages such as numpy are not available.");
  expect(run.error).not.toContain("micropip");
});

test("the original fetch is gone from the worker, and the worker is served with its own network policy", async ({ page }) => {
  const response = await page.request.get("/python-worker.mjs");
  expect(response.headers()["content-security-policy"]).toBe("default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'");
  await open(page);
  // Look for fetch anywhere on the global object and its prototype chain.
  const code = [
    "import js",
    "from pyodide.ffi import jsnull",
    "proto = js.self",
    "found = []",
    "while proto is not None and proto is not jsnull:",
    "    d = js.Object.getOwnPropertyDescriptor(proto, 'fetch')",
    "    if d is not None and d.value is not None:",
    "        found.append(str(d.value))",
    "    proto = js.Object.getPrototypeOf(proto)",
    "print(found)",
  ].join("\n");
  expect((await runCode(page, code)).output).toBe("[]\n");
});

test("Stop during the first download stops it; Reset code restores the example", async ({ page }) => {
  const playground = await open(page);
  await page.route("**/pyodide/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.continue();
  });
  await page.locator("[data-code]").fill("print('changed')");
  await playground.getByRole("button", { name: "Run" }).click();
  await expect(page.locator("[data-status]")).toContainText("Downloading Python");
  await playground.getByRole("button", { name: "Stop" }).click();
  await expect(playground).toHaveAttribute("data-state", "stopped");
  await expect(playground.getByRole("button", { name: "Run" })).toBeFocused();
  await playground.getByRole("button", { name: "Reset code" }).click();
  await expect(page.locator("[data-code]")).toHaveValue("apples = 3\noranges = 4\nprint(\"Fruit:\", apples + oranges)");
});

test("a failed download says so, and Run tries again", async ({ page }) => {
  const playground = await open(page);
  await page.route("**/pyodide/**", (route) => route.abort());
  await playground.getByRole("button", { name: "Run" }).click();
  await expect(playground).toHaveAttribute("data-state", "download-failed", { timeout: 30_000 });
  await expect(page.locator("[data-status]")).toHaveText("Python could not be downloaded. Check your connection, then press Run to try again.");
  await page.unroute("**/pyodide/**");
  await playground.getByRole("button", { name: "Run" }).click();
  await expect(playground).toHaveAttribute("data-state", "finished", { timeout: 60_000 });
});

test("keyboard only: Tab indents, Enter keeps indentation, Esc then Tab leaves, results are announced", async ({ page }) => {
  await open(page);
  const code = page.locator("[data-code]");
  await code.fill("");
  await code.focus();
  await page.keyboard.type("for i in range(2):");
  await page.keyboard.press("Enter");
  await page.keyboard.type("print(i)");
  await expect(code).toHaveValue("for i in range(2):\n    print(i)");
  // Shift+Tab removes one level from the line; Tab at the start adds it back.
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+Tab");
  await expect(code).toHaveValue("for i in range(2):\nprint(i)");
  await page.keyboard.press("Tab");
  await expect(code).toBeFocused();
  await expect(code).toHaveValue("for i in range(2):\n    print(i)");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Tab");
  await expect(code).not.toBeFocused();
  await page.locator("[data-input]").focus();
  await page.keyboard.press("Tab");
  const run = page.getByRole("button", { name: "Run" });
  await expect(run).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("[data-announcement]")).toHaveText("Finished. 2 lines of output.", { timeout: 60_000 });
  await expect(run).toBeFocused();
  await expect(page.locator("[data-run-output]")).toHaveText("0\n1\n");
});

test("at 320px the playground fits without page scroll", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page);
  await runCode(page, "print('a fairly long line of output that is wider than a phone screen, so it scrolls')");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("the code is shown, the controls are hidden, and the page says why", async ({ page }) => {
    await page.goto("/playground");
    await expect(page.locator("[data-code]")).toHaveValue(/Fruit/);
    await expect(page.locator("noscript p")).toBeVisible();
    await expect(page.locator("noscript p")).toContainText("Running code needs JavaScript.");
    await expect(page.locator("[data-controls]")).toBeHidden();
  });
});
