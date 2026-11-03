"use client";

// Predict then run (DESIGN.md section 8), the pause version: the learner thinks
// first, then presses Show. The output keeps its space while hidden, so nothing
// moves when it appears (CLS 0). Without JavaScript it is simply shown.

import { useState, useSyncExternalStore } from "react";
import { buttonStyles } from "@/components/styles";

const noSubscription = () => () => {};

export function PredictReveal({ line, children }: { /** The line that prints, when the trace shows it */ line?: number; children: React.ReactNode }) {
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const [shown, setShown] = useState(false);
  const hidden = ready && !shown;
  return (
    <div data-predict={hidden ? "waiting" : "shown"}>
      {hidden && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <p className="text-ui">{line ? `Think about what line ${line} prints, then press Show.` : "Think about what this program prints, then press Show."}</p>
          <button type="button" onClick={() => setShown(true)} className={buttonStyles.secondary}>
            Show
          </button>
        </div>
      )}
      <div className={hidden ? "invisible" : "appear"} inert={hidden}>
        {children}
      </div>
    </div>
  );
}
