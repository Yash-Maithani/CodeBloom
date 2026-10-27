// Tests for the example loader, with files saved the way Windows saves them.
// Run with `npm run test:unit`. Fixtures live in a temporary folder.

import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { CODE_LANGUAGES, readExample, type CodeLanguage } from "./examples.ts";
import { highlight } from "./highlight.ts";

const folders: string[] = [];
async function fixture(files: Record<string, string>): Promise<string> {
  const root = await mkdtemp(path.join(tmpdir(), "codebloom-loader-test-"));
  folders.push(root);
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}
after(async () => {
  for (const folder of folders) await rm(folder, { recursive: true, force: true });
});

// The expected values below are written out by hand, not produced by the code under test.
const cases: Array<{ name: string; saved: string; code: string }> = [
  { name: "LF file (nothing to change)", saved: "a = 1\nb = 2\n", code: "a = 1\nb = 2" },
  { name: "CRLF file", saved: "a = 1\r\nb = 2\r\n", code: "a = 1\nb = 2" },
  { name: "CRLF file without a final newline", saved: "a = 1\r\nb = 2", code: "a = 1\nb = 2" },
  { name: "final line ends with a lone \\r", saved: "a = 1\r\nb = 2\r", code: "a = 1\nb = 2" },
  { name: "old Mac file, lone \\r everywhere", saved: "a = 1\rb = 2\r", code: "a = 1\nb = 2" },
  { name: "mixed endings", saved: "a = 1\r\nb = 2\nc = 3\r\n", code: "a = 1\nb = 2\nc = 3" },
  { name: "trailing spaces and blank lines are kept", saved: "a = 1  \r\n\r\nb = 2\r\n\r\n", code: "a = 1  \n\nb = 2\n" },
  { name: "indentation with tabs is kept", saved: "if x:\r\n\tpass\r\n", code: "if x:\n\tpass" },
];

for (const { name, saved, code } of cases) {
  test(`loader: ${name}`, async () => {
    const root = await fixture({ "python/sample.py": saved, "python/sample.expected.txt": saved });
    const example = await readExample("python", "sample", root);
    assert.equal(example.code, code);
    assert.equal(example.kind, "output");
    assert.equal(example.expectedOutput, code, "expected output goes through the same rule");
    assert.ok(!example.code.includes("\r") && !example.expectedOutput.includes("\r"));
  });
}

test("loader and highlighter: CRLF copies of the real examples give exactly the same result as the LF originals", async () => {
  for (const [language, { extension }] of Object.entries(CODE_LANGUAGES) as Array<[CodeLanguage, { extension: string }]>) {
    const files = language === "python" ? ["hello", "vote"] : [language === "java" ? "Hello" : "hello"];
    for (const file of files) {
      const lf = (suffix: string) => readFileSync(`content/examples/${language}/${file}${suffix}`, "utf8").replace(/\r\n|\r/g, "\n");
      const toCrlf = (text: string) => text.replace(/\n/g, "\r\n");
      const root = await fixture({
        [`${language}/${file}${extension}`]: toCrlf(lf(extension)),
        [`${language}/${file}.expected.txt`]: toCrlf(lf(".expected.txt")),
      });

      const fromCrlf = await readExample(language, file, root);
      const fromLf = await readExample(language, file);
      const content = ({ code, expectedOutput, kind }: Awaited<ReturnType<typeof readExample>>) => ({ code, expectedOutput, kind });
      assert.deepEqual(content(fromCrlf), content(fromLf), `${language}/${file}`);

      // What the page renders: every line rebuilds the normalized source exactly.
      const lines = await highlight(fromCrlf.code, language);
      assert.equal(lines.map((tokens) => tokens.map((token) => token.text).join("")).join("\n"), lf(extension).replace(/\n$/, ""));
    }
  }
});
