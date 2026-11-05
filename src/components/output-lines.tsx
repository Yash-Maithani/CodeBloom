"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Program output as real separate lines in monospace. Screen readers hear
 * "Line 1:" before each line. A long line wraps on screen (output-wrap in
 * globals.css) without changing the text. If anything still overflows, the
 * output becomes focusable, so keyboard users can scroll it (WCAG 2.1.1).
 * Inside a screen-reader-only announcement nothing is seen, so pass `scroll={false}`.
 */
export function OutputLines({ text, empty, scroll = true }: { text: string; empty: string; scroll?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [scrolls, setScrolls] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !scroll) return;
    const measure = () => setScrolls(element.scrollWidth > element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [scroll, text]);

  if (text === "") return <span className="italic">{empty}</span>;
  const lines = text.split("\n");
  return (
    <span
      ref={ref}
      tabIndex={scrolls ? 0 : undefined}
      className={`output-wrap block min-w-0 font-mono text-code ${scroll ? "overflow-x-auto" : ""}`}
    >
      {lines.map((line, index) => (
        <span key={index} className="block">
          {lines.length > 1 && <span className="sr-only">{`Line ${index + 1}: `}</span>}
          {line}
        </span>
      ))}
    </span>
  );
}
