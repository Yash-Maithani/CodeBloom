// The annotated example shown on the homepage. The code and its output are not
// typed here: they are read from content/examples/python/vote.py and
// vote.expected.txt, which `npm run check:examples` runs and compares. So the
// page always shows code that was really run, with its real output.
//
// Each note explains one line or a short range of lines (1-based, inclusive).
// Text between backticks is shown as inline code.

import type { CodeNote } from "@/lib/code-notes";
import type { CodeLanguage } from "@/lib/examples";

export const homeExample = {
  language: "python" as CodeLanguage,
  file: "vote",
  caption: "An example of how lessons explain code",
  notes: [
    {
      startLine: 1,
      endLine: 1,
      text: "`age` is a variable: a name that holds a value. Here it holds the number 17.",
    },
    {
      startLine: 2,
      endLine: 2,
      text: '`if` asks a yes-or-no question. `age >= 18` means "is age 18 or more?" For 17, the answer is no.',
    },
    {
      startLine: 4,
      endLine: 5,
      text: "When the answer is no, Python skips the indented line under `if` and runs the line under `else` instead.",
    },
  ] satisfies CodeNote[],
};
