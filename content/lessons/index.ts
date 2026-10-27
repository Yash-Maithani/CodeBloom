// Every lesson, draft or published. Adding a lesson: create its .ts and .md in
// content/lessons/<course>/, import it here, and name it in its course's topics
// in content/courses.ts. Order on the site comes from the topics, not from here.
// docs/lesson-authoring.md has the full workflow.

import type { LessonSource } from "@/lib/lesson-types";
import { cFirstProgram } from "./c/first-program.ts";
import { cVariables } from "./c/variables.ts";
import { pythonDecisions } from "./python/decisions.ts";
import { pythonElif } from "./python/elif.ts";
import { pythonFirstProgram } from "./python/first-program.ts";
import { pythonFunctions } from "./python/functions.ts";
import { pythonInputOutput } from "./python/input-output.ts";
import { pythonLists } from "./python/lists.ts";
import { pythonLoops } from "./python/loops.ts";
import { pythonVariables } from "./python/variables.ts";

export const lessonSources: LessonSource[] = [
  cFirstProgram,
  cVariables,
  pythonFirstProgram,
  pythonVariables,
  pythonInputOutput,
  pythonDecisions,
  pythonElif,
  pythonLoops,
  pythonFunctions,
  pythonLists,
];
