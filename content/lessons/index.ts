// Every lesson, draft or published. Adding a lesson: create its .ts and .md in
// content/lessons/<course>/, import it here, and name it in its course's topics
// in content/courses.ts. Order on the site comes from the topics, not from here.
// docs/lesson-authoring.md has the full workflow.

import type { LessonSource } from "@/lib/lesson-types";
import { cFirstProgram } from "./c/first-program.ts";
import { cFunctions } from "./c/functions.ts";
import { cArrays } from "./c/arrays.ts";
import { cConditions } from "./c/conditions.ts";
import { cDecisions } from "./c/decisions.ts";
import { cElseIf } from "./c/else-if.ts";
import { cLoops } from "./c/loops.ts";
import { cNumbers } from "./c/numbers.ts";
import { cPointers } from "./c/pointers.ts";
import { cPrintfScanf } from "./c/printf-scanf.ts";
import { cStrings } from "./c/strings.ts";
import { cStructures } from "./c/structures.ts";
import { cVariables } from "./c/variables.ts";
import { pythonDecisions } from "./python/decisions.ts";
import { pythonElif } from "./python/elif.ts";
import { pythonConditions } from "./python/conditions.ts";
import { pythonDictionaries } from "./python/dictionaries.ts";
import { pythonFiles } from "./python/files.ts";
import { pythonFirstProgram } from "./python/first-program.ts";
import { pythonFunctions } from "./python/functions.ts";
import { pythonInputOutput } from "./python/input-output.ts";
import { pythonLists } from "./python/lists.ts";
import { pythonLoops } from "./python/loops.ts";
import { pythonNumbers } from "./python/numbers.ts";
import { pythonStrings } from "./python/strings.ts";
import { pythonVariables } from "./python/variables.ts";

export const lessonSources: LessonSource[] = [
  cFirstProgram,
  cVariables,
  cNumbers,
  cPrintfScanf,
  cDecisions,
  cElseIf,
  cConditions,
  cLoops,
  cFunctions,
  cArrays,
  cStrings,
  cPointers,
  cStructures,
  pythonFirstProgram,
  pythonVariables,
  pythonInputOutput,
  pythonDecisions,
  pythonElif,
  pythonLoops,
  pythonFunctions,
  pythonLists,
  pythonStrings,
  pythonDictionaries,
  pythonFiles,
  pythonNumbers,
  pythonConditions,
];
