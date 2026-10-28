// Tests for the example runner itself, using throwaway fixtures in a temporary
// folder. Run with `npm run test:runner`. These prove the runner fails when it should.
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readdir, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
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

// ---------- traces for step-through visuals ----------

const TRACER = fileURLToPath(new URL("./lib/python-trace.py", import.meta.url));
const traceOf = (file) => execFileSync("python3", ["-I", "-B", TRACER, file], { encoding: "utf8" });

async function tracedFixture(source, output, edit = (trace) => trace) {
  const { root, languages } = await fixture({ "python/t.py": source, "python/t.expected.txt": output });
  await writeFile(join(root, "python", "t.trace.json"), edit(traceOf(join(root, "python", "t.py"))));
  return { root, languages };
}

test("trace: passes when the saved trace matches a fresh trace, and its hash is recorded", async () => {
  const result = await checkExamples(await tracedFixture("x = 3\nprint(x)\nx = x + 2\nprint(x)\n", "3\n5\n"));
  assert.equal(result.ok, true, result.results[0]?.message);
  assert.match(result.results[0].message, /trace \(4 steps\) match/);
  assert.match(result.record.examples["python/t"].trace, /^[0-9a-f]{64}$/);
});

test("trace: fails when an intermediate value, a line or the output so far was edited, even if the final output is right", async () => {
  for (const [what, edit] of [
    ["an intermediate value", (t) => t.replace('"value": "3"', '"value": "4"')],
    ["a line number", (t) => t.replace('"line": 3', '"line": 2')],
    ["the output so far", (t) => t.replace('"output": "3\\n"', '"output": ""')],
  ]) {
    const result = await checkExamples(await tracedFixture("x = 3\nprint(x)\nx = x + 2\nprint(x)\n", "3\n5\n", edit));
    assert.equal(result.ok, false, what);
    assert.match(result.results[0].message, /trace differs/, what);
  }
});

test("trace: refused next to a C example, an example meant to fail, or with no example", async () => {
  const c = await fixture({ "c/a.c": "int main(void) { return 0; }\n", "c/a.expected.txt": "", "c/a.trace.json": "{}\n" }, { c: LANGUAGES.c });
  assert.ok((await checkExamples(c)).problems.some((p) => p.includes("only supported for Python")));
  const failing = await fixture({ "python/f.py": 'import sys\nsys.exit("x")\n', "python/f.run-error.txt": "x\n", "python/f.trace.json": "{}\n" });
  assert.ok((await checkExamples(failing)).problems.some((p) => p.includes("can have a trace")));
  const orphan = await fixture({ "python/ok.py": 'print("x")\n', "python/ok.expected.txt": "x\n", "python/gone.trace.json": "{}\n" });
  assert.ok((await checkExamples(orphan)).problems.some((p) => p.includes("gone.trace.json: no example file")));
});

test("tracer: records only variables the example defines, never Python internals", async () => {
  const { root } = await fixture({
    "python/i.py": "import math\nimport os as system\nfrom math import sqrt\nx = 1\nshow = print\ny = math.floor(2.5)\nprint(x, y)\n",
  });
  const steps = JSON.parse(traceOf(join(root, "python", "i.py"))).steps;
  const names = new Set(steps.flatMap((step) => step.variables.map((v) => v.name)));
  const types = new Set(steps.flatMap((step) => step.variables.map((v) => v.type)));
  // Fails if any dunder name, module or builtin ever appears.
  assert.deepEqual([...names].filter((n) => n.startsWith("__")), []);
  assert.deepEqual([...types].filter((t) => ["module", "builtin_function_or_method"].includes(t)), []);
  assert.deepEqual([...names].sort(), ["x", "y"]);
  assert.equal(steps.at(-1).output, "1 2\n");
});

// ---------- input files (name.input.txt) ----------

const GREET = 'name = input("Name: ")\nprint("Hi,", name)\n';

test("input: each input() line is echoed after its prompt, and the output matches", async () => {
  const { root, languages } = await fixture({
    "python/greet.py": GREET,
    "python/greet.input.txt": "Ada\n",
    "python/greet.expected.txt": "Name: Ada\nHi, Ada\n",
  });
  const result = await checkExamples({ root, languages });
  assert.deepEqual(result.problems, []);
  assert.equal(result.ok, true, JSON.stringify(result.results));
});

test("input: several lines, a CRLF input file, and no empty line from a final line break", async () => {
  const code = 'a = input("A: ")\nb = input("B: ")\nprint(a + b)\n';
  const { root, languages } = await fixture({
    "python/two.py": code,
    "python/two.input.txt": "12\r\n30\r\n",
    "python/two.expected.txt": "A: 12\nB: 30\n1230\n",
  });
  assert.equal((await checkExamples({ root, languages })).ok, true);
});

