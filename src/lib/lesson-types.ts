// The lesson schema (SPEC.md section 6). Each lesson is two files in
// content/lessons/<course>/: <slug>.ts holds everything below, and <slug>.md
// holds the prose in reading order. docs/lesson-authoring.md explains every
// field. TypeScript checks the shape; src/lib/lessons.ts checks the rest at
// build time (placeholders, notes, links, and that published examples were verified).
//
// Text fields may use `code` and **bold**. Links are only allowed in the .md prose.

import type { CodeNote } from "@/lib/code-notes";

export type LessonStatus = "draft" | "published";

/** A program from content/examples/, shown with its notes and its recorded result. */
export type LessonExample = {
  /** "<language>/<file name without extension>", for example "python/variables_change" */
  file: string;
  /** Shown above the code. Optional for mistakes and practice, which have their own headings. */
  caption?: string;
  notes: CodeNote[];
};

/** A real-life comparison. `limit` says where it stops being accurate (required). */
export type Analogy = { title: string; text: string; limit: string };

/** Wrong code, what happens, and the fix. */
export type Mistake = {
  title: string;
  /** May be an example that fails (compile-error or run-error) or one with surprising output. */
  example: LessonExample;
  whatHappens: string;
  howToRead?: string;
  /** For a mistake that gives no error message at all */
  whyEasyToMiss?: string;
  fix: string;
  /** A corrected program, when the fix needs more than a few words. Must run successfully. */
  fixExample?: LessonExample;
};

/** A wrong prediction of a program's output, and the misconception it stands for.
 *  `text` is exactly what the learner would expect to see ("" means nothing is printed). */
export type WrongOutput = { text: string; why: string };

/** An option of a multiple-choice question. Exactly one option is `correct`. */
export type ChoiceOption = { text: string; why: string; correct?: true };

type QuestionBase = {
  question: string;
  /** One to three, revealed one at a time */
  hints: string[];
  /** Shown in the solution, and as the feedback for a correct prediction */
  explanation: string;
};

/**
 * Predict the output. The correct option is the example's verified output,
 * read from its .expected.txt at build time and never typed here. The build
 * refuses a wrong output that equals the real output.
 */
export type PredictOutputQuestion = QuestionBase & {
  kind: "predict-output";
  example: LessonExample;
  wrongOutputs: WrongOutput[];
  /** Where the correct option appears among the options, counting from 1 */
  correctPosition: number;
};

/** A conceptual question. Claims about what a program prints must point to a verified example. */
export type ChoiceQuestion = QuestionBase & {
  kind: "choice";
  options: ChoiceOption[];
};

/** A practice question (SPEC.md FR-P1 to FR-P5). Its solution can always be opened. */
export type PracticeQuestion = PredictOutputQuestion | ChoiceQuestion;

/**
 * A step-through visual of a Python example (SPEC.md FR-V1 to FR-V3). Every
 * line, value and output shown comes from the example's verified trace,
 * content/examples/<file>.trace.json. Only the notes are written by hand.
 */
export type Visual = {
  /** "python/<name>": an output example that has a .trace.json */
  example: string;
  title: string;
  /** Optional explanation for a step, keyed by step number (1 = the first line that ran) */
  notes?: Record<number, string>;
  /**
   * For a step that runs an `if` or `elif` line: whether its condition was true.
   * Checked against the trace. Required when that step has a note.
   */
  branches?: Record<number, boolean>;
};

export type LessonSource = {
  /** Course slug from content/courses.ts, which is also the code language */
  course: string;
  /** Used in the address: /courses/<course>/<slug> */
  slug: string;
  title: string;
  status: LessonStatus;
  /** Shared explanation in content/concepts/<concept>.md, shown as "The idea" */
  concept?: string;
  /** What the learner will be able to do, from their point of view */
  objective: string;
  analogy?: Analogy;
  /** Runnable examples, placed in the .md with {{example <key>}} */
  examples: Record<string, LessonExample>;
  /** Step-through visuals, placed in the .md with {{visual <key>}} */
  visuals?: Record<string, Visual>;
  mistakes: Mistake[];
  practice: PracticeQuestion[];
  /** At least two short points */
  recap: string[];
};
