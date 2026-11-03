"use client";

// The annotated code block (DESIGN.md section 7, "Code block" and "Margin notes").
//
// How the notes are laid out:
//   - 1024px and wider: notes sit in a column beside the code. The column is a
//     grid with one row per code line, and each note spans the rows from its
//     line to the next note, so a long note only pushes later notes down.
//   - Narrower: a copy of each note appears under the line it explains. These
//     copies are hidden from screen readers and cannot be selected.
//   - Screen readers, at every width: the code first, then one ordered list
//     "Notes on this code", where every note starts with its line number.
//
// This is a client component for small interactions: Copy code, the Hide notes
// button, and linking a note to its line. From 1024px the notes list is one tab
// stop: arrow keys move between notes, and hovering or focusing a note
// highlights its line and draws an ink connector to it (decision D19 as changed
// by the owner on 2026-11-03). Nothing depends on the highlight: every note
// also starts with its line number for screen readers.

import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { InkConnector } from "@/components/ink-connector";
import { CircleAlert } from "lucide-react";
import { InputPanel } from "@/components/input-panel";
import { OutputPanel } from "@/components/output-panel";
import { InlineText } from "@/components/prose";
import { buttonStyles } from "@/components/styles";
import { tokenStyles } from "@/components/token-styles";
import type { CodeNote } from "@/lib/code-notes";
import type { CodeToken } from "@/lib/highlight";
import type { ExpectationKind } from "@/lib/verified";

type CodeBlockProps = {
  /** Shown above the code. Optional: mistakes and practice questions have their own headings. */
  caption?: string;
  /** Names the code for screen readers. Must be unique on the page, for example "Python code: The fix". */
  regionLabel: string;
  languageLabel: string;
  /** The source exactly as it was run; this is what Copy code puts on the clipboard */
  code: string;
  /** The same source split into lines of tokens */
  lines: CodeToken[][];
  notes: CodeNote[];
  /** The recorded output or error message */
  expectedOutput: string;
  /** What kind of result expectedOutput is. Default: output */
  kind?: ExpectationKind;
  /** Labels the block "Example with a mistake" instead of "Runnable example" */
  mistake?: boolean;
  /** False for practice questions: the output is shown in the solution instead */
  showOutput?: boolean;
  /** "<language>/<file>", so tests can compare the page with the example's files */
  exampleId?: string;
  /** The lines typed while a C program ran. Shown above the output, because the output does not contain them. */
  typedInput?: string;
};


function NoteMarker({ number }: { number: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-round bg-primary font-sans text-small font-bold text-on-primary"
    >
      {number}
    </span>
  );
}

