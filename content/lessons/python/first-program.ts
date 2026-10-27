import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: first-program.md. Shared idea: content/concepts/first-program.md,
// written so that a later lesson in another language could share it.
export const pythonFirstProgram: LessonSource = {
  course: "python",
  slug: "first-program",
  title: "Your first Python program",
  status: "published",
  concept: "first-program",
  objective: "Write and run a short Python program that shows text with `print`, and explain what Python does with it.",
  analogy: {
    title: "A literal helper",
    text: "Imagine handing a helper a list of steps. The helper does them one at a time, from the top, exactly as written. The helper never skips ahead and never guesses.",
    limit:
      "a helper would notice a silly step and ask you about it. Python does not ask. If an instruction is wrong, Python stops and prints an error message, or it does exactly what you wrote even when you meant something else.",
  },
  examples: {
    hello: {
      file: "python/first_hello",
      caption: "A complete program",
      notes: [
        {
          startLine: 1,
          endLine: 1,
          text: "`print` shows what is inside the parentheses, the round brackets. Python calls a piece of text in quotes a **string**. The quotes mark the text; they are not shown.",
        },
        { startLine: 2, endLine: 2, text: "Python runs this line after line 1. Its text appears on the next line of the output." },
      ],
    },
    order: {
      file: "python/first_order",
      caption: "Blank lines and comments",
      notes: [
        { startLine: 1, endLine: 1, text: "A comment. Python ignores this line, so nothing from it appears in the output." },
        { startLine: 3, endLine: 3, text: "`print()` with nothing in the parentheses shows an empty line." },
        {
          startLine: 4,
          endLine: 4,
          text: "The first `#` is inside the quotes, so it is text and is shown. The second `#` is outside the quotes, so it starts a comment, and Python ignores the rest of the line.",
        },
      ],
    },
  },
  mistakes: [
    {
      title: "Forgetting the closing quote",
      example: {
        file: "python/first_missing_quote",
        notes: [{ startLine: 2, endLine: 2, text: "The text starts with a quote but never ends with one." }],
      },
      whatHappens:
        "Python stops with a `SyntaxError` before running anything, so Starting is not shown either. A **syntax error** means the code breaks the rules for how Python must be written. Python finds this kind of mistake while reading the file, before the program starts.",
      howToRead:
        "the first line gives the file and the line number. The `^` marks where the text began. The last line says what is wrong: an \"unterminated string literal\" is a piece of text that is never closed.",
      fix: "end the text with a quote: `print(\"Hello, world!\")`.",
    },
    {
      title: "Spelling print with a capital letter",
      example: {
        file: "python/first_wrong_case",
        notes: [{ startLine: 2, endLine: 2, text: "`Print` with a capital P is a different name from `print`. Python has no name `Print`." }],
      },
      whatHappens:
        "Python stops with a `NameError` when it reaches line 2. A **name** is a word in code that stands for something, here the instruction `print`. Names are case-sensitive, so `print` and `Print` are different names. Line 1 ran first, but it shows nothing.",
      howToRead:
        "start with the last line. It names the kind of error and the name Python could not find, and it suggests `print`. The lines above it show where the program was when it stopped: line 2.",
      fix: "use exactly `print`, all lowercase.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show? Work it out before you open the solution.",
      example: { file: "python/practice_first_lines", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "One\nTwo\nThree", why: "`print()` with nothing inside still runs: it shows an empty line, so there is a blank line between Two and Three." },
        { text: "One Two Three", why: "Each `print` ends its line, so each one shows its text on a new line, not next to the previous text." },
        { text: "One\nTwo\nprint()\nThree", why: "`print()` is an instruction, not text. Only text inside quotes is shown as written." },
      ],
      hints: ["Does `print()` with nothing inside show anything?", "What does each `print` do after showing its text?"],
      explanation:
        "Lines 1 and 2 show One and Two, each on its own line. Line 3, `print()`, shows an empty line. Line 4 shows Three. The output has a blank line between Two and Three.",
    },
    {
      kind: "predict-output",
      question: "What does this program show? Look at every `#`.",
      example: { file: "python/practice_first_comments", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "Hidden\nShown\n# Not a comment", why: "Line 1 is a comment because it starts with `#`, so Python ignores it, `print` and all." },
        { text: "Shown", why: "The `#` in line 3 is inside quotes, so it is part of the text, not a comment. It is shown as written." },
        { text: "Shown\nAlso hidden\n# Not a comment", why: "On line 2 the second `print` comes after a `#` outside quotes, so it is part of a comment and does not run." },
      ],
      hints: ["Which `#` characters are inside quotes, and which are outside?", "What does Python do with everything after a `#` that is outside quotes?"],
      explanation:
        "Line 1 is a comment. On line 2 the first `print` runs and shows Shown; the rest of the line after the `#` is a comment. On line 3 the `#` is inside quotes, so the text is shown as written.",
    },
    {
      kind: "choice",
      question: "Which line shows the text Hello?",
      options: [
        { text: "`print(\"Hello\")`", why: "The text is inside quotes, inside the parentheses of `print`, and `print` is all lowercase.", correct: true },
        { text: "`print(Hello)`", why: "Without quotes, Python looks for a name called `Hello`. There is none, so it stops with a `NameError`." },
        { text: "`print \"Hello\"`", why: "`print` needs its parentheses. Without them, Python stops with a `SyntaxError`." },
        { text: "`Print(\"Hello\")`", why: "Names are case-sensitive. `Print` is not `print`, so Python stops with a `NameError`, as in the second common mistake." },
      ],
      hints: ["What marks a piece of text?", "What must follow `print`?"],
      explanation: "`print(\"Hello\")` is correct: quotes mark the text, and the parentheses hold what `print` shows.",
    },
  ],
  recap: [
    "A program is a list of instructions. Python reads the file and carries the instructions out one line at a time, from the top.",
    "`print(\"text\")` shows text. Each `print` ends its line, and `print()` shows an empty line.",
    "A string is text in quotes. The quotes are not shown.",
    "A `#` outside quotes starts a comment, which Python ignores. A `#` inside quotes is part of the text.",
    "Python stops with an error message when something is wrong. A `SyntaxError` is found before any line runs, and a `NameError` is found when the line is reached.",
  ],
};
