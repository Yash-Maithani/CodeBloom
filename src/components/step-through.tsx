"use client";

// A step-through visual (SPEC.md FR-V1 to FR-V3, DESIGN.md "Step-through
// visuals"). The learner moves forward and back one line at a time and sees
// the line that ran, the variables after it and the output so far.
//
// Every line number, value and output here comes from the example's verified
// trace (src/lib/lessons.ts); only the notes are written by hand. Nothing plays
// by itself. The only motion is the existing 120ms colour change of the current
// line, which is instant when the reader asks for reduced motion.

import { Fragment, useState, useSyncExternalStore } from "react";
import { ArrowRight } from "lucide-react";
import { tokenStyles } from "@/components/code-block";
import { OutputLines } from "@/components/output-lines";
import { InlineText } from "@/components/prose";
import { buttonStyles } from "@/components/styles";
import type { RenderedStep, RenderedVisual } from "@/lib/lessons";
import { plainText } from "@/lib/prose";

const noSubscription = () => () => {};

/** What changed on a step, in words. Built only from the trace. */
export function changesInWords(step: RenderedStep): string {
  const parts: string[] = [];
  if (step.jumpedFrom !== undefined) parts.push(`Python went from line ${step.jumpedFrom} to line ${step.line}.`);
  const changed = step.variables.filter((variable) => variable.changed);
  for (const variable of changed) {
    parts.push(
      variable.previous !== undefined
        ? `${variable.name} changed from ${variable.previous} to ${variable.value}.`
        : `${variable.name} is now ${variable.value}.`,
    );
  }
  if (changed.length === 0) parts.push("No variable changed.");
  return parts.join(" ");
}

