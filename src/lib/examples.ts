// Reads a runnable example and its real output from content/examples/ at build
// time. Server only: it uses the file system, so it never reaches the browser.

import "server-only";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeLineEndings } from "./line-endings.ts";
import type { ExpectationKind } from "./verified.ts";

export const CODE_LANGUAGES = {
  c: { label: "C", extension: ".c" },
  cpp: { label: "C++", extension: ".cpp" },
  java: { label: "Java", extension: ".java" },
  python: { label: "Python", extension: ".py" },
} as const;

export type CodeLanguage = keyof typeof CODE_LANGUAGES;

export const EXAMPLES_FOLDER = path.join(process.cwd(), "content", "examples");

// The three kinds of expectation file (see scripts/lib/example-runner.mjs).
const SUFFIXES: Record<ExpectationKind, string> = {
  output: ".expected.txt",
  "compile-error": ".compile-error.txt",
  "run-error": ".run-error.txt",
};

export type Example = {
  language: CodeLanguage;
  /** Source code as it was run, with \n line endings and without the final newline */
  code: string;
  /** What a real run printed: the output, or the error message for an example meant
   *  to fail. \n line endings, without the final newline; trailing spaces are kept. */
  expectedOutput: string;
  kind: ExpectationKind;
  sourceFile: string;
  expectationFile: string;
};

/** Removes one final newline, if there is one. Blank lines and trailing spaces stay. */
const withoutFinalNewline = (text: string) => text.replace(/\n$/, "");

export async function readExample(
  language: CodeLanguage,
  file: string,
  examplesFolder: string = EXAMPLES_FOLDER,
): Promise<Example> {
  // Read only while the build prerenders pages: every page that shows an example
  // is static, so nothing reads these files at run time. turbopackIgnore stops
  // Turbopack from copying the whole project into the server output to cover
  // these paths (its "dynamic filesystem access" warning). Decision D37.
  const folder = path.join(/*turbopackIgnore: true*/ examplesFolder, language);
  const sourceFile = path.join(/*turbopackIgnore: true*/ folder, `${file}${CODE_LANGUAGES[language].extension}`);
  const found: ExpectationKind[] = [];
  for (const kind of Object.keys(SUFFIXES) as ExpectationKind[]) {
    if (await access(path.join(/*turbopackIgnore: true*/ folder, file + SUFFIXES[kind])).then(() => true, () => false)) found.push(kind);
  }
  if (found.length !== 1) {
    throw new Error(`${language}/${file}: needs exactly one of ${Object.values(SUFFIXES).join(", ")}, found ${found.length}`);
  }
  const kind = found[0];
  const expectationFile = path.join(/*turbopackIgnore: true*/ folder, file + SUFFIXES[kind]);
  const [code, expectedOutput] = await Promise.all([
    readFile(/*turbopackIgnore: true*/ sourceFile, "utf8"),
    readFile(/*turbopackIgnore: true*/ expectationFile, "utf8"),
  ]);
  // Line endings are normalized first, so a file saved with Windows line endings
  // (\r\n) gives the same result as one with \n.
  return {
    language,
    code: withoutFinalNewline(normalizeLineEndings(code)),
    expectedOutput: withoutFinalNewline(normalizeLineEndings(expectedOutput)),
    kind,
    sourceFile,
    expectationFile,
  };
}
