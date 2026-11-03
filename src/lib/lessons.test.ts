// Tests for the lesson loader and publish gate (src/lib/lessons.ts).
// Run with `npm run test:unit`. Fixtures live in a temporary folder.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import { courses } from "../../content/courses.ts";
import { lessonSources } from "../../content/lessons/index.ts";
import type { Course } from "../../content/courses.ts";
import type { LessonSource } from "./lesson-types.ts";
import { buildLessons, neighbours, publishedIn, sameConceptElsewhere, type LoadedLesson } from "./lessons.ts";

// ---------- the real lessons ----------

let real: LoadedLesson[];
const site = async () => {
  real ??= await buildLessons({
    courses,
    sources: lessonSources,
    contentRoot: path.join(process.cwd(), "content"),
    recordPath: path.join(process.cwd(), "content", "verified-examples.json"),
  });
  return real;
};
const find = (lessons: LoadedLesson[], href: string) => lessons.find((l) => l.href === href)!;

test("every real lesson loads, passes its checks and the publish gate", async () => {
  const lessons = await site();
  assert.deepEqual(lessons.map((l) => `${l.href} ${l.source.status}`).sort(), [
    "/courses/c/arrays published",
    "/courses/c/conditions published",
    "/courses/c/decisions published",
    "/courses/c/else-if published",
    "/courses/c/first-program published",
    "/courses/c/functions published",
    "/courses/c/loops published",
    "/courses/c/numbers published",
    "/courses/c/pointers published",
    "/courses/c/printf-scanf published",
    "/courses/c/strings published",
    "/courses/c/structures published",
    "/courses/c/variables published",
    "/courses/python/conditions published",
    "/courses/python/decisions published",
    "/courses/python/dictionaries published",
    "/courses/python/elif published",
    "/courses/python/files published",
    "/courses/python/first-program published",
    "/courses/python/functions published",
    "/courses/python/input-output published",
    "/courses/python/lists published",
    "/courses/python/loops published",
    "/courses/python/numbers published",
    "/courses/python/strings published",
    "/courses/python/variables published",
  ]);
});

