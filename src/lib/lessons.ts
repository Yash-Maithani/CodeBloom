// Loads every lesson at build time, checks it, and prepares what the pages show.
// Server only: it reads files and runs the highlighter.
//
// A problem in any lesson, draft or published, stops the build with a message
// naming the file. Published lessons must also pass the publish gate: every
// example they show must match content/verified-examples.json (src/lib/verified.ts).
// Pages list and link published lessons only; drafts are checked but never built.

import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Course } from "@content/courses";
import { checkNotes, type CodeNote } from "./code-notes.ts";
import { CODE_LANGUAGES, readExample, type CodeLanguage } from "./examples.ts";
import { highlight, type CodeToken } from "./highlight.ts";
import type { Analogy, LessonExample, LessonSource, Mistake, PracticeQuestion, Visual } from "./lesson-types.ts";
import { linksIn, parseInline, parseProse, type ProseBlock } from "./prose.ts";
import { assertTraceVerified, assertVerified, readRecord, type ExpectationKind, type VerificationRecord } from "./verified.ts";

/** An example ready for CodeBlock: code split into tokens, notes, and the recorded result. */
export type RenderedExample = {
  id: string;
  languageLabel: string;
  caption?: string;
  code: string;
  lines: CodeToken[][];
  notes: CodeNote[];
  kind: ExpectationKind;
  /** The recorded output or error message, never typed by hand */
  result: string;
};

/** An answer option ready for the page. `output` options are shown as program output. */
export type RenderedOption = { text: string; why: string; correct: boolean; output: boolean };

export type RenderedQuestion = {
  source: PracticeQuestion;
  /** The program for predict-the-output questions */
  rendered?: RenderedExample;
  options: RenderedOption[];
};

/** A variable after a step, as the trace recorded it, plus what changed on this step. */
export type StepVariable = { name: string; value: string; type: string; changed: boolean; previous?: string };

/** One line that ran, with the state just after it. Everything here comes from the trace. */
export type RenderedStep = {
  line: number;
  /** The source text of that line, without its indentation */
  code: string;
  variables: StepVariable[];
  /** Everything printed so far, without the final newline */
  output: string;
  /** The line that ran before, when the program jumped over lines to get here */
  jumpedFrom?: number;
  note?: string;
};

export type RenderedVisual = {
  id: string;
  title: string;
  languageLabel: string;
  lines: CodeToken[][];
  steps: RenderedStep[];
};

type TraceFile = { steps: Array<{ line: number; variables: Array<{ name: string; value: string; type: string }>; output: string }> };

export type LessonBlock =
  | { type: "prose"; block: Exclude<ProseBlock, { type: "placeholder" }> }
  | { type: "example"; example: RenderedExample }
  | { type: "visual"; visual: RenderedVisual }
  | { type: "analogy"; analogy: Analogy };

export type LoadedLesson = {
  source: LessonSource;
  course: Course;
  href: string;
  /** "The idea": the shared concept text, when the lesson has a concept */
  concept?: ProseBlock[];
  body: LessonBlock[];
  mistakes: Array<Mistake & { rendered: RenderedExample; renderedFix?: RenderedExample }>;
  practice: RenderedQuestion[];
};

export type BuildInput = {
  courses: Course[];
  sources: LessonSource[];
  /** Folder holding lessons/, concepts/ and examples/ */
  contentRoot: string;
  recordPath: string;
};

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Output compared as a learner reads it: line endings, trailing spaces and trailing blank lines do not count. */
export const sameOutput = (a: string, b: string) => {
  const tidy = (text: string) => text.replace(/\r\n?/g, "\n").split("\n").map((line) => line.trimEnd()).join("\n").replace(/\n+$/, "");
  return tidy(a) === tidy(b);
};
/** A runnable Python example on a lesson page opens in the playground. Practice never does: its output is the answer. */
export const opensInPlayground = (example: RenderedExample) => example.id.startsWith("python/") && example.kind === "output";

export const lessonHref = (course: string, slug: string) => `/courses/${course}/${slug}`;

function plainOnly(text: string, where: string) {
  if (text.trim() === "") throw new Error(`${where}: must not be empty`);
  parseInline(text, where);
}

