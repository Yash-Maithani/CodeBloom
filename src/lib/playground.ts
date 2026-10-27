// Rules for the Python playground (SPEC.md Milestone 5) that do not need a
// browser: the limits, how the Input box becomes input() lines, and how a
// Python error message is shown. The worker that runs Python is
// src/workers/python-worker.ts; src/lib/python-runner.ts drives it.

import { normalizeLineEndings } from "./line-endings.ts";

/** A run is stopped after this long. Downloading and starting Python do not count. */
export const TIME_LIMIT_MS = 5000;
/** Output (including the echoed input lines) is cut off after this many characters. */
export const OUTPUT_LIMIT = 10_000;
/** Must equal the exact `pyodide` version in package.json; the prepare script checks. */
export const PYODIDE_VERSION = "314.0.7";
/** The file name Python reports in tracebacks, as if the learner ran `python3 main.py`. */
export const FILE_NAME = "main.py";

/** One input() call reads one line. A final line break does not add an empty line. */
export function splitInput(text: string): string[] {
  const normalized = normalizeLineEndings(text);
  if (normalized === "") return [];
  const lines = normalized.split("\n");
  if (lines.at(-1) === "") lines.pop();
  return lines;
}

export type PythonErrorKind = "syntax" | "runtime" | "input" | "package";

export type PythonErrorInfo = {
  kind: PythonErrorKind;
  /** For example "ZeroDivisionError" */
  name: string;
  /** The line of main.py Python names last, if any */
  line?: number;
  /** The message as Python prints it for main.py, without Pyodide's own frames */
  text: string;
};

const SYNTAX = new Set(["SyntaxError", "IndentationError", "TabError"]);

/**
 * Turns the message of a Pyodide PythonError into what `python3 main.py`
 * would print: frames from Pyodide's own files are removed, and so is
 * Pyodide's hint about installing packages, which this playground cannot do.
 */
export function readPythonError(message: string): PythonErrorInfo {
  const kept: string[] = [];
  let inFrame = false;
  let keepFrame = false;
  let skippingHint = false;
  for (const line of normalizeLineEndings(message).trimEnd().split("\n")) {
    if (skippingHint) {
      if (line.startsWith("See https://pyodide.org")) skippingHint = false;
      continue;
    }
    if (/^The module '.*' is included in the Pyodide distribution/.test(line)) {
      skippingHint = true;
      continue;
    }
    const frame = line.match(/^ {2}File "([^"]*)"/);
    if (frame) {
      inFrame = true;
      keepFrame = frame[1] === FILE_NAME;
      if (keepFrame) kept.push(line);
      continue;
    }
    if (inFrame && line.startsWith(" ")) {
      if (keepFrame) kept.push(line);
      continue;
    }
    inFrame = false;
    kept.push(line);
  }

  const finalLine = [...kept].reverse().find((line) => /^[A-Za-z_][\w.]*(:|$)/.test(line) && !line.startsWith("Traceback")) ?? "";
  const name = finalLine.split(":")[0].split(".").at(-1) ?? "";
  const lines = [...kept.join("\n").matchAll(new RegExp(`File "${FILE_NAME}", line (\\d+)`, "g"))].map((match) => Number(match[1]));
  const kind: PythonErrorKind = SYNTAX.has(name) ? "syntax" : name === "EOFError" ? "input" : name === "ModuleNotFoundError" ? "package" : "runtime";
  // python3 prints no "Traceback" heading for a syntax error, because nothing ran.
  const text = (kind === "syntax" ? kept.filter((line) => !line.startsWith("Traceback")) : kept).join("\n");
  return { kind, name, line: lines.at(-1), text };
}
