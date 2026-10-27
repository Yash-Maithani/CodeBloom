import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: variables.md. Shared idea: content/concepts/variables.md.
export const cVariables: LessonSource = {
  course: "c",
  slug: "variables",
  title: "Variables and data types",
  status: "published",
  concept: "variables",
  objective: "Declare a variable in C with a type and a starting value, change its value, and print it with `printf`.",
  analogy: {
    title: "A labeled box",
    text: "Think of a variable as a box with a label on it. The label is the name, and the value is what is inside. In C, the box also has a fixed shape: a box made for whole numbers only takes whole numbers.",
    limit:
      "a real box can be empty, but a C variable has no empty state. A variable declared inside a function, such as `main`, without a value has no predictable value, and reading it is undefined behavior. Undefined behavior means the rules of C do not say what happens, so the program is allowed to do anything: print a strange number, give a different result each time it runs, or crash. So always give a variable a value before you use it.",
  },
  examples: {
    change: {
      file: "c/variables_change",
      caption: "Declaring a variable and changing its value",
      notes: [
        {
          startLine: 4,
          endLine: 4,
          text: "A declaration. `int` is the type, a whole number. `apples` is the name, and `= 3` gives it its starting value. The semicolon ends the instruction.",
        },
        {
          startLine: 5,
          endLine: 5,
          text: "`%d` is a placeholder: `printf` replaces it with the value of `apples`, written as a whole number. `\\n` starts a new line.",
        },
        {
          startLine: 6,
          endLine: 6,
          text: "C works out the right side first, using the current value: 3 + 2 is 5. Then it stores 5 in `apples`. There is no `int` this time, because `apples` already exists.",
        },
      ],
    },
    types: {
      file: "c/variables_types",
      caption: "Two variables with different types",
      notes: [
        { startLine: 5, endLine: 5, text: "`double` is C's usual type for numbers with a decimal point." },
        {
          startLine: 6,
          endLine: 6,
          text: "Text around a placeholder is printed as written, so the number appears before the word apples.",
        },
        {
          startLine: 7,
          endLine: 7,
          text: "`%f` is the placeholder for a `double`. `.2` asks for exactly two digits after the decimal point.",
        },
      ],
    },
  },
  mistakes: [
    {
      title: "Changing the spelling of a name",
      example: {
        file: "c/undeclared",
        notes: [
          {
            startLine: 6,
            endLine: 6,
            text: "`Age` with a capital A is a different name from `age`, and no variable called `Age` was declared.",
          },
        ],
      },
      whatHappens:
        "the compiler stops with an error, so no program is made and nothing runs, not even lines 4 and 5. C names are case-sensitive, and the compiler checks every name before the program can run. \"Undeclared\" means it found no declaration with this name.",
      howToRead:
        "`undeclared.c:6:20` means file `undeclared.c`, line 6, column 20. The compiler then shows the line, marks the problem with `^~~`, and suggests `age`. The `note` line is extra information, not a second error.",
      fix: "use exactly the same spelling as in the declaration: `printf(\"%d\\n\", age);`.",
    },
    {
      title: "Storing a decimal number in an `int`",
      example: {
        file: "c/int_decimal",
        notes: [{ startLine: 4, endLine: 4, text: "`price` is declared as an `int`, but 2.75 has a decimal part." }],
      },
      whatHappens:
        "the program compiles and runs without any message, and the output shows only the whole-number part. An `int` can only store whole numbers, so C drops the part after the decimal point when it stores the value. It does not round: 2.75 becomes 2, not 3.",
      whyEasyToMiss: "gcc says nothing about this line unless you ask for extra warnings with the option `-Wconversion`.",
      fix: "if a value can have a decimal part, declare the variable as `double`: `double price = 2.75;`, and print it with `%f`.",
    },
  ],
  practice: [
    {
      question: "What does this program print?",
      example: { file: "c/practice_score", notes: [] },
      explanation:
        "Line 5 works out the right side using the current value of `score`, 10 + 5, then stores the result in `score`.",
    },
    {
      question: "What does this program print?",
      example: { file: "c/practice_truncate", notes: [] },
      explanation: "`count` is an `int`, so it keeps only the whole-number part. C does not round.",
    },
  ],
  recap: [
    "A declaration creates a variable: the type, the name and a starting value, as in `int apples = 3;`. Always give a variable a value before you use it.",
    "`=` is an instruction: C works out the right side, then stores the result in the variable on the left.",
    "The type is fixed when you declare the variable. `int` stores whole numbers; `double` stores numbers with a decimal point.",
    "`printf` shows values through placeholders: `%d` for an `int`, `%f` for a `double`.",
    "The compiler checks names and types before the program runs. Names are case-sensitive, and storing a decimal number in an `int` silently drops the decimal part.",
  ],
};