test("real courses: previous and next follow published lessons in topic order", async () => {
  const lessons = await site();
  const c = courses.find((course) => course.slug === "c")!;
  assert.deepEqual(publishedIn(lessons, c).map((l) => l.source.slug), ["first-program", "variables", "numbers", "printf-scanf", "decisions", "else-if", "conditions", "loops", "functions", "arrays", "strings", "pointers", "structures"]);
  const first = neighbours(lessons, find(lessons, "/courses/c/first-program"));
  assert.equal(first.number, 1);
  assert.equal(first.previous, undefined, "the first lesson has no previous lesson");
  assert.equal(first.next?.href, "/courses/c/variables");
  // C topic order: first program, variables, numbers, printf and scanf, decisions, else if, conditions, loops, functions, arrays, strings, pointers, structures.
  const cNumbers = neighbours(lessons, find(lessons, "/courses/c/numbers"));
  assert.equal(cNumbers.number, 3);
  assert.equal(cNumbers.previous?.href, "/courses/c/variables");
  assert.equal(cNumbers.next?.href, "/courses/c/printf-scanf");
  const cDecisions = neighbours(lessons, find(lessons, "/courses/c/decisions"));
  assert.equal(cDecisions.number, 5);
  assert.equal(cDecisions.previous?.href, "/courses/c/printf-scanf");
  assert.equal(cDecisions.next?.href, "/courses/c/else-if");
  const cConditions = neighbours(lessons, find(lessons, "/courses/c/conditions"));
  assert.equal(cConditions.number, 7);
  assert.equal(cConditions.previous?.href, "/courses/c/else-if");
  assert.equal(cConditions.next?.href, "/courses/c/loops");
  const cLoops = neighbours(lessons, find(lessons, "/courses/c/loops"));
  assert.equal(cLoops.number, 8);
  assert.equal(cLoops.previous?.href, "/courses/c/conditions");
  assert.equal(cLoops.next?.href, "/courses/c/functions");
  const cArrays = neighbours(lessons, find(lessons, "/courses/c/arrays"));
  assert.equal(cArrays.number, 10);
  assert.equal(cArrays.previous?.href, "/courses/c/functions");
  assert.equal(cArrays.next?.href, "/courses/c/strings");
  const cStrings = neighbours(lessons, find(lessons, "/courses/c/strings"));
  assert.equal(cStrings.number, 11);
  assert.equal(cStrings.previous?.href, "/courses/c/arrays");
  assert.equal(cStrings.next?.href, "/courses/c/pointers");
  const cLast = neighbours(lessons, find(lessons, "/courses/c/structures"));
  assert.equal(cLast.number, 13);
  assert.equal(cLast.previous?.href, "/courses/c/pointers");
  assert.equal(cLast.next, undefined, "the last published C lesson has no next lesson");
  // Python topic order: first program, variables, numbers, input and output, decisions, elif, conditions, loops, functions, lists, strings, dictionaries, files.
  const python = courses.find((course) => course.slug === "python")!;
  assert.deepEqual(publishedIn(lessons, python).map((l) => l.source.slug), ["first-program", "variables", "numbers", "input-output", "decisions", "elif", "conditions", "loops", "functions", "lists", "strings", "dictionaries", "files"]);
  const pythonFirst = neighbours(lessons, find(lessons, "/courses/python/first-program"));
  assert.equal(pythonFirst.number, 1);
  assert.equal(pythonFirst.previous, undefined);
  assert.equal(pythonFirst.next?.href, "/courses/python/variables");
  const middle = neighbours(lessons, find(lessons, "/courses/python/input-output"));
  assert.equal(middle.number, 4);
  assert.equal(middle.previous?.href, "/courses/python/numbers");
  assert.equal(middle.next?.href, "/courses/python/decisions");
  const numbers = neighbours(lessons, find(lessons, "/courses/python/numbers"));
  assert.equal(numbers.number, 3);
  assert.equal(numbers.previous?.href, "/courses/python/variables");
  assert.equal(numbers.next?.href, "/courses/python/input-output");
  const conditions = neighbours(lessons, find(lessons, "/courses/python/conditions"));
  assert.equal(conditions.number, 7);
  assert.equal(conditions.previous?.href, "/courses/python/elif");
  assert.equal(conditions.next?.href, "/courses/python/loops");
  const last = neighbours(lessons, find(lessons, "/courses/python/files"));
  assert.equal(last.number, 13);
  assert.equal(last.previous?.href, "/courses/python/dictionaries");
  assert.equal(last.next, undefined, "the last lesson has no next lesson");
  for (const slug of ["cpp", "java"]) assert.deepEqual(publishedIn(lessons, courses.find((x) => x.slug === slug)!), []);
});

test("real lessons: the Variables lessons point to each other as the same concept", async () => {
  const lessons = await site();
  assert.deepEqual(sameConceptElsewhere(lessons, find(lessons, "/courses/python/variables")).map((l) => l.href), ["/courses/c/variables"]);
  assert.deepEqual(sameConceptElsewhere(lessons, find(lessons, "/courses/c/variables")).map((l) => l.href), ["/courses/python/variables"]);
  // These Python lessons share a concept with a C lesson; the others are used by one lesson each.
  const withC: Record<string, string> = {
    "first-program": "/courses/c/first-program",
    numbers: "/courses/c/numbers",
    "input-output": "/courses/c/printf-scanf",
    decisions: "/courses/c/decisions",
    elif: "/courses/c/else-if",
    conditions: "/courses/c/conditions",
    loops: "/courses/c/loops",
    functions: "/courses/c/functions",
    lists: "/courses/c/arrays",
    strings: "/courses/c/strings",
  };
  for (const slug of ["conditions", "decisions", "dictionaries", "elif", "files", "first-program", "functions", "input-output", "lists", "loops", "numbers", "strings"]) {
    const expected = withC[slug] ? [withC[slug]] : [];
    assert.deepEqual(sameConceptElsewhere(lessons, find(lessons, `/courses/python/${slug}`)).map((l) => l.href), expected, slug);
  }
  for (const [python, c] of Object.entries(withC)) {
    assert.deepEqual(sameConceptElsewhere(lessons, find(lessons, c)).map((l) => l.href), [`/courses/python/${python}`], c);
  }
});