/** Checks every lesson and prepares it for the pages. Throws on the first problem. */
export async function buildLessons({ courses, sources, contentRoot, recordPath }: BuildInput): Promise<LoadedLesson[]> {
  let record: VerificationRecord | undefined;
  const examplesFolder = path.join(contentRoot, "examples");
  const conceptCache = new Map<string, ProseBlock[]>();
  const seen = new Set<string>();
  const lessons: LoadedLesson[] = [];

  for (const source of sources) {
    const name = `content/lessons/${source.course}/${source.slug}`;
    const course = courses.find((c) => c.slug === source.course);
    if (!course) throw new Error(`${name}: unknown course "${source.course}"`);
    if (!SLUG.test(source.slug)) throw new Error(`${name}: slug must use lowercase letters, digits and single hyphens`);
    if (seen.has(name)) throw new Error(`${name}: two lessons have this course and slug`);
    seen.add(name);
    const topics = course.topics.filter((topic) => topic.lesson === source.slug);
    if (topics.length !== 1) throw new Error(`${name}: must appear exactly once in the topics of course "${course.slug}" in content/courses.ts (found ${topics.length})`);

    plainOnly(source.title, `${name}, title`);
    if (parseInline(source.title, name).some((part) => part.type !== "text")) throw new Error(`${name}, title: must be plain text`);
    plainOnly(source.objective, `${name}, objective`);
    if (source.recap.length < 2) throw new Error(`${name}: the recap needs at least two points`);
    source.recap.forEach((point, i) => plainOnly(point, `${name}, recap point ${i + 1}`));
    if (source.analogy) {
      for (const field of ["title", "text", "limit"] as const) plainOnly(source.analogy[field], `${name}, analogy ${field}`);
    }

    const published = source.status === "published";
    if (published) record ??= await readRecord(recordPath);
    const usedFiles = new Set<string>();
    const render = async (example: LessonExample, where: string, allowed: ExpectationKind[]): Promise<RenderedExample> => {
      const [language, file, extra] = example.file.split("/");
      if (language !== course.slug || !file || extra !== undefined || !(language in CODE_LANGUAGES)) {
        throw new Error(`${where}: file must be "${course.slug}/<name>", not "${example.file}"`);
      }
      if (usedFiles.has(example.file)) throw new Error(`${where}: ${example.file} is already shown in this lesson`);
      usedFiles.add(example.file);
      const loaded = await readExample(language as CodeLanguage, file, examplesFolder);
      if (!allowed.includes(loaded.kind)) throw new Error(`${where}: ${example.file} is a ${loaded.kind} example; allowed here: ${allowed.join(", ")}`);
      if (published) await assertVerified(record!, example.file, loaded.kind, loaded.sourceFile, loaded.expectationFile);
      if (example.caption !== undefined) plainOnly(example.caption, `${where}, caption`);
      const lines = await highlight(loaded.code, loaded.language);
      checkNotes(example.notes, lines.length, `${where} (${example.file})`);
      return {
        id: example.file,
        languageLabel: CODE_LANGUAGES[loaded.language].label,
        caption: example.caption,
        code: loaded.code,
        lines,
        notes: example.notes,
        kind: loaded.kind,
        result: loaded.expectedOutput,
      };
    };

    // A step-through visual: every line, value and output comes from the verified trace.
    const renderVisual = async (id: string, visual: Visual, where: string): Promise<RenderedVisual> => {
      plainOnly(visual.title, `${where}, title`);
      const [language, file, extra] = visual.example.split("/");
      if (language !== "python" || language !== course.slug || !file || extra !== undefined) {
        throw new Error(`${where}: example must be "python/<name>" in a Python lesson, not "${visual.example}"`);
      }
      const loaded = await readExample("python", file, examplesFolder);
      if (loaded.kind !== "output") throw new Error(`${where}: ${visual.example} is a ${loaded.kind} example; a visual needs an output example`);
      const traceFile = path.join(examplesFolder, "python", `${file}.trace.json`);
      const traceText = await readFile(/*turbopackIgnore: true*/ traceFile, "utf8").catch(() => {
        throw new Error(`${where}: ${visual.example} has no trace file ${file}.trace.json`);
      });
      if (published) {
        await assertVerified(record!, visual.example, loaded.kind, loaded.sourceFile, loaded.expectationFile);
        await assertTraceVerified(record!, visual.example, traceFile);
      }
      const trace = JSON.parse(traceText) as TraceFile;
      const sourceLines = loaded.code.split("\n");
      if (!Array.isArray(trace.steps) || trace.steps.length === 0) throw new Error(`${where}: the trace has no steps`);
      for (const step of trace.steps) {
        if (!Number.isInteger(step.line) || step.line < 1 || step.line > sourceLines.length) throw new Error(`${where}: the trace names line ${step.line}, which the example does not have`);
      }
      const final = trace.steps[trace.steps.length - 1].output.replace(/\r\n?/g, "\n").replace(/\n$/, "");
      if (final !== loaded.expectedOutput) throw new Error(`${where}: the trace's final output differs from the verified output of ${visual.example}`);

      const count = trace.steps.length;
      const notes = visual.notes ?? {};
      const branches = visual.branches ?? {};
      for (const key of [...Object.keys(notes), ...Object.keys(branches)].map(Number)) {
        if (!Number.isInteger(key) || key < 1 || key > count) throw new Error(`${where}: step ${key} does not exist; the trace has ${count} steps`);
      }
      Object.entries(notes).forEach(([key, text]) => plainOnly(text, `${where}, note for step ${key}`));
      const indent = (text: string) => text.length - text.trimStart().length;
      trace.steps.forEach((step, index) => {
        const number = index + 1;
        const text = sourceLines[step.line - 1];
        const isCondition = /^\s*(if|elif)\b.*:\s*(#.*)?$/.test(text);
        const declared = branches[number];
        if (declared !== undefined && !isCondition) throw new Error(`${where}: step ${number} runs line ${step.line}, which is not an if or elif line, so it cannot declare a branch`);
        if (isCondition && notes[number] !== undefined && declared === undefined) {
          throw new Error(`${where}: step ${number} checks a condition and has a note, so it must declare whether the condition was true`);
        }
        if (declared !== undefined) {
          // True means the next line that ran is the first line inside the block.
          let body = step.line;
          while (body < sourceLines.length && sourceLines[body].trim() === "") body += 1;
          const firstInside = indent(sourceLines[body] ?? "") > indent(text) ? body + 1 : undefined;
          const next = trace.steps[index + 1]?.line;
          const real = next !== undefined && next === firstInside;
          if (real !== declared) {
            throw new Error(`${where}: step ${number} declares the condition was ${declared}, but the trace shows it was ${real} (next line ${next ?? "none"})`);
          }
        }
      });

      let previous: StepVariable[] = [];
      const steps: RenderedStep[] = trace.steps.map((step, index) => {
        const variables = step.variables.map((variable) => {
          const before = previous.find((other) => other.name === variable.name);
          const changed = !before || before.value !== variable.value || before.type !== variable.type;
          return { ...variable, changed, ...(before && changed ? { previous: before.value } : {}) };
        });
        previous = variables;
        const lastLine = trace.steps[index - 1]?.line;
        return {
          line: step.line,
          code: sourceLines[step.line - 1].trim(),
          variables,
          output: step.output.replace(/\r\n?/g, "\n").replace(/\n$/, ""),
          ...(lastLine !== undefined && step.line !== lastLine + 1 ? { jumpedFrom: lastLine } : {}),
          ...(notes[index + 1] !== undefined ? { note: notes[index + 1] } : {}),
        };
      });
      return { id, title: visual.title, languageLabel: CODE_LANGUAGES.python.label, lines: await highlight(loaded.code, "python"), steps };
    };

    let concept: ProseBlock[] | undefined;
    if (source.concept) {
      if (!SLUG.test(source.concept)) throw new Error(`${name}: concept must be a slug, not "${source.concept}"`);
      const conceptFile = `content/concepts/${source.concept}.md`;
      if (!conceptCache.has(source.concept)) {
        const text = await readFile(path.join(contentRoot, "concepts", `${source.concept}.md`), "utf8").catch(() => {
          throw new Error(`${name}: concept file ${conceptFile} does not exist`);
        });
        conceptCache.set(source.concept, parseProse(text, conceptFile, { headings: false, placeholders: false }));
      }
      concept = conceptCache.get(source.concept);
    }

    const mdFile = `${name}.md`;
    const markdown = await readFile(path.join(contentRoot, "lessons", source.course, `${source.slug}.md`), "utf8").catch(() => {
      throw new Error(`${name}: prose file ${mdFile} does not exist`);
    });
    const placed = new Set<string>();
    const visualsPlaced = new Set<string>();
    let analogyPlaced = false;
    const body: LessonBlock[] = [];
    for (const block of parseProse(markdown, mdFile, { headings: true, placeholders: true })) {
      if (block.type !== "placeholder") {
        body.push({ type: "prose", block });
      } else if (block.kind === "analogy") {
        if (!source.analogy) throw new Error(`${mdFile}: {{analogy}} is placed, but the lesson has no analogy`);
        if (analogyPlaced) throw new Error(`${mdFile}: {{analogy}} is placed more than once`);
        analogyPlaced = true;
        body.push({ type: "analogy", analogy: source.analogy });
      } else if (block.kind === "visual") {
        const visual = source.visuals?.[block.id];
        if (!visual) throw new Error(`${mdFile}: {{visual ${block.id}}} has no matching entry in visuals`);
        if (visualsPlaced.has(block.id)) throw new Error(`${mdFile}: {{visual ${block.id}}} is placed more than once`);
        visualsPlaced.add(block.id);
        body.push({ type: "visual", visual: await renderVisual(block.id, visual, `${name}, visual "${block.id}"`) });
      } else {
        const example = source.examples[block.id];
        if (!example) throw new Error(`${mdFile}: {{example ${block.id}}} has no matching entry in examples`);
        if (placed.has(block.id)) throw new Error(`${mdFile}: {{example ${block.id}}} is placed more than once`);
        placed.add(block.id);
        body.push({ type: "example", example: await render(example, `${name}, example "${block.id}"`, ["output"]) });
      }
    }
    if (source.analogy && !analogyPlaced) throw new Error(`${mdFile}: the lesson has an analogy, so the prose must place it once with {{analogy}}`);
    const unplacedVisuals = Object.keys(source.visuals ?? {}).filter((id) => !visualsPlaced.has(id));
    if (unplacedVisuals.length > 0) throw new Error(`${mdFile}: visuals never placed with {{visual <id>}}: ${unplacedVisuals.join(", ")}`);
    const unplaced = Object.keys(source.examples).filter((id) => !placed.has(id));
    if (unplaced.length > 0) throw new Error(`${mdFile}: examples never placed with {{example <id>}}: ${unplaced.join(", ")}`);
    if (placed.size === 0) throw new Error(`${name}: needs at least one runnable example`);

    const mistakes = [];
    for (const [i, mistake] of source.mistakes.entries()) {
      const where = `${name}, mistake ${i + 1}`;
      plainOnly(mistake.title, `${where}, title`);
      for (const field of ["whatHappens", "fix"] as const) plainOnly(mistake[field], `${where}, ${field}`);
      for (const field of ["howToRead", "whyEasyToMiss"] as const) {
        if (mistake[field] !== undefined) plainOnly(mistake[field], `${where}, ${field}`);
      }
      mistakes.push({
        ...mistake,
        rendered: await render(mistake.example, where, ["output", "compile-error", "run-error"]),
        renderedFix: mistake.fixExample ? await render(mistake.fixExample, `${where}, fix`, ["output"]) : undefined,
      });
    }
    const practice: RenderedQuestion[] = [];
    for (const [i, question] of source.practice.entries()) {
      const where = `${name}, practice ${i + 1}`;
      plainOnly(question.question, `${where}, question`);
      plainOnly(question.explanation, `${where}, explanation`);
      if (question.hints.length < 1 || question.hints.length > 3) throw new Error(`${where}: needs one to three hints`);
      question.hints.forEach((hint, h) => plainOnly(hint, `${where}, hint ${h + 1}`));
      if (question.kind === "predict-output") {
        const rendered = await render(question.example, where, ["output"]);
        const wrong = question.wrongOutputs;
        if (wrong.length < 2 || wrong.length > 3) throw new Error(`${where}: needs two or three wrong outputs`);
        if (!Number.isInteger(question.correctPosition) || question.correctPosition < 1 || question.correctPosition > wrong.length + 1) {
          throw new Error(`${where}: correctPosition must be between 1 and ${wrong.length + 1}`);
        }
        for (const [w, option] of wrong.entries()) {
          plainOnly(option.why, `${where}, wrong output ${w + 1} why`);
          // The guard: a typed wrong option can never be the real output.
          if (sameOutput(option.text, rendered.result)) {
            throw new Error(`${where}: wrong output ${w + 1} is the real output of ${rendered.id}; a wrong option must differ from it`);
          }
          if (wrong.some((other, o) => o < w && sameOutput(other.text, option.text))) throw new Error(`${where}: two wrong outputs are the same`);
        }
        const options: RenderedOption[] = wrong.map((option) => ({ text: option.text, why: option.why, correct: false, output: true }));
        options.splice(question.correctPosition - 1, 0, { text: rendered.result, why: question.explanation, correct: true, output: true });
        practice.push({ source: question, rendered, options });
      } else {
        const { options } = question;
        if (options.length < 3 || options.length > 4) throw new Error(`${where}: needs three or four options`);
        if (options.filter((option) => option.correct).length !== 1) throw new Error(`${where}: exactly one option must be correct`);
        for (const [o, option] of options.entries()) {
          plainOnly(option.text, `${where}, option ${o + 1}`);
          plainOnly(option.why, `${where}, option ${o + 1} why`);
          if (options.some((other, p) => p < o && other.text === option.text)) throw new Error(`${where}: two options are the same`);
        }
        practice.push({ source: question, options: options.map((option) => ({ text: option.text, why: option.why, correct: !!option.correct, output: false })) });
      }
    }

    lessons.push({ source, course, href: lessonHref(source.course, source.slug), concept, body, mistakes, practice });
  }

  for (const course of courses) {
    for (const topic of course.topics) {
      if (topic.lesson && !lessons.some((l) => l.course.slug === course.slug && l.source.slug === topic.lesson)) {
        throw new Error(`content/courses.ts: topic "${topic.title}" in course "${course.slug}" names lesson "${topic.lesson}", which does not exist`);
      }
    }
  }

  // Every link must lead to a real page, and a published lesson may only link to published lessons.
  const pages = new Set(["/", "/courses", ...courses.map((c) => `/courses/${c.slug}`)]);
  for (const lesson of lessons) {
    const blocks = [...(lesson.concept ?? []), ...lesson.body.flatMap((b) => (b.type === "prose" ? [b.block] : []))];
    for (const href of linksIn(blocks)) {
      const target = lessons.find((l) => l.href === href);
      if (pages.has(href) || (target && (target.source.status === "published" || lesson.source.status === "draft"))) continue;
      throw new Error(`${lesson.href}: link to ${href} ${target ? "points to a draft lesson" : "does not lead to a page"}`);
    }
  }
  return lessons;
}

/** Published lessons of one course, in the order of its topics. */
export function publishedIn(lessons: LoadedLesson[], course: Course): LoadedLesson[] {
  return course.topics.flatMap((topic) =>
    lessons.filter((l) => l.course.slug === course.slug && l.source.slug === topic.lesson && l.source.status === "published"),
  );
}

/** Position, previous and next among the published lessons of the same course. */
export function neighbours(lessons: LoadedLesson[], lesson: LoadedLesson) {
  const list = publishedIn(lessons, lesson.course);
  const index = list.indexOf(lesson);
  return { number: index + 1, previous: list[index - 1], next: list[index + 1] };
}

/** Published lessons in other courses that share this lesson's concept. */
export function sameConceptElsewhere(lessons: LoadedLesson[], lesson: LoadedLesson): LoadedLesson[] {
  if (!lesson.source.concept) return [];
  return lessons.filter(
    (l) => l.source.concept === lesson.source.concept && l.course.slug !== lesson.course.slug && l.source.status === "published",
  );
}
