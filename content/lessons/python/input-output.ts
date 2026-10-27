import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: input-output.md. Shared idea: content/concepts/input-output.md.
// Examples that read input have a name.input.txt next to them; the output shown
// includes each typed line after its prompt, as a terminal and the playground show it.
export const pythonInputOutput: LessonSource = {
  course: "python",
  slug: "input-output",
  title: "Input and output",
  status: "published",
  concept: "input-output",
  objective: "Read what a person types with `input`, use it in a program, and convert it to a number with `int` when you need to calculate with it.",
  analogy: {
    title: "A question across a counter",
    text: "A program asks a question, and the person writes the answer on a slip of paper and hands it over. The program takes the slip and keeps it.",
    limit:
      "the slip always holds written characters, even when the answer looks like a number. The program receives characters, not a number, until it converts them.",
  },
  examples: {
    greet: {
      file: "python/io_greet",
      caption: "Asking for a name",
      notes: [
        {
          startLine: 1,
          endLine: 1,
          text: "`input(...)` shows the prompt, then waits for a line. The line comes back as text and is stored in `name`. The space at the end of the prompt keeps the typing from touching the question mark.",
        },
        {
          startLine: 2,
          endLine: 2,
          text: "Shows `Hello,` and then the value of `name`. With commas between the values, `print` puts a space between each one.",
        },
      ],
    },
    type: {
      file: "python/io_type",
      caption: "What type does input give back?",
      notes: [
        { startLine: 1, endLine: 1, text: "Whatever is typed, `input` returns text." },
        { startLine: 2, endLine: 2, text: "`type(value)` gives the type of the value. For typed digits it is `str`." },
      ],
    },
    age: {
      file: "python/io_age",
      caption: "Converting the text to a number",
      notes: [
        { startLine: 1, endLine: 1, text: "Stores the typed text, here the characters 1 and 7, in `age_text`." },
        { startLine: 2, endLine: 2, text: "`int(age_text)` converts the text into the whole number 17. `age` now refers to a number." },
        { startLine: 3, endLine: 3, text: "`age + 1` is arithmetic on numbers. `print` shows the text first, then the result." },
      ],
    },
    sum: {
      file: "python/io_sum",
      caption: "Asking and converting in one line",
      notes: [
        { startLine: 1, endLine: 1, text: "The inside runs first: `input` asks and returns text, then `int` turns that text into a number." },
        { startLine: 3, endLine: 3, text: "Both values are numbers, so `+` adds them." },
      ],
    },
  },
  mistakes: [
    {
      title: "Adding what input returns without int",
      example: {
        file: "python/io_text_plus",
        notes: [{ startLine: 3, endLine: 3, text: "`first` and `second` are text, so `+` joins them end to end instead of adding." }],
      },
      whatHappens:
        "the program runs without an error, but the answer is wrong. `+` between two strings joins them, so the text 12 and the text 30 become 1230. Python does not guess that you wanted arithmetic.",
      whyEasyToMiss: "nothing goes wrong. No error message appears, and 1230 looks like a number.",
      fix: "convert each typed line with `int`, as in the sum example above.",
    },
    {
      title: "Converting text that is not a whole number",
      example: {
        file: "python/io_bad_number",
        notes: [
          {
            startLine: 2,
            endLine: 2,
            text: "`int` converts text that represents a whole number, such as \"17\". `seventeen` is a word, so `int` cannot convert it. This program sets the text itself, so the error always happens; a person typing seventeen into `input` would cause the same error.",
          },
        ],
      },
      whatHappens:
        "Python stops with a `ValueError` at line 2, so line 3 never runs. A ValueError means the kind of value was right, text, but this particular text cannot be used: `int` cannot turn seventeen into a number.",
      howToRead:
        "the last line names the kind of error and shows the text it could not convert, in quotes. The lines above show that it happened on line 2.",
      fix: "make sure `int` receives text that represents a whole number, such as 17. Programs that must cope with careless typing need extra checks, and this lesson does not cover them yet.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "A person types Sam when this program asks for a name. What does the program show? Work it out before you open the solution.",
      example: { file: "python/practice_io_name", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "Hi, Sam\nBye, Sam", why: "The prompt and the line you type are part of the output too, so the first line is `Name: Sam`." },
        { text: "Name: Sam\nHi, name\nBye, name", why: "`name` in line 2 has no quotes, so it is the variable. Python shows its value, Sam, not the word name." },
        { text: "Name: Sam\nHi, Sam", why: "A variable keeps its value after it is used. Line 3 uses `name` again and shows Sam again." },
      ],
      hints: ["Is the prompt part of the output?", "Does a variable lose its value after `print` uses it?"],
      explanation: "The prompt `Name: ` is shown, followed by the typed line Sam. Both `print` lines then use the value of `name`, which stays Sam.",
    },
    {
      kind: "predict-output",
      question: "A person types 6. What does the program show?",
      example: { file: "python/practice_io_double", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "Number: 6\n12\n22", why: "`number * 2` is only a calculation: it shows 12 but does not change `number`. Line 3 starts again from 6, so `number + 10` is 16." },
        { text: "Number: 6\nnumber * 2\nnumber + 10", why: "`print(number * 2)` shows the result of the calculation, not the calculation as text." },
      ],
      hints: ["Does `print(number * 2)` change `number`?", "What is the first line of the output?"],
      explanation: "The first line is the prompt followed by the typed 6. Then 6 times 2 is 12, and `number` is still 6, so 6 plus 10 is 16.",
    },
    {
      kind: "choice",
      question: "Which line turns what the person types into a whole number?",
      options: [
        { text: "`age = int(input(\"Age: \"))`", why: "`input` runs first and returns the typed text, then `int` converts it into a whole number.", correct: true },
        { text: "`age = input(\"Age: \")`", why: "`input` always returns text, even when the person types digits. The type of `age` is `str`, as the example in this lesson shows." },
        { text: "`age = input(int(\"Age: \"))`", why: "Python works from the inside out, so `int(\"Age: \")` runs first. It tries to turn the prompt text into a number and stops with a `ValueError`." },
      ],
      hints: ["Which part runs first, the inside or the outside of the brackets?", "What type does `input` return?"],
      explanation: "`int(input(...))` asks first and converts second. The inside runs first, so `input` must be inside `int`, not the other way round.",
    },
  ],
  recap: [
    "Input is information a program receives while it runs. `input(\"prompt\")` shows the prompt, waits for a line, and gives the line back.",
    "`input` always returns text (`str`), even when the person types digits.",
    "`int(text)` converts text that represents a whole number, such as \"17\", into a number. Without it, `+` joins two typed lines instead of adding them.",
    "Python runs the inside of a call first: in `int(input(...))`, `input` runs, then `int`.",
    "`int` stops with a `ValueError` if the text does not represent a whole number, such as \"seventeen\".",
  ],
};
