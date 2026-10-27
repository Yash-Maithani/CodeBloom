import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: variables.md. Shared idea: content/concepts/variables.md.
export const pythonVariables: LessonSource = {
  course: "python",
  slug: "variables",
  title: "Variables and data types",
  status: "published",
  concept: "variables",
  objective: "Create a variable in Python, change its value, and check the type of its value.",
  analogy: {
    title: "A labeled box",
    text: "Think of a variable as a box with a label on it. The label is the name, and the value is what is inside. You can look inside to use the value, or replace it with a new one.",
    limit:
      "in Python, the value is not really inside the name. The name refers to the value, more like a tag tied to it. That is why, in Python, values have types but names do not, and why a name can be reassigned to a value of a different type. For the programs in this lesson, both pictures give the same results.",
  },
  examples: {
    change: {
      file: "python/variables_change",
      caption: "Creating a variable and changing its value",
      notes: [
        { startLine: 1, endLine: 1, text: "Creates a variable named `apples` with the value 3." },
        {
          startLine: 2,
          endLine: 2,
          text: "`print` shows a value. The text a program shows when it runs is called its **output**. Python looks up the value of `apples` and shows it, not the word apples.",
        },
        {
          startLine: 3,
          endLine: 3,
          text: "Python works out the right side first, using the current value: 3 + 2 is 5. Then it reassigns `apples`: the name now refers to the new value, 5.",
        },
      ],
    },
    types: {
      file: "python/variables_types",
      caption: "Asking Python for the type of a value",
      notes: [
        { startLine: 1, endLine: 1, text: "17 is a whole number, so its type is `int`, short for integer." },
        {
          startLine: 2,
          endLine: 2,
          text: "2.5 has a decimal point, so its type is `float`, Python's type for numbers with a decimal point.",
        },
        {
          startLine: 3,
          endLine: 3,
          text: "`type(age)` gives the type of the value that `age` refers to, and `print` shows it. Python writes types as `<class 'int'>`. For now, read \"class\" as another word for type.",
        },
        {
          startLine: 5,
          endLine: 5,
          text: "The quotes make `\"seventeen\"` text. Python calls text `str`, short for string. This line reassigns `age` to a `str` value, so line 6 shows a different type.",
        },
      ],
    },
  },
  mistakes: [
    {
      title: "Changing the spelling of a name",
      example: {
        file: "python/name_error",
        notes: [
          { startLine: 2, endLine: 2, text: "Uses `age` correctly, so Python runs this line without a problem." },
          {
            startLine: 3,
            endLine: 3,
            text: "`Age` with a capital A is a different name from `age`. No variable called `Age` was ever created.",
          },
        ],
      },
      whatHappens:
        "Python runs lines 1 and 2, then stops at line 3 with a `NameError`. Names in Python are case-sensitive, so `age` and `Age` are different names. Python only discovers the problem when it reaches the line, while the program is already running.",
      howToRead:
        "start with the last line. It names the kind of error and the name Python could not find, and here Python even suggests `age`. The lines above it, starting from `Traceback`, show where the program was when it stopped: line 3.",
      fix: "use exactly the same spelling every time, including capital letters: `print(age)`.",
    },
    {
      title: "Joining text and a number with +",
      example: {
        file: "python/type_error",
        notes: [
          {
            startLine: 2,
            endLine: 2,
            text: "With two pieces of text, `+` joins them. Here the right side is a number, not text.",
          },
        ],
      },
      whatHappens:
        "Python will not join text and a number, and it does not guess what you meant. It stops with a `TypeError`. \"Concatenate\" means join pieces of text end to end: the message says `+` can only join a `str` to another `str`, and it got an `int`. This is Python checking types while the program runs.",
      fix: "give `print` the two values separated by a comma instead. It shows them one after the other, with a space between.",
      fixExample: {
        file: "python/type_error_fixed",
        caption: "The fix",
        notes: [
          {
            startLine: 2,
            endLine: 2,
            text: "A comma instead of `+`. `print` shows each value in turn, with a space between them.",
          },
        ],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print? Work it out before you check.",
      example: { file: "python/practice_score", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "10", why: "Line 2 does change `score`. `=` is an instruction, not a statement that must be true: Python works out `score + 5` and gives that new value to `score` before line 3 runs." },
        { text: "score", why: "`print(score)` shows the value that `score` refers to, not the name. Only text in quotes is shown as written." },
        { text: "10\n15", why: "Lines 1 and 2 only give `score` a value; they show nothing. Only `print` produces output, and this program calls it once, on line 3." },
      ],
      hints: ["Work through the lines in order and keep track of the value of `score` after each one.", "On line 2, Python works out the right side first, using the value `score` has at that moment.", "How many times does the program call `print`?"],
      explanation: "Line 2 works out the right side first, using the current value of `score`: 10 + 5. Then `score` is reassigned to the result.",
    },
    {
      kind: "predict-output",
      question: "What type does Python report here?",
      example: { file: "python/practice_quotes", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "<class 'int'>", why: "The quotes around 17 make it text. Without them it would be an `int`." },
        { text: "17", why: "`type()` gives the type of a value, not the value itself." },
      ],
      hints: ["Look closely at line 1. What do the quote marks around 17 mean?", "`type()` reports what kind of value it is given."],
      explanation: "The quotes make it text. `\"17\"` looks like a number, but to Python it is a `str` made of the characters 1 and 7. Without the quotes, it would be an `int`.",
    },
    {
      kind: "choice",
      question: "In Python, what happens when `age = 17` is followed later by `age = \"seventeen\"`?",
      options: [
        { text: "`age` now refers to a `str` value, and Python allows it.", why: "In Python, values have types and names do not, so a name can be reassigned to a value of a different type. The types example in this lesson shows it on lines 5 and 6.", correct: true },
        { text: "Python stops with a `TypeError`, because `age` was an `int`.", why: "The type belongs to the value, not to the name. Reassigning `age` to text is allowed; a `TypeError` happens when an operation gets the wrong type, as in joining text and a number with `+`." },
        { text: "The value 17 is turned into the text \"seventeen\".", why: "The second line does not change the value 17. It makes the name `age` refer to a different value." },
        { text: "`age` now holds both values.", why: "A variable refers to one value at a time. After the second line, `age` refers only to \"seventeen\"." },
      ],
      hints: ["In Python, does a type belong to the name or to the value?", "Look back at the types example: what does line 6 show after line 5 runs?"],
      explanation: "Giving an existing name a new value is reassigning it. Python checks types when an operation uses a value, not when a name gets a new one.",
    },
  ],
  recap: [
    "A variable is a name for a value. Create one with a name, `=` and a value: `apples = 3`.",
    "`=` is an instruction: Python works out the right side, then gives the result to the name on the left.",
    "Every value has a type, such as `int`, `float` or `str`, and `type()` tells you which.",
    "In Python, values have types and names do not, so a name can be reassigned to a value of a different type. Python checks types while the program runs.",
    "Names are case-sensitive: `age` and `Age` are different names.",
  ],
};
