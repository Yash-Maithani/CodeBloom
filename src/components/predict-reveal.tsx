"use client";

// Predict then run (DESIGN.md section 8), the pause version: the learner thinks
// first, then presses Show. The prompt and the output share one grid cell, so
// the cell is as tall as the taller of the two before and after JavaScript runs
// and before and after Show: nothing moves (CLS 0). While the output is hidden,
// the cell shows a placeholder with the prompt instead of empty space. Without
// JavaScript the output is simply shown, and the hidden prompt only keeps the
// same space.

import { useRef, useState, useSyncExternalStore } from "react";
import { buttonStyles } from "@/components/styles";

const noSubscription = () => () => {};

export function PredictReveal({ line, children }: { /** The line that prints, when the trace shows it */ line?: number; children: React.ReactNode }) {
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const [shown, setShown] = useState(false);
  const output = useRef<HTMLDivElement>(null);
  const hidden = ready && !shown;

  function show() {
    setShown(true);
    // The Show button disappears, so focus moves to the output it revealed.
    requestAnimationFrame(() => output.current?.focus({ preventScroll: true }));
  }

  return (
    <div data-predict={hidden ? "waiting" : "shown"} className="grid grid-cols-1">
      <div
        data-predict-placeholder
        className={`col-start-1 row-start-1 flex flex-col items-start justify-center gap-3 rounded-card border-2 border-dashed border-rule bg-sunken p-4 ${hidden ? "" : "invisible"}`}
        inert={!hidden}
      >
        <p className="text-ui">{line ? `Think about what line ${line} prints, then press Show.` : "Think about what this program prints, then press Show."}</p>
        <button type="button" onClick={show} className={buttonStyles.secondary}>
          Show
        </button>
      </div>
      <div ref={output} tabIndex={-1} className={`col-start-1 row-start-1 outline-offset-2 ${hidden ? "invisible" : ready ? "appear" : ""}`} inert={hidden}>
        {children}
      </div>
    </div>
  );
}
