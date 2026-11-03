// Turns a verified trace (a step-through visual's RenderedVisual) into what the
// two-pane figure shows. Everything comes from the trace: which lines ran, which
// were skipped, the output, and a condition's result, which is True only when
// the next line that ran is the first indented line under it (the same rule the
// build uses to check a lesson's branch declarations).

import type { FigureLine, PathStep } from "@/components/figure";
import type { RenderedVisual } from "./lessons.ts";

const CONDITION = /^\s*(if|elif)\b.*:\s*(#.*)?$/;

export function figureFromVisual(visual: RenderedVisual): { lines: FigureLine[]; path: PathStep[]; output: string; predictLine?: number } {
  const text = (line: number) => visual.lines[line - 1].map((token) => token.text).join("");
  const indent = (line: number) => text(line).length - text(line).trimStart().length;
  const path: PathStep[] = [];
  const chips = new Map<number, string>();

  visual.steps.forEach((step, index) => {
    if (step.jumpedFrom !== undefined) {
      for (let line = step.jumpedFrom + 1; line < step.line; line++) {
        if (text(line).trim() !== "" && indent(line) > indent(step.jumpedFrom)) path.push({ line, kind: "skipped" });
      }
    }
    path.push({ line: step.line, kind: "ran" });
    if (CONDITION.test(text(step.line))) {
      const next = visual.steps[index + 1]?.line;
      const firstInside = step.line + 1 <= visual.lines.length && indent(step.line + 1) > indent(step.line) ? step.line + 1 : undefined;
      chips.set(step.line, next !== undefined && next === firstInside ? "True" : "False");
    }
  });

  const ran = new Set(path.filter((step) => step.kind === "ran").map((step) => step.line));
  const skipped = new Set(path.filter((step) => step.kind === "skipped").map((step) => step.line));
  const lines: FigureLine[] = visual.lines.map((tokens, index) => ({
    tokens,
    chip: chips.get(index + 1),
    state: ran.has(index + 1) ? "ran" : skipped.has(index + 1) ? "skipped" : undefined,
  }));
  // The line that printed something: the first step whose output grew.
  const printing = visual.steps.filter((step, index) => step.output !== (visual.steps[index - 1]?.output ?? ""));
  return { lines, path, output: visual.steps.at(-1)?.output ?? "", predictLine: printing.length === 1 ? printing[0].line : undefined };
}
