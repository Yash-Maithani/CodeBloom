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
// This is a client component only for three small interactions: Copy code, the
// Hide notes button, and highlighting a line while a pointer hovers its note.
// Highlighting is an extra (decision D19); nothing depends on it.

import { Fragment, useEffect, useId, useState } from "react";
import { CircleAlert } from "lucide-react";
import { OutputPanel } from "@/components/output-panel";
import { InlineText } from "@/components/prose";
import { buttonStyles } from "@/components/styles";
import type { CodeNote } from "@/lib/code-notes";
import type { CodeToken, TokenKind } from "@/lib/highlight";
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
};

const tokenStyles: Record<TokenKind, string> = {
  plain: "",
  keyword: "font-bold",
  literal: "text-syntax-literal",
  comment: "italic text-ink-muted",
};

function NoteMarker({ number }: { number: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-round bg-accent font-sans text-xs font-bold text-on-accent"
    >
      {number}
    </span>
  );
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
}: CodeBlockProps) {
  const [notesHidden, setNotesHidden] = useState(false);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const notesTitleId = useId();

  // "Copied" goes back to "Copy code" after two seconds (DESIGN.md section 7).
  useEffect(() => {
    if (copyState !== "copied") return;
    const timer = setTimeout(() => setCopyState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [copyState]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  const noteStartingAt = new Map(notes.map((note, index) => [note.startLine, index]));
  const isLineActive = (lineNumber: number) =>
    activeNote !== null &&
    lineNumber >= notes[activeNote].startLine &&
    lineNumber <= notes[activeNote].endLine;

  return (
    <figure className="max-w-lesson" data-example={exampleId}>
      {caption && <figcaption className="mb-3 text-sm text-ink-muted">{caption}</figcaption>}

      <div className="rounded-panel border border-rule bg-code">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule px-4 py-2">
          <span className="text-sm font-bold">{languageLabel}</span>
          <span className="text-sm text-ink-muted">{mistake ? "Example with a mistake" : "Runnable example"}</span>
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
              {copyState === "copied" ? "Copied" : "Copy code"}
            </button>
          </div>
        </div>

        {/* Announces the copy result. Visible only when copying failed. */}
        <p
          role="status"
          className={copyState === "failed" ? "flex items-center gap-2 border-b border-rule px-4 py-2 text-sm" : "sr-only"}
        >
          {copyState === "failed" && <CircleAlert aria-hidden="true" size={20} strokeWidth={1.75} className="shrink-0 text-error" />}
          {copyState === "copied" && "Code copied"}
          {copyState === "failed" && "Copy failed. Select the code and copy it manually."}
        </p>

        <div className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <pre
            tabIndex={0}
            role="region"
            aria-label={regionLabel}
            className="overflow-x-auto py-4 font-mono text-mono"
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
                      className={`flex border-l-3 pr-4 transition-colors ${
                        isLineActive(lineNumber) ? "border-accent bg-accent-tint" : "border-transparent"
                      }`}
                    >
                      <span aria-hidden="true" className="w-8 shrink-0 select-none text-right text-ink-muted">
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
                      <span className="whitespace-pre">
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
                        className="mx-4 my-2 flex select-none gap-3 border-l-3 border-accent bg-sheet px-4 py-2 font-sans text-sm whitespace-normal lg:hidden"
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
                className="lg:grid"
                // One grid row per code line. 1.5rem is the code line height
                // (text-mono: 0.9375rem size times 1.6 line height).
                style={{ gridTemplateRows: `repeat(${lines.length}, minmax(1.5rem, auto))` }}
              >
                {notes.map((note, index) => {
                  const nextStart = notes[index + 1]?.startLine ?? lines.length + 1;
                  return (
                    <li
                      key={note.startLine}
                      data-note={index + 1}
                      style={{ gridRow: `${note.startLine} / ${nextStart}` }}
                      onMouseEnter={() => setActiveNote(index)}
                      onMouseLeave={() => setActiveNote(null)}
                      className={`flex items-start gap-3 self-start rounded-control px-2 text-sm transition-colors ${
                        activeNote === index ? "bg-accent-tint" : ""
                      }`}
                    >
                      <NoteMarker number={index + 1} />
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
      </div>

      {showOutput && (
        <div className="mt-4">
          <OutputPanel kind={kind} text={expectedOutput} />
        </div>
      )}
    </figure>
  );
}
