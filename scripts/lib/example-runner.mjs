// Runs the lesson example files stored in this repository and compares their
// real output with the expected output saved next to them.
//
// Safety model, read this before changing anything:
//   - It only ever runs files found inside the examples folder it is given.
//     The command-line entry (scripts/check-examples.mjs) passes content/examples/
//     and accepts no arguments. Nothing here reads learner input.
//   - It is NOT a sandbox. The examples run with the same permissions as the
//     person or session running the check, so only trusted, reviewed files
//     belong in content/examples/. Running learner code is a different problem
//     (isolation, limits, abuse) that is out of scope until a milestone designs it.
//   - Guards that do exist: no shell, a timeout per step, an output size cap,
//     a minimal environment, a fresh temporary work folder per example, and
//     refusal of symbolic links and unexpected files.
//
// Every example has exactly one expectation file next to it:
//   name.expected.txt       every step succeeds; standard output must match exactly.
//   name.compile-error.txt  the compile step fails (C, C++ and Java only);
//                           its error output must match exactly.
//   name.run-error.txt      compiling succeeds, the program exits with an error,
//                           prints nothing to standard output, and its error
//                           output must match exactly.
// A Python example may also have name.input.txt: the lines a person types. Each
// input() call reads one line, and the line is echoed after its prompt, as a
// terminal and the playground show it (scripts/lib/python-input.py explains why
// the echo is simulated). Only an example that succeeds (name.expected.txt) may
// have one: an error example must print nothing before it fails, and a prompt
// and echoed input would be printed first. No example with input has a trace.
// Error output is compared after two changes only: line endings become \n, and
// the folders of the source file and the work folder are removed from paths,
// so "/home/.../c/undeclared.c:6:20" is compared as "undeclared.c:6:20".
// Error messages are matched exactly against the toolchain recorded in
// PROGRESS.md (gcc 13.3, Python 3.13, UTF-8 locale). If a new compiler words a
// message differently, the check fails and a person reviews the new message.
// Nothing here ever rewrites an expectation file.

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readdir, realpath, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_BYTES = 64 * 1024;
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

// One entry per language. A new language is a new entry plus a content folder,
// not new runner code. `steps` returns the commands to run in order; every
// step must exit with code 0, and the LAST step's standard output is the
// example's output. `compiles: true` means the first step is the compiler.
export const LANGUAGES = {
  c: {
    label: "C",
    compiles: true,
    extension: ".c",
    steps: ({ source, name, workDir }) => [
      { command: "gcc", args: ["-std=c17", "-Wall", "-Wextra", "-Werror", source, "-o", join(workDir, name)] },
      { command: join(workDir, name), args: [] },
    ],
  },
  cpp: {
    label: "C++",
    compiles: true,
    extension: ".cpp",
    steps: ({ source, name, workDir }) => [
      { command: "g++", args: ["-std=c++17", "-Wall", "-Wextra", "-Werror", source, "-o", join(workDir, name)] },
      { command: join(workDir, name), args: [] },
    ],
  },
  java: {
    label: "Java",
    compiles: true,
    extension: ".java",
    // The file name must match the public class name, as Java requires.
    steps: ({ source, name, workDir }) => [
      { command: "javac", args: ["-Xlint:all", "-Werror", "-d", workDir, source] },
      { command: "java", args: ["-cp", workDir, name] },
    ],
  },
  python: {
    label: "Python",
    compiles: false,
    extension: ".py",
    // -I isolates Python from user settings and the current folder; -B skips .pyc files.
    steps: ({ source }) => [{ command: "python3", args: ["-I", "-B", source] }],
    // The same, for an example with an input file: input is fed by python-input.py.
    inputSteps: ({ source, input }) => [{ command: "python3", args: ["-I", "-B", INPUT_RUNNER, source, input] }],
    // Step-through visuals: python-trace.py runs the example line by line.
    trace: ({ source }) => ({ command: "python3", args: ["-I", "-B", TRACER, source] }),
  },
};

// The three kinds of expectation file, by suffix.
export const EXPECTATIONS = {
  output: ".expected.txt",
  "compile-error": ".compile-error.txt",
  "run-error": ".run-error.txt",
};
const SUFFIXES = Object.entries(EXPECTATIONS);

// An optional trace for a step-through visual: name.trace.json next to a Python
// example that has name.expected.txt. check:examples reruns the tracer and the
// trace must match the file exactly: every line that ran, every intermediate
// value and the output so far, not only the final output.
export const TRACE_SUFFIX = ".trace.json";
const TRACER = fileURLToPath(new URL("./python-trace.py", import.meta.url));

