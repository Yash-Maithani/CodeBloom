// Build-time data for the playground pages: starter code from verified
// examples (through the same publish gate as lessons), and the exact size of
// the Python download for the note shown before the first run.

import "server-only";
import { stat } from "node:fs/promises";
import path from "node:path";
import { readExample } from "./examples.ts";
import { PYODIDE_VERSION } from "./playground.ts";
import { assertVerified, readRecord } from "./verified.ts";

/**
 * Starter code: a verified Python example that runs and prints. `file` is its name
 * in content/examples/python. `input` is the example's .input.txt (the Input box
 * starts with these lines), or "" when the example reads no input.
 */
export async function loadStarter(file: string): Promise<{ id: string; code: string; input: string }> {
  const example = await readExample("python", file);
  const id = `python/${file}`;
  if (example.kind !== "output") throw new Error(`${id}: the playground starts only from examples that run and print`);
  await assertVerified(await readRecord(), id, example.kind, example.sourceFile, example.expectationFile, example.inputFile);
  return { id, code: example.code, input: example.input ?? "" };
}

/** Bytes of the five Pyodide files the worker downloads, as copied by scripts/prepare-playground.mjs before the build. */
export async function pythonDownloadBytes(): Promise<number> {
  const folder = path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "pyodide", PYODIDE_VERSION);
  const files = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide-lock.json", "python_stdlib.zip", "pyodide.asm.wasm"];
  const sizes = await Promise.all(files.map((file) => stat(path.join(/*turbopackIgnore: true*/ folder, file)).then((s) => s.size)));
  return sizes.reduce((sum, size) => sum + size, 0);
}
