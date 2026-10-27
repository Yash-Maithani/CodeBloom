// Tests for the publish gate's handling of input files (name.input.txt).
// Run with `npm run test:unit`.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { assertVerified, type VerificationRecord } from "./verified.ts";

const sha = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const folders: string[] = [];
async function files(input?: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "codebloom-gate-test-"));
  folders.push(dir);
  const source = path.join(dir, "greet.py");
  const expected = path.join(dir, "greet.expected.txt");
  await writeFile(source, 'print(input("Name: "))\n');
  await writeFile(expected, "Name: Ada\nAda\n");
  let inputFile: string | undefined;
  if (input !== undefined) {
    inputFile = path.join(dir, "greet.input.txt");
    await writeFile(inputFile, input);
  }
  return { source, expected, inputFile };
}
after(async () => {
  for (const dir of folders) await rm(dir, { recursive: true, force: true });
});

const record = (withInput?: string): VerificationRecord => ({
  examples: {
    "python/greet": {
      kind: "output",
      source: sha('print(input("Name: "))\n'),
      expected: sha("Name: Ada\nAda\n"),
      ...(withInput === undefined ? {} : { input: sha(withInput) }),
    },
  },
});

test("an example with an unchanged input file passes the gate", async () => {
  const f = await files("Ada\n");
  await assertVerified(record("Ada\n"), "python/greet", "output", f.source, f.expected, f.inputFile);
});

test("an example with no input file and no recorded input passes", async () => {
  const f = await files();
  await assertVerified(record(), "python/greet", "output", f.source, f.expected, f.inputFile);
});

test("an edited input file stops the build, even when the source and expected output are unchanged", async () => {
  const f = await files("Bob\n");
  await assert.rejects(() => assertVerified(record("Ada\n"), "python/greet", "output", f.source, f.expected, f.inputFile), /input of example python\/greet has changed/);
});

test("an input file added after verification, or removed after verification, stops the build", async () => {
  const added = await files("Ada\n");
  await assert.rejects(() => assertVerified(record(), "python/greet", "output", added.source, added.expected, added.inputFile), /input .* has changed/);
  const removed = await files();
  await assert.rejects(() => assertVerified(record("Ada\n"), "python/greet", "output", removed.source, removed.expected, removed.inputFile), /input .* has changed/);
});

test("line endings in the input file do not count as a change", async () => {
  const f = await files("Ada\r\n");
  await assertVerified(record("Ada\n"), "python/greet", "output", f.source, f.expected, f.inputFile);
});