export function StepThrough({ visual }: { visual: RenderedVisual }) {
  const total = visual.steps.length;
  // 0 is the start, before anything has run; 1 to total are the lines that ran.
  const [position, setPosition] = useState(0);
  const [edge, setEdge] = useState<string | null>(null);
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const step = position > 0 ? visual.steps[position - 1] : undefined;

  function go(next: number) {
    if (next < 0) return setEdge("This is the start. Nothing has run yet.");
    if (next > total) return setEdge("This is the last step.");
    setEdge(null);
    setPosition(next);
  }

  const heading = step ? `Step ${position} of ${total}. Line ${step.line} ran: ${step.code}` : "Start. Nothing has run yet.";
  const label = plainText(visual.title);

  return (
    <div data-stepper className="rounded-panel border border-rule bg-sheet p-4 md:p-6">
      <pre
        tabIndex={0}
        role="region"
        aria-label={`${visual.languageLabel} code: ${label}`}
        className="overflow-x-auto rounded-panel border border-rule bg-code py-3 font-mono text-mono"
      >
        <code className="block">
          {visual.lines.map((tokens, index) => {
            const current = step?.line === index + 1;
            return (
              <span
                key={index}
                data-trace-line={index + 1}
                data-current={current || undefined}
                className={`flex border-l-3 pr-4 transition-colors motion-reduce:transition-none ${current ? "border-accent bg-accent-tint" : "border-transparent"}`}
              >
                <span aria-hidden="true" className="w-8 shrink-0 select-none text-right text-ink-muted">
                  {index + 1}
                </span>
                <span aria-hidden="true" className="flex w-8 shrink-0 select-none items-center justify-center text-accent">
                  {current && <ArrowRight size={16} strokeWidth={1.75} />}
                </span>
                <span className="whitespace-pre">
                  {tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={tokenStyles[token.kind]}>
                      {token.text}
                    </span>
                  ))}
                </span>
              </span>
            );
          })}
        </code>
      </pre>

      <div className="mt-4 max-w-measure" data-step-text>
        <p className="font-bold">{step ? <>Step {position} of {total}. Line {step.line} ran: <code className="font-mono">{step.code}</code></> : "Start. Nothing has run yet."}</p>
        {step && <p className="mt-1">{changesInWords(step)}</p>}
        {step?.note && (
          <p className="mt-1">
            <InlineText text={step.note} />
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm font-bold">Variables</p>
          {step && step.variables.length > 0 ? (
            <ul data-variables className="mt-2 flex flex-wrap gap-4">
              {step.variables.map((variable) => (
                <li key={variable.name} data-variable={variable.name} className="flex flex-col gap-1">
                  <span className="text-sm">{variable.name}</span>
                  <span
                    className={`min-w-12 rounded-control border px-3 py-2 font-mono text-mono ${
                      variable.changed ? "border-2 border-accent bg-accent-tint" : "border-rule-strong bg-sheet"
                    }`}
                  >
                    {variable.value}
                  </span>
                  <span className="text-xs text-ink-muted">
                    {variable.type}
                    {variable.changed && (variable.previous !== undefined ? `, changed (was ${variable.previous})` : ", new")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p data-variables className="mt-2 text-sm italic">No variables yet</p>
          )}
        </div>
        <div>
          <p className="text-sm font-bold">Output so far</p>
          <div data-output-so-far className="mt-2 rounded-panel border border-l-3 border-rule border-l-ink-muted bg-code px-4 py-3">
            <OutputLines text={step?.output ?? ""} empty="nothing yet" />
          </div>
        </div>
      </div>

      {/* Each step is announced in words: the same facts as above, with the
          output read line by line. */}
      <div role="status" className="sr-only" data-announcement>
        {edge ?? (
          <>
            {heading}. {step ? changesInWords(step) : "No variables."} {step?.note ? `${plainText(step.note)} ` : ""}
            Output so far: <OutputLines text={step?.output ?? ""} empty="nothing yet" scroll={false} />
          </>
        )}
      </div>

      {/* The buttons only work once React runs in the browser, so until then
          they are invisible and out of the tab order; their space is kept. */}
      <div className={`mt-4 flex flex-wrap gap-2 ${ready ? "" : "invisible"}`} inert={!ready}>
        <button type="button" onClick={() => go(position - 1)} aria-disabled={position === 0} className={`${buttonStyles.secondary} aria-disabled:text-ink-muted`}>
          Back
        </button>
        <button type="button" onClick={() => go(position + 1)} aria-disabled={position === total} className={`${buttonStyles.primary} aria-disabled:bg-ink-muted`}>
          Next step
        </button>
        <button type="button" onClick={() => go(0)} className={buttonStyles.secondary}>
          Start again
        </button>
      </div>
    </div>
  );
}

/** The text equivalent (FR-V3): every step in a table. Rendered on the server. */
export function TraceTable({ visual }: { visual: RenderedVisual }) {
  return (
    // On a narrow screen the table scrolls sideways, so it can take focus and
    // keyboard users can scroll it, like the code blocks (WCAG 2.1.1).
    <div tabIndex={0} role="region" aria-label={`All steps as a table: ${plainText(visual.title)}`} className="overflow-x-auto">
      <table data-trace-table className="w-full border-collapse text-left text-sm">
        <caption className="sr-only">All steps of: {plainText(visual.title)}</caption>
        <thead>
          <tr className="border-b border-rule-strong">
            <th scope="col" className="py-2 pr-4">Step</th>
            <th scope="col" className="py-2 pr-4">Line that ran</th>
            <th scope="col" className="py-2 pr-4">Variables after it</th>
            <th scope="col" className="py-2">Output so far</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-rule align-top">
            <th scope="row" className="py-2 pr-4 font-normal">Start</th>
            <td className="py-2 pr-4">Nothing has run yet</td>
            <td className="py-2 pr-4">None</td>
            <td className="py-2"><OutputLines text="" empty="nothing yet" /></td>
          </tr>
          {visual.steps.map((step, index) => (
            <tr key={index} className="border-b border-rule align-top">
              <th scope="row" className="py-2 pr-4 font-normal">{index + 1}</th>
              <td className="py-2 pr-4">
                Line {step.line}: <code className="font-mono">{step.code}</code>
              </td>
              <td className="py-2 pr-4">
                {step.variables.map((variable, variableIndex) => (
                  <Fragment key={variable.name}>
                    {variableIndex > 0 && ", "}
                    <code className="font-mono">{variable.name}</code> = <code className="font-mono">{variable.value}</code> ({variable.type})
                  </Fragment>
                ))}
                {step.variables.length === 0 && "None"}
              </td>
              <td className="py-2"><OutputLines text={step.output} empty="nothing yet" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
