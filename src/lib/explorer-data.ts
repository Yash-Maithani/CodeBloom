// Turns a set of verified variants into what an explorer shows (DESIGN.md
// section 7, explorer). Nothing is computed by hand: lines, the path taken and
// a condition's True or False come from each value's recorded trace (the same
// rule as figure-data.ts); output and error text come from its recorded result;
// the pointer explorer's arrow target is read from the recorded output (the one
// variable whose value changed between the "Before" and "After" lines).

import type { FigureLine, PathStep } from "@/components/figure";
import { figureFromVisual } from "./figure-data.ts";
import type { RenderedVisual } from "./lessons.ts";
import type { VariantRun, VariantSet } from "./variants.ts";

export type PointerBox = { name: string; before: string; after: string };

export type ExplorerRun = {
  value: string;
  lines: FigureLine[];
  path?: PathStep[];
  /** The output of the real run, or its error message when `failed` */
  output: string;
  failed: boolean;
  /** The one line that printed, when the trace shows it (for predict then run) */
  printsFrom?: number;
  /** Announced after a change, and shown in the results table */
  summary: string;
  /** Pointer explorers only: the variables before and after, and the one that changed */
  pointer?: { target: string; boxes: PointerBox[] };
};

export type ExplorerData = {
  id: string;
  display: "slider" | "pointer";
  title: string;
  languageLabel: string;
  /** What the learner changes */
  name: string;
  /** The line the value is on */
  line: number;
  initial: number;
  runs: ExplorerRun[];
};

const listInWords = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);
const outputInWords = (output: string) => (output === "" ? "It prints nothing." : `It prints: ${output.split("\n").join(", ")}.`);

function figureOf(run: VariantRun): { lines: FigureLine[]; path?: PathStep[]; printsFrom?: number } {
  if (!run.trace) return { lines: run.lines.map((tokens) => ({ tokens })) };
  // The same steps a step-through visual has, so the path rule is shared.
  const steps = run.trace.map((step, index) => {
    const last = run.trace![index - 1]?.line;
    return { line: step.line, code: "", variables: [], output: step.output, ...(last !== undefined && step.line !== last + 1 ? { jumpedFrom: last } : {}) };
  });
  const visual: RenderedVisual = { id: "", title: "", languageLabel: "", lines: run.lines, steps };
  const figure = figureFromVisual(visual);
  return { lines: figure.lines, path: figure.path, ...(figure.predictLine ? { printsFrom: figure.predictLine } : {}) };
}

const ASSIGNMENTS = /^(Before|After): (\w+ = -?\d+(?:, \w+ = -?\d+)*)$/;
function pointerOf(run: VariantRun, where: string): { target: string; boxes: PointerBox[] } {
  const parsed = run.result.split("\n").map((line) => ASSIGNMENTS.exec(line));
  if (parsed.length !== 2 || !parsed[0] || !parsed[1] || parsed[0][1] !== "Before" || parsed[1][1] !== "After") {
    throw new Error(`${where}: a pointer explorer's output must be one "Before: a = 1, ..." line and one "After: ..." line`);
  }
  const pairs = (text: string) => text.split(", ").map((pair) => pair.split(" = ") as [string, string]);
  const before = pairs(parsed[0][2]);
  const after = pairs(parsed[1][2]);
  if (before.map(([n]) => n).join() !== after.map(([n]) => n).join()) throw new Error(`${where}: Before and After must name the same variables`);
  const boxes = before.map(([name, value], index) => ({ name, before: value, after: after[index][1] }));
  const changed = boxes.filter((box) => box.before !== box.after);
  if (changed.length !== 1) throw new Error(`${where}: exactly one variable must change through the pointer, found ${changed.length}`);
  return { target: changed[0].name, boxes };
}

export function explorerData(set: VariantSet, { title, display = "slider" }: { title: string; display?: "slider" | "pointer" }): ExplorerData {
  const runs = set.runs.map((run): ExplorerRun => {
    const where = `Explorer ${set.id}, ${set.name} ${run.value}`;
    if (run.kind === "compile-error") throw new Error(`${where}: an explorer value must run; compile errors are shown as examples instead`);
    const failed = run.kind === "run-error";
    const figure = figureOf(run);
    const ran = figure.path?.filter((step) => step.kind === "ran").map((step) => String(step.line));
    if (display === "pointer") {
      if (failed) throw new Error(`${where}: a pointer explorer value must run without an error`);
      const pointer = pointerOf(run, where);
      const others = pointer.boxes.filter((box) => box.name !== pointer.target);
      const changed = pointer.boxes.find((box) => box.name === pointer.target)!;
      return {
        value: run.value,
        ...figure,
        output: run.result,
        failed,
        pointer,
        summary: `${set.name} points to ${pointer.target}. Writing through ${set.name} changed ${changed.name} from ${changed.before} to ${changed.after}; ${listInWords(others.map((box) => `${box.name} stayed ${box.after}`))}.`,
      };
    }
    const lastLine = run.result.split("\n").at(-1) ?? "";
    return {
      value: run.value,
      ...figure,
      output: run.result,
      failed,
      summary: `${set.name} is ${run.value}. ${ran ? `Lines that ran: ${listInWords(ran)}. ` : ""}${failed ? `The program stops with an error: ${lastLine}` : outputInWords(run.result)}`,
    };
  });
  return {
    id: set.id,
    display,
    title,
    languageLabel: set.languageLabel,
    name: set.name,
    line: set.line,
    initial: set.runs.findIndex((run) => run.value === set.baseValue),
    runs,
  };
}
