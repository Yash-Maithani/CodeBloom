// The publish gate. `npm run check:examples` writes content/verified-examples.json
// when every example passes (scripts/lib/example-runner.mjs). Before a page
// shows an example, the build recomputes the same hashes from the files on disk.
// If an example was never verified, or changed after it was verified, the build
// stops: a learner never sees code or output that was not really run.

import "server-only";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { normalizeLineEndings } from "./line-endings.ts";

export type ExpectationKind = "output" | "compile-error" | "run-error";

type RecordEntry = { kind: ExpectationKind; source: string; expected: string; trace?: string };
export type VerificationRecord = { examples: Record<string, RecordEntry> };

export const RECORD_PATH = path.join(process.cwd(), "content", "verified-examples.json");

// Same rule as the runner: hash the text after line endings become \n.
const sha256 = (text: string) => createHash("sha256").update(normalizeLineEndings(text), "utf8").digest("hex");

export async function readRecord(file: string = RECORD_PATH): Promise<VerificationRecord> {
  try {
    // Build time only, like src/lib/examples.ts (decision D37).
    return JSON.parse(await readFile(/*turbopackIgnore: true*/ file, "utf8")) as VerificationRecord;
  } catch (error) {
    throw new Error(`Cannot read the verification record ${file}. Run npm run check:examples. (${String(error)})`);
  }
}

/**
 * Stops the build unless the example's current files match the record.
 * `id` is "<language>/<name>"; `sourceFile` and `expectationFile` are its two files.
 */
/** Stops the build unless the example's trace (for a step-through visual) matches the record. */
export async function assertTraceVerified(record: VerificationRecord, id: string, traceFile: string): Promise<void> {
  const entry = record.examples[id];
  const fix = "Run npm run check:examples, review the trace, and commit the updated content/verified-examples.json.";
  if (!entry?.trace) throw new Error(`The trace of ${id} has never been verified. ${fix}`);
  if (sha256(await readFile(/*turbopackIgnore: true*/ traceFile, "utf8")) !== entry.trace) {
    throw new Error(`The trace of ${id} has changed since it was last verified. ${fix}`);
  }
}

export async function assertVerified(
  record: VerificationRecord,
  id: string,
  kind: ExpectationKind,
  sourceFile: string,
  expectationFile: string,
): Promise<void> {
  const entry = record.examples[id];
  const fix = "Run npm run check:examples, review any changed output or error message, and commit the updated content/verified-examples.json.";
  if (!entry) throw new Error(`Example ${id} has never been verified. ${fix}`);
  if (entry.kind !== kind) throw new Error(`Example ${id} was verified as ${entry.kind} but is now ${kind}. ${fix}`);
  const [source, expected] = await Promise.all([readFile(sourceFile, "utf8"), readFile(expectationFile, "utf8")]);
  if (sha256(source) !== entry.source || sha256(expected) !== entry.expected) {
    throw new Error(`Example ${id} has changed since it was last verified. ${fix}`);
  }
}
