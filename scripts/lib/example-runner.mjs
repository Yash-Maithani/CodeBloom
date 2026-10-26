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

import { spawn } from "node:child_process";
import { mkdtemp, readdir, realpath, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";

export const DEFAULT_TIMEOUT_MS = 10_000;
const MAX_OUTPUT_BYTES = 64 * 1024;
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

// One entry per language. A new language is a new entry plus a content folder,
// not new runner code. `steps` returns the commands to run in order; every
// step must exit with code 0, and the LAST step's standard output is the
// example's output.
export const LANGUAGES = {
  c: {
    label: "C",
    extension: ".c",
    steps: ({ source, name, workDir }) => [
      { command: "gcc", args: ["-std=c17", "-Wall", "-Wextra", "-Werror", source, "-o", join(workDir, name)] },
      { command: join(workDir, name), args: [] },
    ],
  },
  cpp: {
    label: "C++",
    extension: ".cpp",
    steps: ({ source, name, workDir }) => [
      { command: "g++", args: ["-std=c++17", "-Wall", "-Wextra", "-Werror", source, "-o", join(workDir, name)] },
      { command: join(workDir, name), args: [] },
    ],
  },
  java: {
    label: "Java",
    extension: ".java",
    // The file name must match the public class name, as Java requires.
    steps: ({ source, name, workDir }) => [
      { command: "javac", args: ["-Xlint:all", "-Werror", "-d", workDir, source] },
      { command: "java", args: ["-cp", workDir, name] },
    ],
  },
  python: {
    label: "Python",
    extension: ".py",
    // -I isolates Python from user settings and the current folder; -B skips .pyc files.
    steps: ({ source }) => [{ command: "python3", args: ["-I", "-B", source] }],
  },
};

const EXPECTED_SUFFIX = ".expected.txt";

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
    const expectedNames = new Set();
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
      if (entry.name.endsWith(EXPECTED_SUFFIX)) {
        expectedNames.add(entry.name.slice(0, -EXPECTED_SUFFIX.length));
      } else if (entry.name.endsWith(language.extension)) {
        const name = entry.name.slice(0, -language.extension.length);
        if (!NAME_PATTERN.test(name)) {
          problems.push(`${id}: file names must start with a letter and use only letters, digits and underscores`);
          continue;
        }
        sources.push({ key, language, name, file: entry.name, source: join(dir, entry.name) });
      } else {
        problems.push(`${id}: unexpected file (expected ${language.extension} or ${EXPECTED_SUFFIX} files only)`);
      }
    }
    if (sources.length === 0) problems.push(`${key}: no examples found, so nothing would be checked`);
    for (const example of sources) {
      if (!expectedNames.has(example.name)) {
        problems.push(`${key}/${example.file}: missing ${example.name}${EXPECTED_SUFFIX}`);
      } else {
        examples.push({ ...example, expected: join(dir, example.name + EXPECTED_SUFFIX) });
      }
      expectedNames.delete(example.name);
    }
    for (const orphan of expectedNames) {
      problems.push(`${key}/${orphan}${EXPECTED_SUFFIX}: no example file with this name`);
    }
  }
  return { examples, problems };
}

async function checkOne(example, timeoutMs) {
  const id = `${example.key}/${example.file}`;
  const started = Date.now();
  const workDir = await mkdtemp(join(tmpdir(), "codebloom-example-"));
  const finishedWith = (ok, message) => ({ id, ok, message, ms: Date.now() - started });
  try {
    const env = { PATH: process.env.PATH ?? "", LANG: "C.UTF-8", HOME: workDir, TMPDIR: workDir };
    const steps = example.language.steps({ source: example.source, name: example.name, workDir });
    let last;
    for (const step of steps) {
      last = await runProcess(step.command, step.args, { cwd: workDir, env, timeoutMs });
      const what = `${step.command} ${step.args[0] ?? ""}`.trim();
      if (last.startError) {
        return finishedWith(false, `could not start "${step.command}" (${last.startError.code ?? last.startError.message}). Is it installed and on PATH?`);
      }
      if (last.timedOut) return finishedWith(false, `timed out after ${timeoutMs} ms while running: ${what}`);
      if (last.tooMuchOutput) return finishedWith(false, `printed more than ${MAX_OUTPUT_BYTES} bytes while running: ${what}`);
      if (last.code !== 0) {
        return finishedWith(false, `exited with code ${last.code ?? last.signal} while running: ${what}\n${last.stderr.trimEnd()}`);
      }
    }
    const expected = (await readFile(example.expected, "utf8")).replace(/\r\n/g, "\n");
    const actual = last.stdout.replace(/\r\n/g, "\n");
    if (actual !== expected) {
      return finishedWith(false, `output differs\n  expected: ${JSON.stringify(expected)}\n  actual:   ${JSON.stringify(actual)}`);
    }
    return finishedWith(true, "output matches");
  } finally {
    // Only removes the temporary folder created above.
    await rm(workDir, { recursive: true, force: true });
  }
}

export async function checkExamples({ root, languages = LANGUAGES, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  const { examples, problems } = await discover(root, languages);
  const results = [];
  for (const example of examples) results.push(await checkOne(example, timeoutMs));
  return { ok: problems.length === 0 && results.every((r) => r.ok), problems, results };
}
