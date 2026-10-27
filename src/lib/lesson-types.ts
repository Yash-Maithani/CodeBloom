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

/** A question with a written solution. The example's output is shown only in the solution. */
export type PracticeQuestion = {
  question: string;
  example: LessonExample;
  explanation: string;
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
  mistakes: Mistake[];
  practice: PracticeQuestion[];
  /** At least two short points */
  recap: string[];
};
