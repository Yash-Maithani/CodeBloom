"use client";

// The Python playground (SPEC.md Milestone 5, DESIGN.md "Playground"). The
// learner edits code, optionally fills the Input box, and presses Run. Python
// (Pyodide) runs in a Web Worker on this device; nothing is saved or sent.
// Python is downloaded only when Run is first pressed. src/lib/python-runner.ts
// enforces the limits; this component shows each state in words.

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { buttonStyles } from "@/components/styles";
import { OUTPUT_LIMIT, TIME_LIMIT_MS, splitInput } from "@/lib/playground";
import { PythonRunner, type RunEnd, type WorkerLike } from "@/lib/python-runner";

const noSubscription = () => () => {};
const INDENT = "    ";

type Chunk = { stream: "out" | "err" | "input"; text: string };
type Phase =
  | { name: "idle" }
  | { name: "downloading"; loaded: number; total: number }
  | { name: "running" }
  | { name: "ended"; end: RunEnd };

const megabytes = (bytes: number) => (bytes / 1_000_000).toFixed(1);

/** What the status line says, in words. Exported for tests of the wording. */
export function describe(phase: Phase, printed: boolean): { text: string; tone: "plain" | "success" | "error" | "warning" } {
  if (phase.name === "idle") return { text: "Press Run to see what your program prints.", tone: "plain" };
  if (phase.name === "downloading") {
    return phase.loaded >= phase.total
      ? { text: "Starting Python…", tone: "plain" }
      : { text: `Downloading Python: ${megabytes(phase.loaded)} of ${megabytes(phase.total)} MB`, tone: "plain" };
  }
  if (phase.name === "running") return { text: "Running…", tone: "plain" };
  const end = phase.end;
  switch (end.kind) {
    case "finished":
      return { text: printed ? "Finished." : "Finished. Your program printed nothing.", tone: "success" };
    case "error": {
      const where = end.error.line ? ` on line ${end.error.line}` : "";
      if (end.error.kind === "syntax") return { text: `Python could not run your program: there is a mistake${where}. Nothing ran. The error message below shows where.`, tone: "error" };
      if (end.error.kind === "input") return { text: "Your program asked for more input than the Input box has. Add one line to the Input box for each input() call.", tone: "error" };
      if (end.error.kind === "package") return { text: "This playground has only Python's standard library, so packages such as numpy are not available.", tone: "error" };
      return { text: `Your program stopped with an error${where}. The error message below says what went wrong.`, tone: "error" };
    }
    case "timeout":
      return { text: `Stopped after ${TIME_LIMIT_MS / 1000} seconds. Your program may have a loop that never ends.`, tone: "warning" };
    case "cut":
      return { text: `Output cut off after ${OUTPUT_LIMIT.toLocaleString("en-US")} characters, and your program was stopped.`, tone: "warning" };
    case "stopped":
      return { text: "Stopped.", tone: "warning" };
    case "download-failed":
      return { text: "Python could not be downloaded. Check your connection, then press Run to try again.", tone: "warning" };
    case "crashed":
      return { text: "Python stopped unexpectedly, possibly because your program used too much memory.", tone: "error" };
  }
}

const icons = {
  success: <CircleCheck aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-success" />,
  error: <CircleX aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-error" />,
  warning: <TriangleAlert aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-warning" />,
  plain: null,
};

