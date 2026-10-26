import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { normalizeLineEndings } from "../../src/lib/line-endings.ts";

// Syntax colors on the homepage example (DESIGN.md section 7, "Syntax colors"):
// keywords in ink at weight 700, strings and numbers in syntax-literal,
// everything else ink. The code must also stay readable with no color at all.

const exampleCode = normalizeLineEndings(readFileSync("content/examples/python/vote.py", "utf8")).replace(/\n$/, "");

type Span = { text: string; color: string; weight: string; style: string };

async function codeSpans(page: import("@playwright/test").Page): Promise<Span[]> {
  return page.locator("pre[role=region] [data-line]").evaluateAll((lines) =>
    lines.flatMap((line) =>
      [...(line.lastElementChild?.children ?? [])].map((span) => {
        const style = getComputedStyle(span);
        return { text: span.textContent ?? "", color: style.color, weight: style.fontWeight, style: style.fontStyle };
      }),
    ),
  );
}

async function tokenColor(page: import("@playwright/test").Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.color = `var(--color-${name})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

for (const theme of ["light", "dark"] as const) {
  test(`keywords are bold and literals use the syntax-literal token (${theme} theme)`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await page.goto("/");
    const ink = await tokenColor(page, "ink");
    const literal = await tokenColor(page, "syntax-literal");
    const spans = await codeSpans(page);

    const keywords = spans.filter((s) => s.weight === "700").map((s) => s.text);
    expect(keywords).toEqual(["if", "else"]);

    const literals = spans.filter((s) => s.color === literal).map((s) => s.text);
    expect(literals).toEqual(["17", "18", '"You can vote"', '"Not yet"']);

    // Everything else is plain: regular weight, ink color, not italic.
    for (const span of spans.filter((s) => !keywords.includes(s.text) && !literals.includes(s.text))) {
      expect(span, `"${span.text}" should be plain`).toMatchObject({ weight: "400", style: "normal" });
      expect(span.color, `"${span.text}" should use ink`).toBe(ink);
    }
    // Keywords keep the ink color: weight, not color, is what marks them.
    for (const span of spans.filter((s) => keywords.includes(s.text))) expect(span.color).toBe(ink);
  });
}

test("code stays readable when the browser takes over the colors", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  await page.goto("/");
  const lines = await page.locator("pre[role=region] [data-line]").evaluateAll((spans) =>
    spans.map((span) => span.lastElementChild?.textContent ?? ""),
  );
  expect(lines.join("\n")).toBe(exampleCode);
  // Bold survives without color, so keywords are still marked.
  const spans = await codeSpans(page);
  expect(spans.filter((s) => s.weight === "700").map((s) => s.text)).toEqual(["if", "else"]);
});

test("every line of the example is still present with its line number and notes", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("pre[role=region] [data-line]")).toHaveCount(exampleCode.split("\n").length);
  await expect(page.locator("[data-notes-list] li")).toHaveCount(3);
});