test("real lessons: displayed results are the recorded files, including trailing spaces", async () => {
  const lessons = await site();
  const semicolon = find(lessons, "/courses/c/first-program").mistakes[0].rendered;
  assert.equal(semicolon.kind, "compile-error");
  assert.ok(semicolon.result.endsWith("|     ~~~~~~                    "), "gcc's 20 trailing spaces are kept");
  const nameError = find(lessons, "/courses/python/variables").mistakes[0].rendered;
  assert.equal(nameError.kind, "run-error");
  assert.ok(nameError.result.startsWith("Traceback (most recent call last):\n  File \"name_error.py\", line 3"));
});

// ---------- fixtures ----------

const folders: string[] = [];
after(async () => {
  for (const folder of folders) await rm(folder, { recursive: true, force: true });
});

const sha = (text: string) => createHash("sha256").update(text.replace(/\r\n?/g, "\n"), "utf8").digest("hex");

type Fixture = {
  sources: LessonSource[];
  files: Record<string, string>;
  /** Example ids to put in the record (from the files as given, before `after` changes) */
  verified?: string[];
  topics?: Course["topics"];
};

const EXAMPLE_FILES = {
  "examples/python/show.py": "x = 1\nprint(x)\n",
  "examples/python/show.expected.txt": "1\n",
  "examples/python/oops.py": "print(y)\n",
  "examples/python/oops.run-error.txt": "NameError\n",
  "examples/python/q.py": "x = 1\nprint(x)\n",
  "examples/python/q.expected.txt": "1\n",
};

const lesson = (overrides: Partial<LessonSource> = {}): LessonSource => ({
  course: "python",
  slug: "one",
  title: "One",
  status: "draft",
  objective: "Do one thing.",
  examples: { show: { file: "python/show", notes: [{ startLine: 1, endLine: 1, text: "Sets `x`." }] } },
  mistakes: [],
  practice: [],
  recap: ["First point.", "Second point."],
  ...overrides,
});