/** Replaces the selection with `text` and puts the cursor after it. */
function insert(field: HTMLTextAreaElement, text: string) {
  field.setRangeText(text, field.selectionStart, field.selectionEnd, "end");
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

export function Playground({ starter, downloadBytes }: { starter: string; downloadBytes: number }) {
  const [code, setCode] = useState(starter);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [downloaded, setDownloaded] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const runner = useRef<PythonRunner | null>(null);
  const runButton = useRef<HTMLButtonElement>(null);
  const stopButton = useRef<HTMLButtonElement>(null);
  const codeBox = useRef<HTMLTextAreaElement>(null);
  const leaveOnTab = useRef(false);
  const ready = useSyncExternalStore(noSubscription, () => true, () => false);
  const busy = phase.name === "downloading" || phase.name === "running";

  useEffect(() => () => runner.current?.dispose(), []);

  async function run() {
    if (busy) {
      setAnnouncement("Your program is already running. Press Stop to stop it.");
      return;
    }
    runner.current ??= new PythonRunner(() => new Worker("/python-worker.mjs", { type: "module" }) as unknown as WorkerLike);
    const printed: Chunk[] = [];
    setChunks([]);
    setPhase(runner.current.downloaded ? { name: "running" } : { name: "downloading", loaded: 0, total: downloadBytes });
    setAnnouncement(runner.current.downloaded ? "Running." : "Downloading Python.");
    const end = await runner.current.run(code, splitInput(input), (event) => {
      if (event.kind === "progress") setPhase({ name: "downloading", loaded: event.loaded, total: event.total });
      if (event.kind === "running") setPhase({ name: "running" });
      if (event.kind === "output") {
        printed.push({ stream: event.stream, text: event.text });
        setChunks([...printed]);
      }
    });
    // Stop disappears when the run ends; keep focus on the page's controls.
    if (document.activeElement === stopButton.current) runButton.current?.focus();
    setDownloaded(runner.current.downloaded);
    setPhase({ name: "ended", end });
    const lines = printed.map((chunk) => chunk.text).join("").split("\n").filter((line, index, all) => line !== "" || index < all.length - 1).length;
    const status = describe({ name: "ended", end }, printed.length > 0).text;
    setAnnouncement(`${status}${printed.length > 0 ? ` ${lines} ${lines === 1 ? "line" : "lines"} of output.` : ""}`);
  }

  function onCodeKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    const field = event.currentTarget;
    if (event.key === "Escape") {
      leaveOnTab.current = true;
      return;
    }
    if (event.key === "Tab" && leaveOnTab.current) {
      leaveOnTab.current = false;
      return;
    }
    leaveOnTab.current = false;
    const before = field.value.slice(0, field.selectionStart);
    const lineStart = before.lastIndexOf("\n") + 1;
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      insert(field, INDENT);
    } else if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();
      const spaces = field.value.slice(lineStart).match(/^ {1,4}/)?.[0].length ?? 0;
      if (spaces > 0) {
        const cursor = field.selectionStart;
        field.setSelectionRange(lineStart, lineStart + spaces);
        insert(field, "");
        field.setSelectionRange(Math.max(lineStart, cursor - spaces), Math.max(lineStart, cursor - spaces));
      }
    } else if (event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      // Keep the indentation of this line, and add one level after a colon.
      event.preventDefault();
      const line = before.slice(lineStart);
      const indent = line.match(/^ */)?.[0] ?? "";
      insert(field, `\n${indent}${/:\s*$/.test(line) ? INDENT : ""}`);
    }
  }

  const status = describe(phase, chunks.length > 0);
  const end = phase.name === "ended" ? phase.end : null;
  const error = end?.kind === "error" ? end.error : null;
  const lineCount = code.split("\n").length;

  return (
    <div data-playground data-state={phase.name === "ended" ? phase.end.kind : phase.name} className="grid gap-8 lg:grid-cols-2">
      <div className="min-w-0">
        <label htmlFor="playground-code" className="text-sm font-bold">
          Python code
        </label>
        <div className="mt-2 flex overflow-hidden rounded-panel border border-rule-strong bg-code focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink">
          <div aria-hidden="true" className="shrink-0 select-none py-3 pr-2 pl-3 text-right font-mono text-mono text-ink-muted">
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <textarea
            id="playground-code"
            data-code
            ref={codeBox}
            // Uncontrolled: React never writes to the box while the learner
            // types, so the indentation keys keep the cursor where it belongs.
            defaultValue={starter}
            onChange={(event) => setCode(event.target.value)}
            onKeyDown={onCodeKey}
            rows={Math.max(lineCount, 8)}
            wrap="off"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            aria-describedby="playground-code-hint"
            className="min-w-0 flex-1 resize-none overflow-x-auto bg-transparent py-3 pr-4 pl-2 font-mono text-mono text-ink outline-none"
          />
        </div>
        <p id="playground-code-hint" className="mt-2 text-sm text-ink-muted">
          Tab adds 4 spaces. To leave the code box, press Esc, then Tab.
        </p>

        <label htmlFor="playground-input" className="mt-6 block text-sm font-bold">
          Input
        </label>
        <p id="playground-input-hint" className="mt-1 text-sm text-ink-muted">
          If your program uses <code className="font-mono">input()</code>, type one line here for each call before you press Run.
        </p>
        <textarea
          id="playground-input"
          data-input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={3}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-describedby="playground-input-hint"
          className="mt-2 block w-full resize-y rounded-panel border border-rule-strong bg-code px-4 py-3 font-mono text-mono"
        />

        {/* The buttons only work once React runs in the browser, so until then
            they are invisible and out of the tab order; their space is kept. */}
        <div data-controls className={`mt-6 flex flex-wrap items-center gap-2 ${ready ? "" : "invisible"}`} inert={!ready}>
          <button ref={runButton} type="button" onClick={run} aria-disabled={busy} className={`${buttonStyles.primary} aria-disabled:bg-ink-muted`}>
            Run
          </button>
          {busy && (
            <button ref={stopButton} type="button" onClick={() => runner.current?.stop()} className={buttonStyles.secondary}>
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              runner.current?.stop();
              if (codeBox.current) codeBox.current.value = starter;
              setCode(starter);
              setInput("");
              setAnnouncement("The code is back to the example. The Input box is empty.");
            }}
            className={buttonStyles.secondary}
          >
            Reset code
          </button>
        </div>
        {!downloaded && (
          <p data-download-note className={`mt-2 text-sm text-ink-muted ${ready ? "" : "invisible"}`}>
            The first run downloads Python ({megabytes(downloadBytes)} MB). Your browser keeps a copy for next time.
          </p>
        )}
      </div>

      <section aria-labelledby="your-run" className="min-w-0">
        <h2 id="your-run" className="text-sm font-bold">
          Your run
        </h2>
        <div className="mt-2 rounded-panel border border-rule-strong bg-sheet">
          <p data-status className="flex items-start gap-2 border-b border-rule px-4 py-3 text-sm">
            {icons[status.tone]}
            <span>{status.text}</span>
          </p>
          {phase.name === "downloading" && (
            <div className="px-4 pt-3">
              <progress
                aria-label="Python download"
                value={phase.loaded}
                max={phase.total}
                className="block h-2 w-full accent-accent"
              />
            </div>
          )}
          <pre
            tabIndex={0}
            role="region"
            aria-label="Output of your run"
            data-run-output
            className="min-h-24 overflow-x-auto px-4 py-3 font-mono text-mono whitespace-pre"
          >
            <code>
              {chunks.map((chunk, index) => (
                <span key={index} data-stream={chunk.stream}>
                  {chunk.text}
                </span>
              ))}
            </code>
          </pre>
          {error && (
            <div className="border-t border-rule px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-bold">
                <CircleX aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-error" />
                Error message
              </p>
              <pre tabIndex={0} role="region" aria-label="Error message of your run" data-run-error className="mt-2 overflow-x-auto font-mono text-mono">
                <code>{error.text}</code>
              </pre>
            </div>
          )}
        </div>
      </section>

      <div role="status" className="sr-only" data-announcement>
        {announcement}
      </div>
    </div>
  );
}
