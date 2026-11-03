// The two-pane lesson figure (DESIGN.md section 7, figure; B Bench's figure
// system inside the Trailhead design). Code on the left; on the right the path
// the program took, the output of the real run and the note for the active line.
// Every value comes from the caller, which takes it from a verified run: a trace,
// a branch the build checked, or a verified variant. Nothing here computes one.
// Chips appear only on lines given a chip, never on every line. Below 1024px the
// right pane moves under the code.

import { tokenStyles } from "@/components/code-block";
import { PredictReveal } from "@/components/predict-reveal";
import { InlineText } from "@/components/prose";
import { ValueChip } from "@/components/value-chip";
import type { CodeToken } from "@/lib/highlight";

export type PathStep = { line: number; kind: "ran" | "skipped" };
export type FigureLine = { tokens: CodeToken[]; chip?: string; state?: "ran" | "skipped" | "current" };

/** The lines a program ran, in order, with any lines it skipped between them. */
export function PathTaken({ steps }: { steps: PathStep[] }) {
  return (
    <ol data-path-taken className="flex flex-wrap items-center gap-2 text-small">
      {steps.map((step, index) => (
        <li key={`${step.line}-${index}`} className="flex items-center gap-2">
          {index > 0 && <span className="text-ink-muted">then</span>}
          <span
            data-path-step={step.kind}
            className={`rounded-control border-2 px-2 py-1 ${step.kind === "ran" ? "border-primary bg-primary-tint text-ink" : "border-dashed border-edge text-ink-muted"}`}
          >
            Line {step.line} {step.kind === "ran" ? "ran" : "skipped"}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Figure({
  title,
  regionLabel,
  lines,
  path,
  output,
  note,
  predict,
  children,
}: {
  title: string;
  /** Names the code for screen readers, for example "Python code: Figure 1" */
  regionLabel: string;
  lines: FigureLine[];
  path?: PathStep[];
  /** The output of the verified run */
  output: string;
  note?: { line: number; text: string };
  /** Hide the output until the learner presses Show; `line` names the line that prints, when the trace shows it */
  predict?: { line?: number };
  /** A control above the code, for an explorer */
  children?: React.ReactNode;
}) {
  const outputPanel = (
    <pre tabIndex={0} role="region" aria-label={`Output of the real run for ${regionLabel}`} className="overflow-x-auto rounded-control bg-sunken px-3 py-2 font-mono text-code">
      <code>{output}</code>
    </pre>
  );
  return (
    <figure data-figure className="rounded-panel border border-rule bg-surface">
      <figcaption className="rounded-t-panel border-b border-rule bg-sunken px-4 py-3 font-heading text-h3">{title}</figcaption>
      {children && <div className="border-b border-rule px-4 py-3">{children}</div>}
      <div className="lg:grid lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
        <pre tabIndex={0} role="region" aria-label={regionLabel} className="overflow-x-auto bg-sunken py-4 font-mono text-code lg:rounded-bl-panel">
          <code className="block">
            {lines.map((line, index) => (
              <span
                key={index}
                data-line={index + 1}
                data-line-state={line.state}
                className={`flex items-center gap-4 border-l-4 pr-4 ${
                  line.state === "current" || line.state === "ran" ? "border-primary bg-primary-tint" : "border-transparent"
                } ${line.state === "skipped" ? "text-ink-muted" : ""}`}
              >
                <span aria-hidden="true" className="w-10 shrink-0 select-none border-r border-rule pr-3 text-right text-ink-muted">
                  {index + 1}
                </span>
                <span data-code-text className="whitespace-pre">
                  {line.tokens.map((token, tokenIndex) => (
                    <span key={tokenIndex} className={line.state === "skipped" ? "" : tokenStyles[token.kind]}>
                      {token.text}
                    </span>
                  ))}
                </span>
                {line.chip && (
                  <span className="ml-auto font-sans">
                    <ValueChip>{line.chip}</ValueChip>
                  </span>
                )}
              </span>
            ))}
          </code>
        </pre>
        <div className="flex flex-col gap-4 border-t border-rule p-4 lg:border-t-0 lg:border-l">
          {path && (
            <div>
              <p className="text-small font-bold text-ink-muted">Path taken</p>
              <div className="mt-2">
                <PathTaken steps={path} />
              </div>
            </div>
          )}
          <div>
            <p className="text-small font-bold text-ink-muted">Output of the real run</p>
            <div className="mt-2">
              {predict ? <PredictReveal line={predict.line}>{outputPanel}</PredictReveal> : outputPanel}
            </div>
          </div>
          {note && (
            <div data-figure-note>
              <p className="text-small font-bold text-ink-muted">Note on line {note.line}</p>
              <p className="mt-1 text-ui">
                <InlineText text={note.text} />
              </p>
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