// An optional input file: name.input.txt next to a Python example, one line per input() call.
export const INPUT_SUFFIX = ".input.txt";
const INPUT_RUNNER = fileURLToPath(new URL("./python-input.py", import.meta.url));

// Windows line endings (\r\n) and old Mac ones (\r) become \n before output is
// compared, so an expected file saved on Windows still matches. Nothing else is
// touched. The same rule lives in src/lib/line-endings.ts; this script runs as
// plain Node and does not read TypeScript, so it keeps its own one-line copy.
const normalizeLineEndings = (text) => text.replace(/\r\n?/g, "\n");

function runProcess(command, args, { cwd, env, timeoutMs }) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      env,
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
      // Own process group, so a timeout can stop the program and anything it started.
      detached: true,
    });
    const out = [];
    const err = [];
    let bytes = 0;
    let timedOut = false;
    let tooMuchOutput = false;
    let done = false;

    const killAll = () => {
      try {
        process.kill(-child.pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    };
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({
        stdout: Buffer.concat(out).toString("utf8"),
        stderr: Buffer.concat(err).toString("utf8"),
        timedOut,
        tooMuchOutput,
        ...result,
      });
    };
    const collect = (list) => (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_OUTPUT_BYTES) {
        tooMuchOutput = true;
        killAll();
        return;
      }
      list.push(chunk);
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killAll();
    }, timeoutMs);
    child.stdout.on("data", collect(out));
    child.stderr.on("data", collect(err));
    child.on("error", (error) => finish({ code: null, signal: null, startError: error }));
    child.on("close", (code, signal) => finish({ code, signal }));
  });
}

// Finds the examples and reports anything unexpected instead of ignoring it,
// so a file can never sit in the examples folder without being checked.
async function discover(root, languages) {
  const problems = [];
  const examples = [];
  const rootReal = await realpath(root);

  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (!(entry.name in languages) || !entry.isDirectory()) {
      problems.push(`${entry.name}: only these language folders are allowed here: ${Object.keys(languages).join(", ")}`);
    }
  }

  for (const [key, language] of Object.entries(languages)) {
    const dir = join(root, key);
    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      problems.push(`${key}: folder is missing`);
      continue;
    }
    const sources = [];
    // Example name -> list of [kind, file name] expectation files found for it.
    const expectations = new Map();
    const traces = new Map();
    const inputs = new Map();
    for (const entry of entries) {
      const id = `${key}/${entry.name}`;
      if (entry.isSymbolicLink() || !entry.isFile()) {
        problems.push(`${id}: symbolic links and folders are not allowed`);
        continue;
      }
      const real = await realpath(join(dir, entry.name));
      if (!real.startsWith(rootReal + sep)) {
        problems.push(`${id}: resolves outside the examples folder`);
        continue;
      }
      const expectation = SUFFIXES.find(([, suffix]) => entry.name.endsWith(suffix));
      if (entry.name.endsWith(TRACE_SUFFIX)) {
        traces.set(entry.name.slice(0, -TRACE_SUFFIX.length), entry.name);
      } else if (entry.name.endsWith(INPUT_SUFFIX)) {
        inputs.set(entry.name.slice(0, -INPUT_SUFFIX.length), entry.name);
      } else if (expectation) {
        const name = entry.name.slice(0, -expectation[1].length);
        expectations.set(name, [...(expectations.get(name) ?? []), [expectation[0], entry.name]]);
      } else if (entry.name.endsWith(language.extension)) {
        const name = entry.name.slice(0, -language.extension.length);
        if (!NAME_PATTERN.test(name)) {
          problems.push(`${id}: file names must start with a letter and use only letters, digits and underscores`);
          continue;
        }
        sources.push({ key, language, name, file: entry.name, source: join(dir, entry.name) });
      } else {
        problems.push(`${id}: unexpected file (expected ${language.extension}, ${[...SUFFIXES.map(([, suffix]) => suffix), TRACE_SUFFIX, INPUT_SUFFIX].join(", ")} files only)`);
      }
    }
    if (sources.length === 0) problems.push(`${key}: no examples found, so nothing would be checked`);
    for (const example of sources) {
      const found = expectations.get(example.name) ?? [];
      expectations.delete(example.name);
      const traceFile = traces.get(example.name);
      traces.delete(example.name);
      const inputFile = inputs.get(example.name);
      inputs.delete(example.name);
      if (inputFile && !language.inputSteps) {
        problems.push(`${key}/${inputFile}: input files are only supported for Python examples`);
        continue;
      }
      if (inputFile && found.length === 1 && found[0][0] !== "output") {
        problems.push(`${key}/${inputFile}: only an example with ${example.name}${EXPECTATIONS.output} can have an input file (an error example must print nothing before it fails)`);
        continue;
      }
      if (inputFile && traceFile) {
        problems.push(`${key}/${inputFile}: an example with an input file cannot have a trace`);
        continue;
      }
      if (traceFile && !language.trace) {
        problems.push(`${key}/${traceFile}: traces are only supported for Python examples`);
        continue;
      }
      if (traceFile && found.length === 1 && found[0][0] !== "output") {
        problems.push(`${key}/${traceFile}: only an example with ${example.name}${EXPECTATIONS.output} can have a trace`);
        continue;
      }
      if (found.length === 0) {
        problems.push(`${key}/${example.file}: missing ${example.name}${EXPECTATIONS.output} (or a .compile-error.txt or .run-error.txt file)`);
      } else if (found.length > 1) {
        problems.push(`${key}/${example.file}: has ${found.map(([, file]) => file).join(" and ")}; an example has exactly one expectation file`);
      } else if (found[0][0] === "compile-error" && !language.compiles) {
        problems.push(`${key}/${found[0][1]}: ${language.label} has no separate compile step; use ${example.name}${EXPECTATIONS["run-error"]}`);
      } else {
        examples.push({
          ...example,
          kind: found[0][0],
          expected: join(dir, found[0][1]),
          ...(traceFile ? { trace: join(dir, traceFile) } : {}),
          ...(inputFile ? { input: join(dir, inputFile) } : {}),
        });
      }
    }
    for (const [name, file] of traces) problems.push(`${key}/${file}: no example file named ${name}${language.extension}`);
    for (const [name, file] of inputs) problems.push(`${key}/${file}: no example file named ${name}${language.extension}`);
    for (const [name, found] of expectations) {
      for (const [, file] of found) problems.push(`${key}/${file}: no example file named ${name}${language.extension}`);
    }
  }
  return { examples, problems };
}

