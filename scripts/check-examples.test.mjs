// Tests for the example runner itself, using throwaway fixtures in a temporary
// folder. Run with `npm run test:runner`. These prove the runner fails when it should.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { checkExamples, LANGUAGES } from "./lib/example-runner.mjs";

const created = [];
async function fixture(files, languages = { python: LANGUAGES.python }) {
  const root = await mkdtemp(join(tmpdir(), "codebloom-runner-test-"));
  created.push(root);
  for (const [path, content] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), content);
  }
  return { root, languages };
}
after(async () => {
  for (const root of created) await rm(root, { recursive: true, force: true });
});

test("passes when the real output matches", async () => {
  const { root, languages } = await fixture({
    "python/ok.py": 'print("hi")\n',
    "python/ok.expected.txt": "hi\n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, true);
  assert.equal(result.results.length, 1);
});

test("passes when the example and its expected output were saved with Windows line endings", async () => {
  const { root, languages } = await fixture({
    "python/crlf.py": 'print("one")\r\nprint("two")\r\n',
    "python/crlf.expected.txt": "one\r\ntwo\r\n",
  });
  const result = await checkExamples({ root, languages });
  assert.deepEqual(result.problems, []);
  assert.equal(result.ok, true);
});

test("line endings are the only thing normalized: a missing blank line or trailing space still fails", async () => {
  const blankLine = await fixture({
    "python/b.py": 'print("one")\nprint()\nprint("two")\n',
    "python/b.expected.txt": "one\r\ntwo\r\n",
  });
  assert.equal((await checkExamples(blankLine)).ok, false);
  const trailingSpace = await fixture({
    "python/t.py": 'print("one ")\n',
    "python/t.expected.txt": "one\r\n",
  });
  assert.equal((await checkExamples(trailingSpace)).ok, false);
});

test("fails when the output differs", async () => {
  const { root, languages } = await fixture({
    "python/bad.py": 'print("hi")\n',
    "python/bad.expected.txt": "hello\n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /output differs/);
});

test("fails when the program exits with an error", async () => {
  const { root, languages } = await fixture({
    "python/crash.py": "raise SystemExit(3)\n",
    "python/crash.expected.txt": "",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /exited with code 3/);
});

test("stops a program that never ends, at the timeout", async () => {
  const { root, languages } = await fixture({
    "python/hang.py": "while True:\n    pass\n",
    "python/hang.expected.txt": "",
  });
  const started = Date.now();
  const result = await checkExamples({ root, languages, timeoutMs: 1000 });
  const elapsed = Date.now() - started;
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /timed out after 1000 ms/);
  assert.ok(elapsed < 5000, `took ${elapsed} ms, expected well under 5000`);
});

test("stops a program that prints without limit", async () => {
  const { root, languages } = await fixture({
    "python/flood.py": 'while True:\n    print("x" * 1000)\n',
    "python/flood.expected.txt": "",
  });
  const result = await checkExamples({ root, languages, timeoutMs: 5000 });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /printed more than/);
});

test("fails when a C example does not compile cleanly", async () => {
  const { root, languages } = await fixture(
    {
      "c/warn.c": "int main(void) { int unused = 1; return 0; }\n",
      "c/warn.expected.txt": "",
    },
    { c: LANGUAGES.c },
  );
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /gcc/);
});

test("reports an example with no expected-output file", async () => {
  const { root, languages } = await fixture({ "python/lonely.py": 'print("x")\n' });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.includes("missing lonely.expected.txt")));
});

test("refuses symbolic links", async () => {
  const { root, languages } = await fixture({
    "python/real.py": 'print("x")\n',
    "python/real.expected.txt": "x\n",
  });
  const outside = join(root, "outside.py");
  await writeFile(outside, 'print("outside")\n');
  await symlink(outside, join(root, "python", "link.py"));
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.includes("python/link.py") && p.includes("symbolic links")));
});

test("refuses unexpected files and folders", async () => {
  const { root, languages } = await fixture({
    "python/ok.py": 'print("x")\n',
    "python/ok.expected.txt": "x\n",
    "python/notes.md": "not an example\n",
    "ruby/a.rb": "puts 1\n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.includes("python/notes.md")));
  assert.ok(result.problems.some((p) => p.startsWith("ruby")));
});

test("fails when a language has no examples, so nothing is silently skipped", async () => {
  const { root, languages } = await fixture({ "python/.keep": "" });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.includes("no examples found")));
});
