import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: numbers.md. Shared idea: content/concepts/arithmetic.md,
// which the Python lesson uses too. Division by zero and int overflow are undefined
// behavior in C, so they are explained in the text and never shown as an example.
export const cNumbers: LessonSource = {
  course: "c",
  slug: "numbers",
  title: "Numbers and arithmetic",
  status: "published",
  concept: "arithmetic",
  objective: "Calculate with C's arithmetic operators, know what `/` and `%` do with whole numbers, convert with a cast, and update a variable with `+=` and `++`.",
  analogy: {
    title: "A calculator",
    text: "A calculator takes numbers and an operation and gives back a result. C works like a calculator where you type the whole calculation at once.",
    limit:
      "a calculator keeps the decimal part when it divides. C does not when both numbers are whole: it drops the decimal part. A calculator also rounds what it shows, so you rarely see the tiny errors that decimal numbers can have. C shows what you ask for with `printf`, as the 0.1 + 0.2 example shows.",
  },
  examples: {
    basics: {
      file: "c/num_basics",
      caption: "The operators",
      notes: [
        { startLine: 7, endLine: 7, text: "Both numbers are whole, so `/` divides and drops the decimal part. 7 / 2 gives 3, not 3.5." },
        { startLine: 8, endLine: 8, text: "`%` is the remainder: 2 goes into 7 three times with 1 left over." },
        { startLine: 9, endLine: 9, text: "`7.0` has a decimal point, so C divides as decimals and keeps the decimal part. `%.1f` shows one digit after the point." },
      ],
    },
    minutes: {
      file: "c/num_minutes",
      caption: "Hours and minutes",
      notes: [
        { startLine: 5, endLine: 5, text: "Whole-number division counts the whole hours." },
        { startLine: 6, endLine: 6, text: "`%` is what is left over after taking out the whole hours." },
        { startLine: 7, endLine: 7, text: "Two placeholders, filled in order by `hours` and then `minutes`." },
      ],
    },
    negative: {
      file: "c/num_negative",
      caption: "Whole-number division below zero",
      notes: [
        { startLine: 4, endLine: 4, text: "The exact result is -3.5. C drops the decimal part, which gives -3." },
        { startLine: 5, endLine: 5, text: "The remainder takes the sign of the first number: -3 times 2 is -6, and -1 more makes -7." },
        { startLine: 7, endLine: 7, text: "The first number is positive, so the remainder is positive: -3 times -2 is 6, and 1 more makes 7." },
      ],
    },
    order: {
      file: "c/num_order",
      caption: "Which part comes first",
      notes: [
        { startLine: 4, endLine: 4, text: "`3 * 4` is done first, then 2 is added." },
        { startLine: 5, endLine: 5, text: "The brackets make the addition happen first." },
        { startLine: 6, endLine: 6, text: "Same level, so left to right: `10 - 4` first, then 3 is taken away." },
      ],
    },
    mixed: {
      file: "c/num_mixed",
      caption: "Division with a decimal number",
      notes: [
        { startLine: 5, endLine: 5, text: "One side is a decimal number, so C converts `total` to a decimal number before it divides." },
        {
          startLine: 6,
          endLine: 6,
          text: "`(double)total` is a cast. It converts the value of `total` to a `double` for this calculation, and `total` itself stays an `int`. The cast applies to `total` before the division.",
        },
        { startLine: 7, endLine: 7, text: "The division in the brackets happens first, with whole numbers, and gives 3. Only then is 3 converted to 3.0." },
      ],
    },
    float: {
      file: "c/num_float",
      caption: "A tiny error and more digits",
      notes: [
        { startLine: 4, endLine: 4, text: "`%f` shows six digits after the point, which hides the tiny error." },
        { startLine: 5, endLine: 5, text: "`.17` asks for 17 digits, and the error shows." },
      ],
    },
    update: {
      file: "c/num_update",
      caption: "Shorter updates",
      notes: [
        { startLine: 5, endLine: 5, text: "The same as `score = score + 5`." },
        { startLine: 7, endLine: 7, text: "The same as `score = score - 3`." },
        { startLine: 9, endLine: 9, text: "The same as `score = score * 2`." },
        { startLine: 11, endLine: 11, text: "`++` adds 1, the same as `score += 1`." },
      ],
    },
  },
  mistakes: [
    {
      title: "Dividing two whole numbers and expecting a decimal",
      example: {
        file: "c/num_int_division",
        notes: [
          {
            startLine: 6,
            endLine: 6,
            text: "`total` and `count` are both `int`, so this is a whole-number division and gives 3. Only then is 3 stored in `average`, which makes it 3.0.",
          },
        ],
      },
      whatHappens:
        "the program compiles and runs without any message, but it shows 3.00, not 3.50. The type of `average` does not change how the division on the right is done.",
      whyEasyToMiss: "gcc says nothing, and 3.00 looks like a plausible decimal answer.",
      fix: "convert one of the numbers to a `double` before dividing: `(double)total / count`.",
      fixExample: {
        file: "c/num_int_division_fix",
        caption: "The fix",
        notes: [{ startLine: 6, endLine: 6, text: "The cast turns `total` into a decimal number first, so the division keeps its decimal part." }],
      },
    },
    {
      title: "Using % with a decimal number",
      example: {
        file: "c/num_mod_double",
        notes: [{ startLine: 5, endLine: 5, text: "`distance` is a `double`, and `%` works only on whole numbers." }],
      },
      whatHappens: "the compiler stops with an error, so no program is made. In C, `%` is for whole numbers only.",
      howToRead:
        "\"binary\" means the operator takes two values. The message says it got a `double` and an `int` (\"have\"), and the caret points at the `%`.",
      fix: "keep the values you use with `%` in `int` variables.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_num_division", notes: [] },
      correctPosition: 4,
      wrongOutputs: [
        { text: "3\n2\n3", why: "`17 / 5.0` has a decimal number on one side, so C divides as decimals and keeps the .4. `%.1f` then shows 3.4." },
        {
          text: "2\n3\n3.4",
          why: "`/` gives how many times 5 fits into 17, which is 3. `%` gives what is left over, which is 2. They are not the other way round.",
        },
        { text: "3.4\n2\n3.4", why: "`17 / 5` has whole numbers on both sides, so C drops the decimal part and gives 3." },
      ],
      hints: ["Which of the three divisions has a decimal number in it?", "How many times does 5 fit into 17, and what is left?"],
      explanation: "5 fits into 17 three times with 2 left over, and the decimal division keeps the .4.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_num_average", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "0.25", why: "`a` and `b` are both `int`, so `a / b` is a whole-number division and gives 0. The type of `ratio` does not change that." },
        { text: "0", why: "`%.2f` always shows two digits after the decimal point, so the number is shown as 0.00." },
      ],
      hints: ["What kind of division is `a / b`, with two `int` values?", "What is stored in `ratio`, and how does `%.2f` show it?"],
      explanation: "The division happens with whole numbers and gives 0 before it is stored. Storing 0 in a `double` gives 0.0, and `%.2f` shows 0.00.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_num_update", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "26", why: "`total++` is the last step and adds 1 to 26." },
        { text: "17", why: "`total += 5` changes `total` to 15, so doubling gives 30, not 20." },
      ],
      hints: ["Write down `total` after every line.", "Do the shorthand lines change the variable, or only work out a value?"],
      explanation: "`total` goes 10, 15, 30, 26, 27.",
    },
  ],
  recap: [
    "`+`, `-`, `*`, `/` and `%` are C's arithmetic operators. `%` gives the remainder, for whole numbers only.",
    "`/` between two whole numbers drops the decimal part. Put a decimal number or a cast `(double)` in the calculation to keep it.",
    "With negative whole numbers, C rounds towards zero, and the remainder takes the sign of the first number.",
    "`*`, `/` and `%` go before `+` and `-`, same-level operators go left to right, and brackets go first.",
    "A `double` cannot store many decimal values exactly. `%f` hides the tiny error and `%.17f` shows it.",
    "`+=`, `-=`, `*=` and `++` update a variable using its own value.",
    "Dividing a whole number by zero, or going past the range of an `int`, is undefined behavior.",
  ],
};
