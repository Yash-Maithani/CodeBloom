"use client";

// An explorer (DESIGN.md section 7): the learner changes one value and sees
// what the program does. Every result comes from a verified variant passed in
// by the page (check:examples runs each one); nothing is computed here. A
// native slider or list, so it works with a keyboard and screen readers, and
// each change is announced in words.

import { useId, useState } from "react";
import { Figure, type FigureLine, type PathStep } from "@/components/figure";

export type ExplorerVariant = {
  /** The value as the program shows it, for example "17" */
  value: string;
  lines: FigureLine[];
  path?: PathStep[];
  output: string;
  /** One sentence announced after a change, for example "age 18: line 3 runs and prints You can vote." */
  summary: string;
};

export function Explorer({
  title,
  regionLabel,
  name,
  variants,
  initial = 0,
}: {
  title: string;
  regionLabel: string;
  /** The variable the learner changes, for example "age" */
  name: string;
  variants: ExplorerVariant[];
  initial?: number;
}) {
  const [index, setIndex] = useState(initial);
  const [announcement, setAnnouncement] = useState("");
  const id = useId();
  const variant = variants[index];
  const onlyOne = variants.length < 2;

  function choose(next: number) {
    setIndex(next);
    setAnnouncement(variants[next].summary);
  }

  return (
    <div data-explorer>
      <Figure title={title} regionLabel={regionLabel} lines={variant.lines} path={variant.path} output={variant.output}>
        <div className="flex flex-wrap items-center gap-4">
          <label htmlFor={id} className="font-mono text-code font-bold">
            {name}
          </label>
          <input
            id={id}
            type="range"
            min={0}
            max={variants.length - 1}
            step={1}
            value={index}
            onChange={(event) => choose(Number(event.target.value))}
            aria-valuetext={`${name} is ${variant.value}`}
            aria-disabled={onlyOne || undefined}
            disabled={onlyOne}
            aria-describedby={onlyOne ? `${id}-why` : undefined}
            className="h-12 min-w-0 flex-1 accent-primary disabled:cursor-not-allowed"
          />
          <output htmlFor={id} className="rounded-chip bg-primary-tint px-2 py-1 font-mono text-code">
            {variant.value}
          </output>
        </div>
        {onlyOne && (
          <p id={`${id}-why`} className="mt-2 text-small text-ink-muted">
            Only one verified run is available, so the value cannot change yet.
          </p>
        )}
      </Figure>
      <p role="status" className="sr-only" data-explorer-announcement>
        {announcement}
      </p>
    </div>
  );
}
