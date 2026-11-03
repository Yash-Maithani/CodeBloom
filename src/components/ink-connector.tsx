"use client";

// A thin ink line from a note (or a prose term) to the code line it explains
// (DESIGN.md section 7, ink connector). It is drawn only from 1024px, where the
// note sits beside the code; below that the line highlight alone shows the link.
// It grows from the note to the line by scaling, so only transform and opacity
// change; with reduced motion the duration tokens are 0 and it appears at once.
// Decorative: screen readers already hear the note's line number.

import { useLayoutEffect, useState, type RefObject } from "react";

type Point = { x: number; y: number };

/**
 * `container` is the positioned element both ends live in. `from` and `to` are
 * CSS selectors for the two ends inside it; when either is null nothing is drawn.
 */
export function InkConnector({ container, from, to }: { container: RefObject<HTMLElement | null>; from: string | null; to: string | null }) {
  const [ends, setEnds] = useState<{ a: Point; b: Point; width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const root = container.current;
    const start = from ? root?.querySelector(from) : null;
    const end = to ? root?.querySelector(to) : null;
    if (!root || !start || !end || !window.matchMedia("(min-width: 64rem)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- measuring layout is the reason this effect exists
      setEnds(null);
      return;
    }
    const box = root.getBoundingClientRect();
    const f = start.getBoundingClientRect();
    const t = end.getBoundingClientRect();
    setEnds({
      a: { x: f.left - box.left - 4, y: f.top - box.top + f.height / 2 },
      b: { x: t.right - box.left + 8, y: t.top - box.top + t.height / 2 },
      width: box.width,
      height: box.height,
    });
  }, [container, from, to]);

  if (!ends) return null;
  const { a, b } = ends;
  const middle = (a.x + b.x) / 2;
  // A gentle, slightly uneven curve, so it reads as drawn by hand.
  const path = `M${a.x},${a.y} C${middle + 8},${a.y - 10} ${middle - 10},${b.y + 8} ${b.x},${b.y}`;
  return (
    <svg aria-hidden="true" data-ink-connector className="pointer-events-none absolute inset-0 overflow-visible" width={ends.width} height={ends.height}>
      <g className="ink-draw">
        <path d={path} fill="none" className="stroke-primary" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx={b.x} cy={b.y} r="3" className="fill-primary" />
      </g>
    </svg>
  );
}
