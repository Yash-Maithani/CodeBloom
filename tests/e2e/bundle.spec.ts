import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

// The syntax highlighter (Shiki) must run on the server only. If it ever leaks
// into code that browsers download, every visitor pays for it. These markers
// appear inside Shiki's grammar files and in our own scope table, and nowhere
// in code that is meant for the browser.

// The last two come from the lesson loader and the publish gate, which are server only too.
const MARKERS = [
  "vscode-textmate",
  "keyword.control.flow",
  "storage.type.built-in.primitive",
  "storage.type.primitive",
  "includeExplanation",
  "has never been verified",
  "must appear exactly once in the topics",
];
const ROUTES = [
  "/",
  "/courses",
  "/courses/c",
  "/courses/cpp",
  "/courses/java",
  "/courses/python",
  "/courses/c/first-program",
  "/courses/python/variables",
  "/dev/tokens",
  "/no-such-page",
];

function filesUnder(folder: string): string[] {
  return readdirSync(folder).flatMap((name) => {
    const full = path.join(folder, name);
    return statSync(full).isDirectory() ? filesUnder(full) : [full];
  });
}

const found = (text: string) => MARKERS.filter((marker) => text.includes(marker));

test("positive control: the markers really appear in Shiki's grammars and in our server code", () => {
  const python = readFileSync("node_modules/@shikijs/langs/dist/python.mjs", "utf8");
  expect(found(python), "Python grammar").toContain("keyword.control.flow");
  const serverCode = filesUnder(".next/server").filter((f) => /\.(js|mjs)$/.test(f)).map((f) => readFileSync(f, "utf8"));
  expect(serverCode.some((code) => code.includes("storage.type.primitive")), "our scope table in the server build").toBe(true);
  expect(serverCode.some((code) => code.includes("has never been verified")), "the publish gate in the server build").toBe(true);
  expect(serverCode.some((code) => code.includes("must appear exactly once in the topics")), "the lesson loader in the server build").toBe(true);
});

test("no Shiki code or scope table in any file the browser can download", () => {
  const leaks = filesUnder(".next/static")
    .filter((f) => /\.(js|mjs|css|json)$/.test(f))
    .flatMap((f) => found(readFileSync(f, "utf8")).map((marker) => `${f}: ${marker}`));
  expect(leaks).toEqual([]);
});

test("no Shiki code in any script the browser actually loads", async ({ page }) => {
  const leaks: string[] = [];
  const downloaded = new Set<string>();
  page.on("response", async (response) => {
    if (response.request().resourceType() !== "script") return;
    downloaded.add(response.url());
    const body = await response.text().catch(() => "");
    for (const marker of found(body)) leaks.push(`${response.url()}: ${marker}`);
  });
  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "networkidle" });
  }
  expect(downloaded.size, "scripts were really downloaded").toBeGreaterThan(0);
  expect(leaks).toEqual([]);
});
