import { CircleX } from "lucide-react";
import type { ExpectationKind } from "@/lib/verified";

// The panel under a code block (DESIGN.md section 7, "Output panel"). It shows
// what a real run printed: the output, or the error message of an example that
// is meant to fail. The text always comes from the example's recorded file.

const headings: Record<ExpectationKind, string> = {
  output: "Expected output",
  "compile-error": "Compiler error message",
  "run-error": "Error message",
};

/**
 * `of` names the code this result belongs to, for example "Python code: The fix".
 * The panel is a focusable, named region like the code above it, so keyboard
 * users can scroll a long error message sideways (WCAG 2.1.1).
 */
export function OutputPanel({ kind, text, of }: { kind: ExpectationKind; text: string; of: string }) {
  const isError = kind !== "output";
  return (
    <div className={`rounded-panel border border-l-3 border-rule bg-code ${isError ? "border-l-error" : "border-l-ink-muted"}`}>
      <p className="flex items-center gap-2 px-4 pt-3 text-sm font-bold">
        {isError && <CircleX aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-error" />}
        {headings[kind]}
      </p>
      <pre
        tabIndex={0}
        role="region"
        aria-label={`${headings[kind]} for ${of}`}
        data-output={kind}
        className="overflow-x-auto px-4 pt-1 pb-4 font-mono text-mono"
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
