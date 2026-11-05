"use client";

// An explorer (DESIGN.md section 7): the learner changes one value and sees
// what the program does. Every result is a verified variant, a real run that
// `npm run check:examples` reran and the build checked (src/lib/variants.ts);
// nothing is computed here. The control is a native slider (ordered values) or
// a group of radio buttons (the pointer explorer), so it works with a keyboard
// and screen readers, and each change is announced in words. Without
// JavaScript the control is hidden and ExplorerBlock shows every result in a
// table instead.

import { useId, useState, useSyncExternalStore } from "react";
import { Figure } from "@/components/figure";
import { PointerBoxes } from "@/components/pointer-boxes";
import type { ExplorerData } from "@/lib/explorer-data";

const noSubscription = () => () => {};

export function Explorer({
  data,
  title,
  regionLabel,
  note,
  predict = false,
}: {
  data: ExplorerData;
  /** Defaults to the explorer's title; null when a heading above already names it */
  title?: string | null;
  regionLabel: string;
  note?: { line: number; text: string };
  /** Hide the first output until Show (the homepage hero); changing the value reveals it */
  predict?: boolean;
}) {
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const [index, setIndex] = useState(data.initial);
  const [announcement, setAnnouncement] = useState("");
  const id = useId();
  const run = data.runs[index];

  function choose(next: number) {
    setIndex(next);
    setAnnouncement(data.runs[next].summary);
  }

  const control =
    data.display === "pointer" ? (
      <fieldset data-explorer-control className={ready ? "" : "invisible"} disabled={!ready}>
        <legend className="mb-2 text-ui font-bold">
          Choose what <code className="font-mono">{data.name}</code> points to
        </legend>
        <div className="flex flex-wrap gap-2">
          {data.runs.map((option, optionIndex) => (
            <label
              key={option.value}
              className="inline-flex min-h-12 min-w-12 cursor-pointer items-center justify-center gap-2 rounded-control border-2 border-edge px-4 font-mono text-code transition-colors duration-fast hover:bg-primary-tint has-checked:border-primary has-checked:bg-primary-tint has-checked:font-bold has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
            >
              <input type="radio" name={id} value={option.value} checked={optionIndex === index} onChange={() => choose(optionIndex)} className="sr-only" />
              &amp;{option.value}
            </label>
          ))}
        </div>
      </fieldset>
    ) : (
      <div data-explorer-control className={ready ? "" : "invisible"} inert={!ready}>
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor={id} className="text-ui font-bold">
            Change <code className="font-mono">{data.name}</code>
          </label>
          <output key={run.value} htmlFor={id} aria-hidden="true" className={`rounded-chip bg-primary-tint px-2 py-1 font-mono text-code ${index === data.initial ? "" : "appear"}`}>
            {run.value}
          </output>
        </div>
        <input
          id={id}
          type="range"
          min={0}
          max={data.runs.length - 1}
          step={1}
          value={index}
          onChange={(event) => choose(Number(event.target.value))}
          aria-valuetext={`${data.name} is ${run.value}`}
          className="mt-2 h-12 w-full accent-primary"
        />
        {/* The values the slider can take, under its track; the slider itself says them to screen readers. */}
        <div aria-hidden="true" className="flex justify-between font-mono text-small text-ink-muted">
          {data.runs.map((option) => (
            <span key={option.value}>{option.value}</span>
          ))}
        </div>
      </div>
    );

  return (
    <div data-explorer={data.id} data-explorer-value={run.value}>
      <Figure
        title={title === null ? undefined : (title ?? data.title)}
        regionLabel={regionLabel}
        lines={run.lines}
        path={run.path}
        output={run.output}
        outputFailed={run.failed}
        note={note}
        predict={predict ? { line: data.runs[data.initial].printsFrom, revealed: index !== data.initial } : undefined}
        aside={run.pointer ? <PointerBoxes pointer={data.name} target={run.pointer.target} boxes={run.pointer.boxes} /> : undefined}
      >
        {control}
      </Figure>
      <p role="status" className="sr-only" data-explorer-announcement>
        {announcement}
      </p>
    </div>
  );
}