test("input: too few lines gives EOFError, and the check fails with that message", async () => {
  const { root, languages } = await fixture({
    "python/greet.py": GREET + 'print(input("More: "))\n',
    "python/greet.input.txt": "Ada\n",
    "python/greet.expected.txt": "Name: Ada\nHi, Ada\nMore: \n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /EOFError: EOF when reading a line/);
  assert.ok(!result.results[0].message.includes("python-input.py"), "the wrapper's own frames are hidden");
});

test("input: an edited input file fails the check, and the recorded input hash changes", async () => {
  const files = { "python/greet.py": GREET, "python/greet.input.txt": "Ada\n", "python/greet.expected.txt": "Name: Ada\nHi, Ada\n" };
  const first = await fixture(files);
  const passed = await checkExamples(first);
  assert.equal(passed.ok, true);
  assert.match(passed.record.examples["python/greet"].input, /^[0-9a-f]{64}$/);

  // Edited input, expected output left alone: the output no longer matches.
  await writeFile(join(first.root, "python/greet.input.txt"), "Bob\n");
  const edited = await checkExamples(first);
  assert.equal(edited.ok, false);
  assert.match(edited.results[0].message, /output differs/);

  // Edited input and a matching expected file: the check passes, but the record's input hash is different.
  await writeFile(join(first.root, "python/greet.expected.txt"), "Name: Bob\nHi, Bob\n");
  const second = await checkExamples(first);
  assert.equal(second.ok, true);
  assert.notEqual(second.record.examples["python/greet"].input, passed.record.examples["python/greet"].input);
  // Line endings do not change the hash.
  await writeFile(join(first.root, "python/greet.input.txt"), "Bob\r\n");
  assert.equal((await checkExamples(first)).record.examples["python/greet"].input, second.record.examples["python/greet"].input);
});

test("input: an example that reads input but has no input file does not hang and fails", async () => {
  const { root, languages } = await fixture({
    "python/greet.py": GREET,
    "python/greet.expected.txt": "Name: Ada\nHi, Ada\n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /EOFError/);
});

test("input: refused next to an error example, with a trace, with no example, or for C", async () => {
  const errorExample = await fixture({ "python/e.py": 'print(1 / 0)\n', "python/e.run-error.txt": "x\n", "python/e.input.txt": "1\n" });
  assert.ok((await checkExamples(errorExample)).problems.some((p) => p.includes("python/e.input.txt") && p.includes("error example must print nothing")));
  const traced = await fixture({ "python/t.py": 'print(input())\n', "python/t.expected.txt": "1\n1\n", "python/t.input.txt": "1\n", "python/t.trace.json": "{}\n" });
  assert.ok((await checkExamples(traced)).problems.some((p) => p.includes("cannot have a trace")));
  const orphan = await fixture({ "python/ok.py": 'print("x")\n', "python/ok.expected.txt": "x\n", "python/lonely.input.txt": "1\n" });
  assert.ok((await checkExamples(orphan)).problems.some((p) => p.includes("lonely.input.txt") && p.includes("no example file named")));
  const c = await fixture({ "c/a.c": "int main(void) { return 0; }\n", "c/a.expected.txt": "", "c/a.input.txt": "1\n" }, { c: LANGUAGES.c });
  assert.ok((await checkExamples(c)).problems.some((p) => p.includes("only supported for Python")));
});

test("input: an error example that never reads input still must print nothing before failing", async () => {
  const { root, languages } = await fixture({
    "python/e.py": 'print("before")\nprint(1 / 0)\n',
    "python/e.run-error.txt": "x\n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /must print nothing to standard output before failing/);
});

test("files: an example that writes a file leaves nothing behind in the examples folder or in the temporary folder", async () => {
  const program = 'with open("out.txt", "w") as file:\n    file.write("hi\\n")\nwith open("out.txt", "r") as file:\n    print(file.read().strip())\n';
  const { root, languages } = await fixture({ "python/w.py": program, "python/w.expected.txt": "hi\n" });
  const workFolders = async () => (await readdir(tmpdir())).filter((name) => name.startsWith("codebloom-example-")).sort();
  const before = await workFolders();
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, true);
  assert.deepEqual(await readdir(join(root, "python")), ["w.expected.txt", "w.py"], "no file is written next to the example");
  assert.deepEqual(await readdir(root), ["python"], "no file is written in the examples root");
  assert.deepEqual(await workFolders(), before, "the temporary working folder is deleted");
});

test("files: reading a file that was never written fails with FileNotFoundError, and the message names the file only", async () => {
  const { root, languages } = await fixture({
    "python/m.py": 'with open("greeting.txt", "r") as file:\n    print(file.read())\n',
    "python/m.run-error.txt": "x\n",
  });
  const result = await checkExamples({ root, languages });
  assert.equal(result.ok, false);
  assert.match(result.results[0].message, /FileNotFoundError: \[Errno 2\] No such file or directory: 'greeting.txt'/);
});
