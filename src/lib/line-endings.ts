// Windows files end lines with \r\n, old Mac files with \r, Linux and macOS
// with \n. Git can also convert between them on a developer's machine. The
// rest of the site works with \n only, so text read from a file goes through
// this function first.

/**
 * Turns \r\n and a lone \r into \n. Nothing else changes: spaces, tabs,
 * blank lines and whether the text ends with a newline are all kept.
 * (scripts/lib/example-runner.mjs has its own copy of this one-line rule,
 * because that script runs as plain Node and does not read TypeScript.)
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}
