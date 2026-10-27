// Tests for the example runner itself, using throwaway fixtures in a temporary
// folder. Run with `npm run test:runner`. These prove the runner fails when it should.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { checkExamples, LANGUAGES, writeRecordIfPassed } from "./lib/example-runner.mjs";

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

// ---------- examples that are meant to fail ----------

test("run-error: passes when the program fails with exactly the recorded message", async () => {
  const result = await checkExamples(await fixture({
    "python/boom.py": 'import sys\nsys.exit("boom")\n',
    "python/boom.run-error.txt": "boom\n",
  }));
  assert.deepEqual(result.problems, []);
  assert.equal(result.ok, true, result.results[0]?.message);
});

test("run-error: the example's folder is removed from paths in the message", async () => {
  const result = await checkExamples(await fixture({
    "python/where.py": "import sys\nsys.stderr.write(__file__ + \"\\n\")\nsys.exit(1)\n",
    "python/where.run-error.txt": "where.py\n",
  }));
  assert.equal(result.ok, true, result.results[0]?.message);
});

test("run-error: fails when the program runs without an error", async () => {
  const result = await checkExamples(await fixture({
    "python/fine.py": 'print("fine")\n',
    "python/fine.run-error.txt": "anything\n",
  }));
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /expected an error, but it ran without an error/);
});

test("run-error: fails when the message differs, even by trailing spaces", async () => {
  const different = await checkExamples(await fixture({
    "python/boom.py": 'import sys\nsys.exit("boom")\n',
    "python/boom.run-error.txt": "bang\n",
  }));
  assert.equal(different.ok, false);
  assert.match(different.results[0].message, /error message differs/);
  const trimmed = await checkExamples(await fixture({
    "python/pad.py": 'import sys\nsys.exit("pad   ")\n',
    "python/pad.run-error.txt": "pad\n",
  }));
  assert.equal(trimmed.ok, false, "trailing spaces in a message are part of it");
});

test("run-error: fails when the program printed to standard output before failing", async () => {
  const result = await checkExamples(await fixture({
    "python/talk.py": 'import sys\nprint("hello")\nsys.exit("boom")\n',
    "python/talk.run-error.txt": "boom\n",
  }));
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /must print nothing to standard output/);
});

test("compile-error: passes when the compiler fails with exactly the recorded message", async () => {
  const result = await checkExamples(await fixture(
    {
      "c/stop.c": "#error stop here\n",
      // gcc 13.3 under C.UTF-8, the recorded toolchain.
      "c/stop.compile-error.txt": "stop.c:1:2: error: #error stop here\n    1 | #error stop here\n      |  ^~~~~\n",
    },
    { c: LANGUAGES.c },
  ));
  assert.equal(result.ok, true, result.results[0]?.message);
});

test("compile-error: fails when the example compiles cleanly", async () => {
  const result = await checkExamples(await fixture(
    { "c/clean.c": "int main(void) { return 0; }\n", "c/clean.compile-error.txt": "anything\n" },
    { c: LANGUAGES.c },
  ));
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /expected an error, but it compiled without an error/);
});

test("run-error in C: fails when the error comes from the compiler instead of the program", async () => {
  const result = await checkExamples(await fixture(
    { "c/early.c": "#error stop here\n", "c/early.run-error.txt": "anything\n" },
    { c: LANGUAGES.c },
  ));
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /exited with code 1 while running: gcc/);
});

test("run-error in C: passes when the compiled program fails with the recorded message", async () => {
  const result = await checkExamples(await fixture(
    {
      "c/late.c": '#include <stdio.h>\nint main(void) { fprintf(stderr, "bad\\n"); return 2; }\n',
      "c/late.run-error.txt": "bad\n",
    },
    { c: LANGUAGES.c },
  ));
  assert.equal(result.ok, true, result.results[0]?.message);
});

test("refuses a compile-error file for Python, which has no separate compile step", async () => {
  const result = await checkExamples(await fixture({
    "python/syn.py": "if x = 1:\n    pass\n",
    "python/syn.compile-error.txt": "anything\n",
  }));
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.includes("no separate compile step")));
});

test("refuses an example with two expectation files", async () => {
  const result = await checkExamples(await fixture({
    "python/two.py": 'print("x")\n',
    "python/two.expected.txt": "x\n",
    "python/two.run-error.txt": "x\n",
  }));
  assert.equal(result.ok, false);
  assert.ok(result.problems.some((p) => p.includes("exactly one expectation file")));
});

// ---------- the verification record ----------

test("record: exists only when everything passed, and is the same on every run", async () => {
  const passing = await fixture({
    "python/a.py": 'print("a")\n', "python/a.expected.txt": "a\n",
    "python/b.py": 'import sys\nsys.exit("b")\n', "python/b.run-error.txt": "b\n",
  });
  const first = await checkExamples(passing);
  const second = await checkExamples(passing);
  assert.equal(first.ok, true);
  assert.deepEqual(Object.keys(first.record.examples), ["python/a", "python/b"]);
  assert.equal(first.record.examples["python/b"].kind, "run-error");
  assert.equal(JSON.stringify(first.record), JSON.stringify(second.record));

  const failing = await fixture({ "python/a.py": 'print("a")\n', "python/a.expected.txt": "nope\n" });
  assert.equal((await checkExamples(failing)).record, undefined);
});

test("record: a CRLF copy of an example gets the same hashes as the LF original", async () => {
  const lf = await checkExamples(await fixture({ "python/a.py": 'print("a")\n', "python/a.expected.txt": "a\n" }));
  const crlf = await checkExamples(await fixture({ "python/a.py": 'print("a")\r\n', "python/a.expected.txt": "a\r\n" }));
  assert.deepEqual(crlf.record, lf.record);
});

test("record: a failed run never overwrites the existing record file", async () => {
  const { root, languages } = await fixture({ "python/a.py": 'print("a")\n', "python/a.expected.txt": "a\n" });
  const file = join(root, "..", `record-${Date.now()}.json`);
  created.push(file);
  assert.equal(await writeRecordIfPassed(await checkExamples({ root, languages }), file), true);
  const valid = await readFile(file, "utf8");

  await writeFile(join(root, "python", "a.expected.txt"), "changed\n");
  const failed = await checkExamples({ root, languages });
  assert.equal(failed.ok, false);
  assert.equal(await writeRecordIfPassed(failed, file), false);
  assert.equal(await readFile(file, "utf8"), valid, "the last valid record is kept");
});