async function build({ sources, files, verified = [], topics }: Fixture) {
  const root = await mkdtemp(path.join(tmpdir(), "codebloom-lessons-test-"));
  folders.push(root);
  const all: Record<string, string> = { ...EXAMPLE_FILES, "lessons/python/one.md": "Intro.\n\n{{example show}}\n", ...files };
  for (const [name, content] of Object.entries(all)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  const record: Record<string, unknown> = {};
  for (const id of verified) {
    const kind = all[`examples/${id}.expected.txt`] !== undefined ? "output" : "run-error";
    const expectation = kind === "output" ? `examples/${id}.expected.txt` : `examples/${id}.run-error.txt`;
    const trace = all[`examples/${id}.trace.json`];
    record[id] = { kind, source: sha(all[`examples/${id}.py`]), expected: sha(all[expectation]), ...(trace !== undefined ? { trace: sha(trace) } : {}) };
  }
  await writeFile(path.join(root, "record.json"), JSON.stringify({ examples: record }));
  const course: Course = {
    slug: "python",
    name: "Python",
    summary: "s",
    description: "d",
    topics: topics ?? sources.map((s) => ({ title: s.title, lesson: s.slug })),
  };
  return { root, run: () => buildLessons({ courses: [course], sources, contentRoot: root, recordPath: path.join(root, "record.json") }) };
}

const rejects = async (fixture: Fixture, message: RegExp) => {
  const { run } = await build(fixture);
  await assert.rejects(run(), message);
};

// ---------- the publish gate ----------

test("gate: a draft with unverified examples loads, but is never listed as published", async () => {
  const { run } = await build({ sources: [lesson()], files: {} });
  const lessons = await run();
  assert.equal(lessons.length, 1);
  assert.deepEqual(publishedIn(lessons, lessons[0].course), []);
});

test("gate: a published lesson with an example that was never verified stops the build", async () => {
  await rejects({ sources: [lesson({ status: "published" })], files: {} }, /python\/show has never been verified/);
});

test("gate: a published lesson whose example changed after verification stops the build", async () => {
  const { root, run } = await build({ sources: [lesson({ status: "published" })], files: {}, verified: ["python/show"] });
  await run(); // verified as recorded: loads
  await writeFile(path.join(root, "examples/python/show.expected.txt"), "2\n");
  await assert.rejects(run(), /python\/show has changed since it was last verified/);
});

test("gate: a Windows (CRLF) checkout of a verified example still passes", async () => {
  const { root, run } = await build({ sources: [lesson({ status: "published" })], files: {}, verified: ["python/show"] });
  await writeFile(path.join(root, "examples/python/show.py"), "x = 1\r\nprint(x)\r\n");
  await writeFile(path.join(root, "examples/python/show.expected.txt"), "1\r\n");
  const [loaded] = await run();
  assert.equal(loaded.body[1].type === "example" && loaded.body[1].example.result, "1");
});

test("gate: every example of a published lesson is checked, including mistakes and practice", async () => {
  const published = lesson({
    status: "published",
    mistakes: [{ title: "Oops", example: { file: "python/oops", notes: [] }, whatHappens: "it fails.", fix: "fix it." }],
  });
  await rejects({ sources: [published], files: {}, verified: ["python/show"] }, /python\/oops has never been verified/);
  const { run } = await build({ sources: [published], files: {}, verified: ["python/show", "python/oops"] });
  const [loaded] = await run();
  assert.equal(loaded.mistakes[0].rendered.kind, "run-error");
});

// ---------- schema checks ----------

test("placeholders must match the examples exactly", async () => {
  await rejects({ sources: [lesson()], files: { "lessons/python/one.md": "{{example missing}}\n" } }, /\{\{example missing\}\} has no matching entry/);
  await rejects({ sources: [lesson()], files: { "lessons/python/one.md": "{{example show}}\n\n{{example show}}\n" } }, /placed more than once/);
  await rejects({ sources: [lesson()], files: { "lessons/python/one.md": "No examples.\n" } }, /never placed with \{\{example <id>\}\}: show/);
  await rejects({ sources: [lesson({ examples: {} })], files: { "lessons/python/one.md": "Text.\n" } }, /needs at least one runnable example/);
});

test("an analogy needs its limit and must be placed exactly once", async () => {
  const analogy = { title: "A box", text: "Like a box.", limit: "it is not a box." };
  await rejects({ sources: [lesson({ analogy })], files: {} }, /must place it once with \{\{analogy\}\}/);
  await rejects({ sources: [lesson()], files: { "lessons/python/one.md": "{{analogy}}\n\n{{example show}}\n" } }, /lesson has no analogy/);
  await rejects({ sources: [lesson({ analogy: { ...analogy, limit: " " } })], files: {} }, /analogy limit: must not be empty/);
});

test("links must lead to real pages; a published lesson may not link to a draft", async () => {
  const two = lesson({ slug: "two", title: "Two" });
  await rejects({ sources: [lesson()], files: { "lessons/python/one.md": "See [x](/nowhere).\n\n{{example show}}\n" } }, /link to \/nowhere does not lead to a page/);
  const linking = { "lessons/python/one.md": "See [two](/courses/python/two).\n\n{{example show}}\n", "lessons/python/two.md": "{{example show}}\n" };
  await rejects({ sources: [lesson({ status: "published" }), two], files: linking, verified: ["python/show"] }, /points to a draft lesson/);
  const { run } = await build({ sources: [lesson(), two], files: linking });
  assert.equal((await run()).length, 2, "a draft may link to another draft");
});

test("every lesson appears once in its course topics, and every topic lesson exists", async () => {
  await rejects({ sources: [lesson()], files: {}, topics: [{ title: "Something" }] }, /must appear exactly once in the topics/);
  await rejects({ sources: [lesson()], files: {}, topics: [{ title: "One", lesson: "one" }, { title: "Ghost", lesson: "ghost" }] }, /names lesson "ghost", which does not exist/);
});

test("examples must belong to the lesson's language and be the right kind", async () => {
  await rejects({ sources: [lesson({ examples: { show: { file: "c/show", notes: [] } } })], files: {} }, /file must be "python\/<name>"/);
  await rejects(
    { sources: [lesson({ examples: { show: { file: "python/oops", notes: [] } } })], files: {} },
    /python\/oops is a run-error example; allowed here: output/,
  );
});

test("notes must point at real lines, in order", async () => {
  await rejects(
    { sources: [lesson({ examples: { show: { file: "python/show", notes: [{ startLine: 3, endLine: 3, text: "No line 3." }] } } })], files: {} },
    /lines 3 to 3 are outside the 2-line example/,
  );
});

test("text fields are checked: no dashes, no empty recap, no unsupported syntax", async () => {
  await rejects({ sources: [lesson({ objective: "Learn this \u2014 fast." })], files: {} }, /objective: em and en dashes/);
  await rejects({ sources: [lesson({ recap: ["Only one."] })], files: {} }, /recap needs at least two points/);
  await rejects({ sources: [lesson({ recap: ["A `broken point.", "Fine."] })], files: {} }, /recap point 1: a backtick is not closed/);
  await rejects({ sources: [lesson({ title: "A **bold** title" })], files: {} }, /title: must be plain text/);
});

test("a published course with a single lesson has neither previous nor next", async () => {
  const { run } = await build({ sources: [lesson({ status: "published" })], files: {}, verified: ["python/show"] });
  const lessons = await run();
  assert.deepEqual(neighbours(lessons, lessons[0]), { number: 1, previous: undefined, next: undefined });
});

// ---------- practice questions (Milestone 3) ----------

const predictQuestion = (overrides: Record<string, unknown> = {}) => ({
  kind: "predict-output" as const,
  question: "What does it print?",
  example: { file: "python/q", notes: [] },
  correctPosition: 2,
  wrongOutputs: [
    { text: "x", why: "`print(x)` shows the value, not the name." },
    { text: "", why: "Line 2 prints." },
  ],
  hints: ["Follow `x`."],
  explanation: "Line 1 sets `x` to 1.",
  ...overrides,
});

const choiceQuestion = (options: Array<{ text: string; why: string; correct?: true }>, overrides: Record<string, unknown> = {}) => ({
  kind: "choice" as const,
  question: "Which is right?",
  options,
  hints: ["Think."],
  explanation: "Because.",
  ...overrides,
});

const threeOptions = [
  { text: "A", why: "Not A." },
  { text: "B", why: "Yes.", correct: true as const },
  { text: "C", why: "Not C." },
];

test("practice: the correct option is the verified output, placed at correctPosition", async () => {
  const { run } = await build({ sources: [lesson({ practice: [predictQuestion()] })], files: {} });
  const [loaded] = await run();
  assert.deepEqual(
    loaded.practice[0].options.map((option) => [option.text, option.correct]),
    [["x", false], ["1", true], ["", false]],
  );
});

test("practice: a wrong output equal to the real output stops the build, even with other spacing or line endings", async () => {
  for (const text of ["1", "1\n", "1  ", "1\r\n\r\n"]) {
    await rejects(
      { sources: [lesson({ practice: [predictQuestion({ wrongOutputs: [{ text, why: "w" }, { text: "2", why: "w" }] })] })], files: {} },
      /wrong output 1 is the real output of python\/q/,
    );
  }
});

test("practice: predict-output limits and checks", async () => {
  const q = (overrides: Record<string, unknown>) => ({ sources: [lesson({ practice: [predictQuestion(overrides)] })], files: {} });
  await rejects(q({ wrongOutputs: [{ text: "2", why: "w" }] }), /two or three wrong outputs/);
  await rejects(q({ correctPosition: 4 }), /correctPosition must be between 1 and 3/);
  await rejects(q({ wrongOutputs: [{ text: "2", why: "w" }, { text: "2 ", why: "w" }] }), /two wrong outputs are the same/);
  await rejects(q({ wrongOutputs: [{ text: "2", why: "" }, { text: "3", why: "w" }] }), /wrong output 1 why: must not be empty/);
  await rejects(q({ example: { file: "python/oops", notes: [] } }), /python\/oops is a run-error example; allowed here: output/);
});

test("practice: hints must number one to three and pass the text checks", async () => {
  const q = (hints: string[]) => ({ sources: [lesson({ practice: [predictQuestion({ hints })] })], files: {} });
  await rejects(q([]), /needs one to three hints/);
  await rejects(q(["a", "b", "c", "d"]), /needs one to three hints/);
  await rejects(q(["A `broken hint"]), /hint 1: a backtick is not closed/);
});

test("practice: a choice question needs three or four distinct options and exactly one correct", async () => {
  const q = (options: Array<{ text: string; why: string; correct?: true }>) => ({ sources: [lesson({ practice: [choiceQuestion(options)] })], files: {} });
  const { run } = await build(q(threeOptions));
  const [loaded] = await run();
  assert.deepEqual(loaded.practice[0].options.map((option) => option.correct), [false, true, false]);
  assert.equal(loaded.practice[0].rendered, undefined);
  await rejects(q(threeOptions.slice(0, 2)), /three or four options/);
  await rejects(q(threeOptions.map((o) => ({ text: o.text, why: o.why }))), /exactly one option must be correct/);
  await rejects(q([...threeOptions, { text: "D", why: "w", correct: true }]), /exactly one option must be correct/);
  await rejects(q([...threeOptions, { text: "A", why: "again" }]), /two options are the same/);
  await rejects(q([{ text: "A", why: "" }, ...threeOptions.slice(1)]), /option 1 why: must not be empty/);
});

test("practice: a published lesson's question examples go through the publish gate", async () => {
  await rejects(
    { sources: [lesson({ status: "published", practice: [predictQuestion({ example: { file: "python/other", notes: [] } })] })], files: { "examples/python/other.py": "print(2)\n", "examples/python/other.expected.txt": "2\n" }, verified: ["python/show"] },
    /python\/other has never been verified/,
  );
});

// ---------- step-through visuals (Milestone 4) ----------

const BRANCH_SOURCE = 'x = 1\nif x > 5:\n    print("big")\nprint("done")\n';

/** A real trace, made by the project's tracer, of a source file. */
async function realTrace(source: string): Promise<string> {
  const folder = await mkdtemp(path.join(tmpdir(), "codebloom-trace-"));
  folders.push(folder);
  await writeFile(path.join(folder, "b.py"), source);
  return execFileSync("python3", ["-I", "-B", "scripts/lib/python-trace.py", path.join(folder, "b.py")], { encoding: "utf8" });
}

const visualFiles = async (overrides: Record<string, string> = {}) => ({
  "examples/python/b.py": BRANCH_SOURCE,
  "examples/python/b.expected.txt": "done\n",
  "examples/python/b.trace.json": await realTrace(BRANCH_SOURCE),
  "lessons/python/one.md": "Intro.\n\n{{example show}}\n\n{{visual b}}\n",
  ...overrides,
});

const withVisual = (visual: Record<string, unknown> = {}, overrides: Partial<LessonSource> = {}) =>
  lesson({ visuals: { b: { example: "python/b", title: "Step through `b`", ...visual } }, ...overrides } as Partial<LessonSource>);

test("visual: steps, changes and jumps come from the real trace", async () => {
  const { run } = await build({ sources: [withVisual({ notes: { 2: "It is `False`." }, branches: { 2: false } })], files: await visualFiles() });
  const [loaded] = await run();
  const block = loaded.body.find((b) => b.type === "visual");
  assert.ok(block && block.type === "visual");
  const steps = block.visual.steps;
  assert.deepEqual(steps.map((s) => s.line), [1, 2, 4]);
  assert.deepEqual(steps[0].variables, [{ name: "x", value: "1", type: "int", changed: true }]);
  assert.equal(steps[1].variables[0].changed, false);
  assert.equal(steps[2].jumpedFrom, 2);
  assert.deepEqual(steps.map((s) => s.output), ["", "", "done"]);
  assert.equal(steps[1].note, "It is `False`.");
  assert.equal(steps[1].code, "if x > 5:");
});

test("visual: a wrong branch declaration stops the build", async () => {
  await rejects(
    { sources: [withVisual({ notes: { 2: "It is `True`." }, branches: { 2: true } })], files: await visualFiles() },
    /step 2 declares the condition was true, but the trace shows it was false \(next line 4\)/,
  );
});

test("visual: branches only on if lines, and a note on an if step needs its branch", async () => {
  await rejects({ sources: [withVisual({ branches: { 1: true } })], files: await visualFiles() }, /step 1 runs line 1, which is not an if or elif line/);
  await rejects({ sources: [withVisual({ notes: { 2: "Checks it." } })], files: await visualFiles() }, /step 2 checks a condition and has a note, so it must declare/);
});

test("visual: notes and branches must name real steps", async () => {
  await rejects({ sources: [withVisual({ notes: { 4: "No such step." } })], files: await visualFiles() }, /step 4 does not exist; the trace has 3 steps/);
  await rejects({ sources: [withVisual({ notes: { 1: "A `broken note." } })], files: await visualFiles() }, /note for step 1: a backtick is not closed/);
});

test("visual: the trace must exist, fit the example and end with its verified output", async () => {
  await rejects({ sources: [withVisual()], files: await visualFiles({ "examples/python/b.trace.json": "" }) }, /Unexpected end of JSON|has no steps/);
  const files = await visualFiles();
  delete (files as Record<string, string>)["examples/python/b.trace.json"];
  await rejects({ sources: [withVisual()], files }, /has no trace file b.trace.json/);
  const trace = (await visualFiles())["examples/python/b.trace.json"];
  await rejects({ sources: [withVisual()], files: await visualFiles({ "examples/python/b.trace.json": trace.replace('"line": 4', '"line": 9') }) }, /names line 9, which the example does not have/);
  await rejects({ sources: [withVisual()], files: await visualFiles({ "examples/python/b.expected.txt": "finished\n" }) }, /final output differs from the verified output/);
});

test("visual: placement and example rules", async () => {
  await rejects({ sources: [withVisual()], files: await visualFiles({ "lessons/python/one.md": "{{example show}}\n" }) }, /visuals never placed with \{\{visual <id>\}\}: b/);
  await rejects({ sources: [lesson()], files: await visualFiles() }, /\{\{visual b\}\} has no matching entry in visuals/);
  await rejects({ sources: [withVisual({ example: "python/oops" })], files: await visualFiles() }, /python\/oops is a run-error example; a visual needs an output example/);
});

test("visual: the publish gate covers the trace", async () => {
  const published = withVisual({}, { status: "published" });
  await rejects({ sources: [published], files: await visualFiles(), verified: ["python/show"] }, /python\/b has never been verified/);
  const { root, run } = await build({ sources: [published], files: await visualFiles(), verified: ["python/show", "python/b"] });
  await run();
  const path2 = path.join(root, "examples/python/b.trace.json");
  await writeFile(path2, (await visualFiles())["examples/python/b.trace.json"].replace('"value": "1"', '"value": "2"'));
  await assert.rejects(run(), /The trace of python\/b has changed since it was last verified/);
});
