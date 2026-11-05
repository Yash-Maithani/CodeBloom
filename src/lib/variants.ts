// Verified variants for explorers (DESIGN.md section 7, explorer). A variants
// file, content/examples/<language>/<name>.variants.json, names one value on
// one line of an example that the learner may change. Each value is its own
// real run, checked by `npm run check:examples` (scripts/lib/example-runner.mjs),
// and the build refuses any variant whose code, result or trace no longer
// matches the verification record. Server only: it reads files at build time.

import "server-only";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { CODE_LANGUAGES, EXAMPLES_FOLDER, readExample, type CodeLanguage } from "./examples.ts";
import { highlight, type CodeToken } from "./highlight.ts";
import { normalizeLineEndings } from "./line-endings.ts";
import { assertTraceVerified, assertVariantVerified, assertVerified, readRecord, type ExpectationKind, type VerificationRecord } from "./verified.ts";

export type TraceStep = { line: number; output: string; variables: Array<{ name: string; value: string; type: string }> };

export type VariantRun = {
  value: string;
  /** The code as it was run, without the final newline */
  code: string;
  lines: CodeToken[][];
  kind: ExpectationKind;
  /** The recorded output, or the error message, without the final newline */
  result: string;
  trace?: TraceStep[];
};

export type VariantSet = {
  /** "<language>/<name>" of the base example */
  id: string;
  language: CodeLanguage;
  languageLabel: string;
  /** What the learner changes, for example "age" */
  name: string;
  /** The line the value is on (1-based) */
  line: number;
  baseValue: string;
  runs: VariantRun[];
};

type Manifest = { line: number; name: string; base: string; values: string[] };

const SUFFIXES: Record<ExpectationKind, string> = { output: ".expected.txt", "compile-error": ".compile-error.txt", "run-error": ".run-error.txt" };
const exists = (file: string) => access(file).then(() => true, () => false);
const withoutFinalNewline = (text: string) => text.replace(/\n$/, "");

/** The same replacement the runner makes: the first occurrence of the base value on that line. */
export function variantCode(source: string, line: number, base: string, value: string): string {
  const lines = normalizeLineEndings(source).split("\n");
  lines[line - 1] = lines[line - 1].replace(base, value);
  return lines.join("\n");
}

export async function loadVariants(id: string, { examplesFolder = EXAMPLES_FOLDER, record }: { examplesFolder?: string; record?: VerificationRecord } = {}): Promise<VariantSet> {
  const [language, name] = id.split("/") as [CodeLanguage, string];
  if (!(language in CODE_LANGUAGES) || !name) throw new Error(`Explorer ${id}: must be "<language>/<name>"`);
  const folder = path.join(/*turbopackIgnore: true*/ examplesFolder, language);
  const variantsFile = path.join(/*turbopackIgnore: true*/ folder, `${name}.variants.json`);
  const manifest = JSON.parse(await readFile(/*turbopackIgnore: true*/ variantsFile, "utf8").catch(() => {
    throw new Error(`Explorer ${id}: ${language}/${name}.variants.json does not exist`);
  })) as Manifest;
  const verified = record ?? (await readRecord());
  const base = await readExample(language, name, examplesFolder);
  const baseTraceFile = path.join(/*turbopackIgnore: true*/ folder, `${name}.trace.json`);
  const baseHasTrace = await exists(baseTraceFile);
  await assertVerified(verified, id, base.kind, base.sourceFile, base.expectationFile, base.inputFile);
  if (baseHasTrace) await assertTraceVerified(verified, id, baseTraceFile);
  const baseSource = await readFile(/*turbopackIgnore: true*/ base.sourceFile, "utf8");

  const runs: VariantRun[] = [];
  for (const value of manifest.values) {
    const isBase = value === manifest.base;
    let kind: ExpectationKind;
    let expectationFile: string;
    let traceFile: string | undefined;
    let code: string;
    if (isBase) {
      ({ kind, expectationFile } = base);
      traceFile = baseHasTrace ? baseTraceFile : undefined;
      code = withoutFinalNewline(normalizeLineEndings(baseSource));
    } else {
      const stem = path.join(/*turbopackIgnore: true*/ folder, `${name}@${value}`);
      const found: ExpectationKind[] = [];
      for (const k of Object.keys(SUFFIXES) as ExpectationKind[]) if (await exists(stem + SUFFIXES[k])) found.push(k);
      if (found.length !== 1) throw new Error(`Explorer ${id}: value ${value} needs exactly one result file, found ${found.length}`);
      kind = found[0];
      expectationFile = stem + SUFFIXES[kind];
      traceFile = (await exists(`${stem}.trace.json`)) ? `${stem}.trace.json` : undefined;
      const ran = variantCode(baseSource, manifest.line, manifest.base, value);
      await assertVariantVerified(verified, `${id}@${value}`, { kind, code: ran, baseSourceFile: base.sourceFile, variantsFile, expectationFile, traceFile });
      code = withoutFinalNewline(ran);
    }
    const result = withoutFinalNewline(normalizeLineEndings(await readFile(/*turbopackIgnore: true*/ expectationFile, "utf8")));
    const trace = traceFile ? (JSON.parse(await readFile(/*turbopackIgnore: true*/ traceFile, "utf8")) as { steps: TraceStep[] }).steps : undefined;
    runs.push({ value, code, lines: await highlight(code, language), kind, result, ...(trace ? { trace } : {}) });
  }
  return { id, language, languageLabel: CODE_LANGUAGES[language].label, name: manifest.name, line: manifest.line, baseValue: manifest.base, runs };
}
