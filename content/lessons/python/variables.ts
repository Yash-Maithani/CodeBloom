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
          text: "`print` shows a value as output. Python looks up the value of `apples` and shows it, not the word apples.",
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
      question: "What does this program print? Work it out before you open the solution.",
      example: { file: "python/practice_score", notes: [] },
      explanation:
        "Line 2 works out the right side first, using the current value of `score`: 10 + 5. Then `score` is reassigned to the result.",
    },
    {
      question: "What type does Python report here?",
      example: { file: "python/practice_quotes", notes: [] },
      explanation:
        "The quotes make it text. `\"17\"` looks like a number, but to Python it is a `str` made of the characters 1 and 7. Without the quotes, it would be an `int`.",
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
