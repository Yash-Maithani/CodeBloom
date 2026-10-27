// Margin notes for a code example (DESIGN.md section 7, "Margin notes").

import { parseInline } from "./prose.ts";

export type CodeNote = {
  /** First line the note explains, counting from 1 */
  startLine: number;
  /** Last line the note explains (same as startLine for a single line) */
  endLine: number;
  /** Text between backticks is shown as inline code; **bold** is allowed. No links. */
  text: string;
};

/**
 * Stops the build with a clear message if a note points at a line that does
 * not exist, if notes are out of order or overlap, or if a note's text uses
 * syntax that notes do not support. Catching this at build time means a
 * learner never sees a note attached to the wrong line.
 */
export function checkNotes(notes: CodeNote[], lineCount: number, exampleName: string): void {
  let previousEnd = 0;
  for (const [index, note] of notes.entries()) {
    const label = `${exampleName}, note ${index + 1}`;
    if (!Number.isInteger(note.startLine) || !Number.isInteger(note.endLine)) {
      throw new Error(`${label}: line numbers must be whole numbers`);
    }
    if (note.startLine < 1 || note.endLine > lineCount || note.startLine > note.endLine) {
      throw new Error(`${label}: lines ${note.startLine} to ${note.endLine} are outside the ${lineCount}-line example`);
    }
    if (note.startLine <= previousEnd) {
      throw new Error(`${label}: notes must be in line order and must not overlap`);
    }
    previousEnd = note.endLine;
    parseInline(note.text, label);
  }
}
