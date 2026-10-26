// Reads a runnable example and its real output from content/examples/ at build
// time. Server only: it uses the file system, so it never reaches the browser.

import { readFile } from "node:fs/promises";
import path from "node:path";

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
  /** Source code exactly as it was run, without the final newline */
  code: string;
  /** Output saved by a real run, without the final newline */
  expectedOutput: string;
};

export async function readExample(language: CodeLanguage, file: string): Promise<Example> {
  const folder = path.join(EXAMPLES_FOLDER, language);
  const [code, expectedOutput] = await Promise.all([
    readFile(path.join(folder, `${file}${CODE_LANGUAGES[language].extension}`), "utf8"),
    readFile(path.join(folder, `${file}.expected.txt`), "utf8"),
  ]);
  return {
    language,
    code: code.replace(/\n$/, ""),
    expectedOutput: expectedOutput.replace(/\n$/, ""),
  };
}