const WIDE = "(min-width: 64rem)";
function subscribeWide(onChange: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function lineLabel(note: CodeNote) {
  return note.startLine === note.endLine
    ? `Line ${note.startLine}: `
    : `Lines ${note.startLine} to ${note.endLine}: `;
}

export function CodeBlock({
  caption,
  regionLabel,
  languageLabel,
  code,
  lines,
  notes,
  expectedOutput,
  kind = "output",
  mistake = false,
  showOutput = true,
  exampleId,
  typedInput,
}: CodeBlockProps) {
  const [notesHidden, setNotesHidden] = useState(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  // Every click stores a NEW object, even when the result is the same as last
  // time (copied again, failed again). React only reacts to a changed value, so
  // a bare "copied" string set twice does nothing: the timer below would not
  // restart and screen readers would not be told again. `attempt` also keys the
  // status message, so each click adds a fresh message for them to announce.
  const [copy, setCopy] = useState<{ result: "idle" | "copied" | "failed"; attempt: number }>({
    result: "idle",
    attempt: 0,
  });
  const notesTitleId = useId();
  const box = useRef<HTMLDivElement>(null);
  // The notes column is only visible from 1024px; below that the list is for
  // screen readers only, so its notes must not become invisible tab stops.
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
  const [roving, setRoving] = useState(0);

  // "Copied" goes back to "Copy code" two seconds after the LAST click
  // (DESIGN.md section 7). A new click changes `copy`, which clears the old
  // timer before it can fire and starts a new one.
  useEffect(() => {
    if (copy.result !== "copied") return;
    const timer = setTimeout(() => setCopy((current) => ({ ...current, result: "idle" })), 2000);
    return () => clearTimeout(timer);
  }, [copy]);

  async function copyCode() {
    let result: "copied" | "failed" = "copied";
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      result = "failed";
    }
    setCopy((current) => ({ result, attempt: current.attempt + 1 }));
  }

  const noteStartingAt = new Map(notes.map((note, index) => [note.startLine, index]));

  function onNotesKey(event: KeyboardEvent<HTMLOListElement>) {
    const moves: Record<string, number> = { ArrowDown: roving + 1, ArrowUp: roving - 1, Home: 0, End: notes.length - 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    const next = Math.min(Math.max(moves[event.key], 0), notes.length - 1);
    setRoving(next);
    box.current?.querySelector<HTMLElement>(`[data-note="${next + 1}"]`)?.focus();
  }

  // The two ends of the ink connector for the active note.
  const activeEnd = activeNote === null ? null : `[data-note="${activeNote + 1}"] [data-marker]`;
  const activeLine = activeNote === null ? null : `[data-line="${notes[activeNote].startLine}"] [data-code-text]`;
  const isLineActive = (lineNumber: number) =>
    activeNote !== null &&
    lineNumber >= notes[activeNote].startLine &&
    lineNumber <= notes[activeNote].endLine;

  return (
    <figure className="max-w-page" data-example={exampleId}>
      {caption && (
        <figcaption className="mb-3 text-ui text-ink-muted">
          <InlineText text={caption} />
        </figcaption>
      )}

      <div ref={box} className="relative rounded-panel border border-rule bg-sunken">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-t-panel border-b border-rule bg-surface px-4 py-2">
          <span className="text-ui font-bold">{languageLabel}</span>
          <span className="text-ui text-ink-muted">{mistake ? "Example with a mistake" : "Runnable example"}</span>
          <div className="ml-auto flex flex-wrap gap-2">
            {notes.length > 0 && (
              <button
                type="button"
                onClick={() => setNotesHidden(!notesHidden)}
                className={`${buttonStyles.secondary} lg:hidden`}
              >
                {notesHidden ? "Show notes" : "Hide notes"}
              </button>
            )}
            <button type="button" onClick={copyCode} className={buttonStyles.secondary}>
              {copy.result === "copied" ? "Copied" : "Copy code"}
            </button>
          </div>
        </div>

        {/* Announces the copy result. Visible only when copying failed. The
            region itself stays in the page; each click replaces the keyed
            message inside it, and screen readers announce what is added. */}
        <p
          role="status"
          className={copy.result === "failed" ? "flex items-center gap-2 border-b border-rule px-4 py-2 text-ui" : "sr-only"}
        >
          {copy.result === "failed" && <CircleAlert aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-error" />}
          {copy.result === "copied" && <span key={copy.attempt}>Code copied</span>}
          {copy.result === "failed" && <span key={copy.attempt}>Copy failed. Select the code and copy it manually.</span>}
        </p>

        <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <pre
            tabIndex={0}
            role="region"
            aria-label={regionLabel}
            className="overflow-x-auto py-4 font-mono text-code"
          >
            <code className="block">
              {lines.map((tokens, index) => {
                const lineNumber = index + 1;
                const noteIndex = noteStartingAt.get(lineNumber);
                const note = noteIndex === undefined ? undefined : notes[noteIndex];
                return (
                  <Fragment key={lineNumber}>
                    <span
                      data-line={lineNumber}
                      className={`flex border-l-4 pr-4 transition-colors duration-fast hover:bg-primary-tint ${
                        isLineActive(lineNumber) ? "border-primary bg-primary-tint" : "border-transparent"
                      }`}
                    >
                      <span aria-hidden="true" className="w-10 shrink-0 select-none border-r border-rule pr-3 text-right text-ink-muted">
                        {lineNumber}
                      </span>
                      <span
                        aria-hidden="true"
                        className="flex w-8 shrink-0 select-none justify-center"
                        onMouseEnter={() => noteIndex !== undefined && setActiveNote(noteIndex)}
                        onMouseLeave={() => setActiveNote(null)}
                      >
                        {noteIndex !== undefined && <NoteMarker number={noteIndex + 1} />}
                      </span>
                      <span data-code-text className="whitespace-pre">
                        {tokens.map((token, tokenIndex) => (
                          <span key={tokenIndex} className={tokenStyles[token.kind]}>
                            {token.text}
                          </span>
                        ))}
                      </span>
                    </span>

                    {note && noteIndex !== undefined && !notesHidden && (
                      <span
                        aria-hidden="true"
                        data-note-row={noteIndex + 1}
                        className="mx-4 my-2 flex select-none gap-3 border-l-4 border-primary bg-surface px-4 py-2 font-sans text-ui whitespace-normal lg:hidden"
                      >
                        <NoteMarker number={noteIndex + 1} />
                        <InlineText text={note.text} />
                      </span>
                    )}
                  </Fragment>
                );
              })}
            </code>
          </pre>

          {notes.length > 0 && (
            <div className="sr-only lg:not-sr-only lg:border-l lg:border-rule lg:px-4 lg:py-4">
              {/* Names the list below. aria-hidden stops screen readers reading
                  the title twice; aria-labelledby still uses its text. */}
              <p id={notesTitleId} aria-hidden="true" className="sr-only">
                Notes on this code
              </p>
              <ol
                aria-labelledby={notesTitleId}
                data-notes-list
                onKeyDown={wide ? onNotesKey : undefined}
                className="lg:grid"
                // One grid row per code line, as tall as a code line (the text-code
                // size times its line height, both tokens).
                style={{ gridTemplateRows: `repeat(${lines.length}, minmax(calc(var(--text-code) * var(--text-code--line-height)), auto))` }}
              >
                {notes.map((note, index) => {
                  const nextStart = notes[index + 1]?.startLine ?? lines.length + 1;
                  return (
                    <li
                      key={note.startLine}
                      data-note={index + 1}
                      tabIndex={wide ? (index === roving ? 0 : -1) : undefined}
                      style={{ gridRow: `${note.startLine} / ${nextStart}` }}
                      onMouseEnter={() => setActiveNote(index)}
                      onMouseLeave={() => setActiveNote(null)}
                      onFocus={() => {
                        setRoving(index);
                        setActiveNote(index);
                      }}
                      onBlur={() => setActiveNote(null)}
                      className={`flex items-start gap-3 self-start rounded-control px-2 text-ui transition-colors duration-fast ${
                        activeNote === index ? "bg-primary-tint" : ""
                      }`}
                    >
                      <span data-marker>
                        <NoteMarker number={index + 1} />
                      </span>
                      <span>
                        <span className="sr-only">{lineLabel(note)}</span>
                        <InlineText text={note.text} />
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
        {wide && <InkConnector container={box} from={activeEnd} to={activeLine} />}
      </div>

      {showOutput && typedInput !== undefined && (
        <div className="mt-4">
          <InputPanel text={typedInput} of={regionLabel} />
        </div>
      )}
      {showOutput && (
        <div className="mt-4">
          <OutputPanel kind={kind} text={expectedOutput} of={regionLabel} />
        </div>
      )}
    </figure>
  );
}
