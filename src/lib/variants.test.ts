// Tests for the publish gate's handling of explorer variants. Run with `npm run test:unit`.
// These are the negative controls: any change to a variant's result, its base
// example, its variants file or its trace after verification stops the build.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { assertVariantVerified, type VerificationRecord } from "./verified.ts";

const sha = (text: string) => createHash("sha256").update(text, "utf8").digest("hex");
const BASE = "age = 17\nprint(age >= 18)\n";
const VARIANTS = '{ "line": 1, "name": "age", "base": "17", "values": ["17", "18"] }\n';
const CODE = "age = 18\nprint(age >= 18)\n";
const folders: string[] = [];
after(async () => {
  for (const dir of folders) await rm(dir, { recursive: true, force: true });
});

async function setup(result = "True\n") {
  const dir = await mkdtemp(path.join(tmpdir(), "codebloom-variant-test-"));
  folders.push(dir);
  const files = { baseSourceFile: path.join(dir, "v.py"), variantsFile: path.join(dir, "v.variants.json"), expectationFile: path.join(dir, "v@18.expected.txt") };
  await writeFile(files.baseSourceFile, BASE);
  await writeFile(files.variantsFile, VARIANTS);
  await writeFile(files.expectationFile, result);
  return { ...files, kind: "output" as const, code: CODE };
}
const record: VerificationRecord = {
  examples: { "python/v@18": { kind: "output", base: sha(BASE), variants: sha(VARIANTS), source: sha(CODE), expected: sha("True\n") } },
};

test("a verified variant passes", async () => {
  await assertVariantVerified(record, "python/v@18", await setup());
});

test("negative control: a changed variant result stops the build", async () => {
  await assert.rejects(assertVariantVerified(record, "python/v@18", await setup("False\n")), /changed result/);
});

test("a changed base example or variants file stops the build", async () => {
  const files = await setup();
  await writeFile(files.baseSourceFile, BASE.replace("print", "print "));
  await assert.rejects(assertVariantVerified(record, "python/v@18", files), /base example or variants file/);
  const other = await setup();
  await writeFile(other.variantsFile, VARIANTS.replace('"18"', '"19"'));
  await assert.rejects(assertVariantVerified(record, "python/v@18", other), /base example or variants file/);
});

test("code rebuilt differently from the code that ran, a missing entry, or an added trace stop the build", async () => {
  const files = await setup();
  await assert.rejects(assertVariantVerified(record, "python/v@18", { ...files, code: "age = 18\n" }), /differs from the code that was run/);
  await assert.rejects(assertVariantVerified(record, "python/v@19", files), /never been verified/);
  const trace = path.join(path.dirname(files.expectationFile), "v@18.trace.json");
  await writeFile(trace, "{}");
  await assert.rejects(assertVariantVerified(record, "python/v@18", { ...files, traceFile: trace }), /trace of variant/);
});
