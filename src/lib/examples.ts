// Reads a runnable example and its real output from content/examples/ at build
// time. Server only: it uses the file system, so it never reaches the browser.

import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeLineEndings } from "./line-endings.ts";

export const CODE_LANGUAGES = {
  c: { label: "C", extension: ".c" },
  cpp: { label: "C++", extension: ".cpp" },
  java: { label: "Java", extension: ".java" },
  python: { label: "Python", extension: ".py" },
} as const;

export type CodeLanguage = keyof typeof CODE_LANGUAGES;

const EXAMPLES_FOLDER = path.join(process.cwd(), "content", "examples");

export type Example = {
  language: CodeLanguage;
  /** Source code as it was run, with \n line endings and without the final newline */
  code: string;
  /** Output saved by a real run, with \n line endings and without the final newline */
  expectedOutput: string;
};

/** Removes one final newline, if there is one. Blank lines and trailing spaces stay. */
const withoutFinalNewline = (text: string) => text.replace(/\n$/, "");

export async function readExample(
  language: CodeLanguage,
  file: string,
  examplesFolder: string = EXAMPLES_FOLDER,
): Promise<Example> {
  const folder = path.join(examplesFolder, language);
  const [code, expectedOutput] = await Promise.all([
    readFile(path.join(folder, `${file}${CODE_LANGUAGES[language].extension}`), "utf8"),
    readFile(path.join(folder, `${file}.expected.txt`), "utf8"),
  ]);
  // Line endings are normalized first, so a file saved with Windows line endings
  // (\r\n) gives the same result as one with \n.
  return {
    language,
    code: withoutFinalNewline(normalizeLineEndings(code)),
    expectedOutput: withoutFinalNewline(normalizeLineEndings(expectedOutput)),
  };
}