/** Error output with \n line endings and without the folders of the source and work folder. */
async function normalizeErrorOutput(text, example, workDir) {
  let result = normalizeLineEndings(text);
  const folders = new Set([dirname(example.source), await realpath(dirname(example.source)), workDir, await realpath(workDir)]);
  for (const folder of folders) result = result.split(folder + sep).join("");
  return result;
}

async function checkOne(example, timeoutMs) {
  const id = `${example.key}/${example.file}`;
  const started = Date.now();
  const workDir = await mkdtemp(join(tmpdir(), "codebloom-example-"));
  const finishedWith = (ok, message) => ({ id, ok, message, ms: Date.now() - started });
  const describe = (step) => `${step.command} ${step.args[0] ?? ""}`.trim();
  try {
    const env = { PATH: process.env.PATH ?? "", LANG: "C.UTF-8", HOME: workDir, TMPDIR: workDir };
    const steps = example.input
      ? example.language.inputSteps({ source: example.source, input: example.input })
      : example.language.steps({ source: example.source, name: example.name, workDir });
    // The step that is meant to fail, if any: the compiler, or the program itself.
    const failingStep =
      example.kind === "compile-error" ? 0 : example.kind === "run-error" ? steps.length - 1 : -1;
    let last;
    for (const [index, step] of steps.entries()) {
      last = await runProcess(step.command, step.args, { cwd: workDir, env, timeoutMs });
      if (last.startError) {
        return finishedWith(false, `could not start "${step.command}" (${last.startError.code ?? last.startError.message}). Is it installed and on PATH?`);
      }
      if (last.timedOut) return finishedWith(false, `timed out after ${timeoutMs} ms while running: ${describe(step)}`);
      if (last.tooMuchOutput) return finishedWith(false, `printed more than ${MAX_OUTPUT_BYTES} bytes while running: ${describe(step)}`);
      if (index === failingStep) {
        if (last.code === 0) {
          const what = example.kind === "compile-error" ? "compiled without an error" : "ran without an error";
          return finishedWith(false, `expected an error, but it ${what} (${describe(step)})`);
        }
        if (example.kind === "run-error" && last.stdout !== "") {
          return finishedWith(false, `a run-error example must print nothing to standard output before failing, but it printed ${JSON.stringify(last.stdout)}`);
        }
        const expected = normalizeLineEndings(await readFile(example.expected, "utf8"));
        const actual = await normalizeErrorOutput(last.stderr, example, workDir);
        if (actual !== expected) {
          return finishedWith(false, `error message differs\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
        }
        return finishedWith(true, `fails as expected (${example.kind}) with the recorded message`);
      }
      if (last.code !== 0) {
        return finishedWith(false, `exited with code ${last.code ?? last.signal} while running: ${describe(step)}\n${last.stderr.trimEnd()}`);
      }
    }
    const expected = normalizeLineEndings(await readFile(example.expected, "utf8"));
    const actual = normalizeLineEndings(last.stdout);
    if (actual !== expected) {
      return finishedWith(false, `output differs\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
    }
    if (!example.trace) return finishedWith(true, "output matches");

    // The trace: rerun the example line by line and compare with the file.
    const tracer = example.language.trace({ source: example.source });
    const traced = await runProcess(tracer.command, tracer.args, { cwd: workDir, env, timeoutMs });
    if (traced.startError) return finishedWith(false, `could not start the tracer (${traced.startError.code ?? traced.startError.message})`);
    if (traced.timedOut) return finishedWith(false, `the tracer timed out after ${timeoutMs} ms`);
    if (traced.tooMuchOutput) return finishedWith(false, `the tracer printed more than ${MAX_OUTPUT_BYTES} bytes`);
    if (traced.code !== 0) return finishedWith(false, `the tracer exited with code ${traced.code ?? traced.signal}\n${traced.stderr.trimEnd()}`);
    const trace = normalizeLineEndings(traced.stdout);
    const savedTrace = normalizeLineEndings(await readFile(example.trace, "utf8"));
    if (trace !== savedTrace) {
      return finishedWith(false, `trace differs from ${example.name}${TRACE_SUFFIX}\n  expected: ${JSON.stringify(savedTrace)}\n  actual:   ${JSON.stringify(trace)}`);
    }
    // The traced run must print exactly what the normal run printed.
    const traceSteps = JSON.parse(trace).steps;
    if (traceSteps.length === 0) return finishedWith(false, "the trace has no steps");
    const finalOutput = traceSteps[traceSteps.length - 1].output;
    if (finalOutput !== actual) {
      return finishedWith(false, `the trace's final output differs from the real output\n  trace:  ${JSON.stringify(finalOutput)}\n  output: ${JSON.stringify(actual)}`);
    }
    return finishedWith(true, `output and trace (${traceSteps.length} steps) match`);
  } finally {
    // Only removes the temporary folder created above.
    await rm(workDir, { recursive: true, force: true });
  }
}

// ---------- the verification record ----------
//
// When every example passes, the check writes content/verified-examples.json:
// for each example, a SHA-256 hash of its source and of its expectation file,
// both taken after line endings become \n (so a Windows checkout gives the same
// hashes). The site build recomputes these hashes for every example a published
// page shows, and stops if one is missing or different (src/lib/verified.ts).
// The record is sorted and has no dates or versions, so rerunning the check
// without changes writes exactly the same file.

const sha256 = (text) => createHash("sha256").update(normalizeLineEndings(text), "utf8").digest("hex");

export const RECORD_ABOUT =
  "Written by npm run check:examples when every example passes. Do not edit by hand. The site build refuses to show an example whose files no longer match these hashes.";

async function buildRecord(examples) {
  const entries = [];
  for (const example of examples) {
    entries.push([
      `${example.key}/${example.name}`,
      {
        kind: example.kind,
        source: sha256(await readFile(example.source, "utf8")),
        expected: sha256(await readFile(example.expected, "utf8")),
        ...(example.trace ? { trace: sha256(await readFile(example.trace, "utf8")) } : {}),
        ...(example.input ? { input: sha256(await readFile(example.input, "utf8")) } : {}),
      },
    ]);
  }
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return { about: RECORD_ABOUT, examples: Object.fromEntries(entries) };
}

/** Writes the record only for a run where everything passed. Returns true if it wrote. */
export async function writeRecordIfPassed(result, file) {
  if (!result.ok || !result.record) return false;
  await writeFile(file, JSON.stringify(result.record, null, 2) + "\n");
  return true;
}

export async function checkExamples({ root, languages = LANGUAGES, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const { examples, problems } = await discover(root, languages);
  const results = [];
  for (const example of examples) results.push(await checkOne(example, timeoutMs));
  const ok = problems.length === 0 && results.every((r) => r.ok);
  // The record exists only for a run where every example passed.
  return { ok, problems, results, record: ok ? await buildRecord(examples) : undefined };
}
