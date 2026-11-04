"use client";

// A code term in the prose, such as `apples`, linked to the lines of the
// example above that use it (decision D19 as changed by the owner). Hovering or
// focusing it highlights those lines and, from 1024px, draws an ink connector
// to the first one. Activating it moves to that line. Screen readers hear the
// term, "link", and which lines use it.

import { useId, useRef, useState } from "react";
import { InkConnector } from "@/components/ink-connector";

export function TermLink({ term, anchors, lines }: { term: string; /** ids of the lines, first one is the target */ anchors: string[]; lines: number[] }) {
  const id = useId().replace(/:/g, "");
  const container = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);
  const where = lines.length === 1 ? `line ${lines[0]}` : `lines ${lines.slice(0, -1).join(", ")} and ${lines.at(-1)}`;

  function highlight(on: boolean) {
    for (const anchor of anchors) document.getElementById(anchor)?.toggleAttribute("data-term-active", on);
    container.current = document.querySelector("[data-lesson-main]");
    setActive(on);
  }

  return (
    <>
      <a
        id={`term-${id}`}
        href={`#${anchors[0]}`}
        data-term-link={term}
        onMouseEnter={() => highlight(true)}
        onMouseLeave={() => highlight(false)}
        onFocus={() => highlight(true)}
        onBlur={() => highlight(false)}
        // One complete name, starting with the visible word, so it is read without a pause.
        aria-label={`${term}, used on ${where} of the example above`}
        className="rounded-chip text-primary underline decoration-dotted decoration-2 underline-offset-4 hover:bg-primary-tint focus-visible:bg-primary-tint"
      >
        <code className="font-mono wrap-anywhere">{term}</code>
      </a>
      {active && <InkConnector container={container} from={`#term-${id}`} to={`#${anchors[0]} [data-code-text]`} />}
    </>
  );
}
