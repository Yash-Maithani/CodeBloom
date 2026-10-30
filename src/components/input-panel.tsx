// The panel above the output of a C example that reads input (DESIGN.md section 7,
// "Output panel"). It shows the lines a person typed while the program ran,
// exactly as stored in the example's input file. The output panel below it holds
// only what the program printed: a compiled program does not echo what it reads,
// and a terminal draws the typing itself. The text always comes from the recorded
// file, never from the lesson.

/**
 * `of` names the code this input belongs to, for example "C code: Asking for an age".
 * The panel is a focusable, named region like the output panel, so keyboard users
 * can scroll long input sideways (WCAG 2.1.1).
 */
export function InputPanel({ text, of }: { text: string; of: string }) {
  return (
    <div className="rounded-panel border border-l-3 border-rule border-l-ink-muted bg-code">
      <p className="px-4 pt-3 text-sm font-bold">Typed input</p>
      <p className="px-4 pt-1 text-sm text-ink-muted">
        A person typed these lines while the program ran. A terminal shows them on screen, but the program does not print them, so they are not in the Expected output below.
      </p>
      <pre
        tabIndex={0}
        role="region"
        aria-label={`Typed input for ${of}`}
        data-typed-input
        className="overflow-x-auto px-4 pt-1 pb-4 font-mono text-mono"
      >
        <code>{text}</code>
      </pre>
    </div>
  );
}
