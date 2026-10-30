import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: numbers.md. Shared idea: content/concepts/arithmetic.md.
// This lesson comes before "Making decisions with if and else", so it uses no
// if, else or == (decision D75). Only the error for `/` is shown: the messages
// for `//` and `%` by zero differ between Python 3.13 and 3.14.
export const pythonNumbers: LessonSource = {
  course: "python",
  slug: "numbers",
  title: "Numbers and arithmetic",
  status: "published",
  concept: "arithmetic",
  objective: "Calculate with Python's arithmetic operators, choose the order with brackets, convert with `float()` and `str()`, and update a variable with `+=`.",
  analogy: {
    title: "A calculator",
    text: "A calculator takes numbers and an operation and gives back a result. Python works like a calculator where you type the whole calculation at once.",
    limit:
      "a calculator rounds what it shows, so you rarely see the tiny errors that decimal numbers can have. Python shows what it really stores, as the 0.1 + 0.2 example shows.",
  },
  examples: {
    basics: {
      file: "python/num_basics",
      caption: "The six operators",
      notes: [
        { startLine: 4, endLine: 4, text: "`/` is ordinary division, with a decimal part when there is one." },
        { startLine: 5, endLine: 5, text: "The division comes out even, but `/` still gives a float." },
        { startLine: 6, endLine: 6, text: "`//` divides and rounds down to a whole number." },
        { startLine: 7, endLine: 7, text: "`%` is the remainder: 7 divided by 2 is 3 with 1 left over." },
      ],
    },
    minutes: {
      file: "python/num_minutes",
      caption: "Hours and minutes",
      notes: [
        { startLine: 2, endLine: 2, text: "`//` counts the whole hours." },
        { startLine: 3, endLine: 3, text: "`%` is what is left over after taking out the whole hours." },
      ],
    },
    negative: {
      file: "python/num_negative",
      caption: "Rounding down below zero",
      notes: [
        { startLine: 1, endLine: 1, text: "The exact result is -3.5. `//` rounds down to the next smaller whole number, -4." },
        { startLine: 2, endLine: 2, text: "To match: 2 times -4 is -8, and 1 more makes -7." },
      ],
    },
    order: {
      file: "python/num_order",
      caption: "Which part comes first",
      notes: [
        { startLine: 1, endLine: 1, text: "`3 * 4` is done first, then 2 is added." },
        { startLine: 2, endLine: 2, text: "The brackets make the addition happen first." },
        { startLine: 3, endLine: 3, text: "Same level, so left to right: `10 - 4` first, then 3 is taken away." },
      ],
    },
    float: {
      file: "python/num_float",
      caption: "A tiny error and round",
      notes: [
        { startLine: 1, endLine: 1, text: "The stored value of 0.1 is very slightly off, and the tiny error shows in the sum." },
        { startLine: 2, endLine: 2, text: "`round(..., 2)` rounds the result to two decimal places." },
      ],
    },
    convert: {
      file: "python/num_convert",
      caption: "float and str",
      notes: [
        { startLine: 1, endLine: 1, text: "`float` converts the text into the number 2.5." },
        { startLine: 5, endLine: 5, text: "`str(total)` turns the number into text, so `+` can join it to `\"Total: \"`." },
      ],
    },
    update: {
      file: "python/num_update",
      caption: "Shorter updates",
      notes: [
        { startLine: 2, endLine: 2, text: "The same as `score = score + 5`." },
        { startLine: 4, endLine: 4, text: "The same as `score = score - 3`." },
        { startLine: 6, endLine: 6, text: "The same as `score = score * 2`." },
      ],
    },
  },
  mistakes: [
    {
      title: "Using / when you want a whole number",
      example: {
        file: "python/num_slash",
        notes: [{ startLine: 3, endLine: 3, text: "`/` always gives a float, even when the division comes out even." }],
      },
      whatHappens: "the program runs without an error, but it shows 2.0, a float, not the whole number 2.",
      whyEasyToMiss: "no error message appears, and 2.0 is the right amount.",
      fix: "use `//` when you want a whole number of items: `slices // people`.",
      fixExample: {
        file: "python/num_slash_fix",
        caption: "The fix",
        notes: [{ startLine: 3, endLine: 3, text: "`//` gives the whole number of slices for each person." }],
      },
    },
    {
      title: "Dividing by zero",
      example: {
        file: "python/num_zero",
        notes: [{ startLine: 1, endLine: 1, text: "Dividing by 0 has no answer." }],
      },
      whatHappens:
        "Python stops with a `ZeroDivisionError`, before anything is shown. `//` and `%` stop in the same way when the number on the right is 0.",
      howToRead: "the last line names the error and says division by zero. The lines above show the code that failed.",
      fix: "make sure the number you divide by is not 0 before you divide. Making decisions with if and else shows how to check a value first, and Combining conditions with and, or and not shows a safe way to divide.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_num_division", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "3\n2\n3", why: "`/` always gives a float, so `17 / 5` is 3.4. Only `//` gives a whole number." },
        {
          text: "2\n3\n3.4",
          why: "`//` counts how many times 5 fits into 17, which is 3. `%` is what is left over, which is 2. They are not the other way round.",
        },
        { text: "4\n2\n3.4", why: "`//` rounds down, never up. 17 / 5 is 3.4, so `//` gives 3." },
      ],
      hints: ["How many times does 5 fit into 17?", "How much is left over after that?"],
      explanation: "5 fits into 17 three times with 2 left over, and exact division gives 3.4.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_num_order", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "20\n20\n3", why: "`*` is done before `+` even without brackets, so `2 + 3 * 4` is 2 + 12." },
        { text: "14\n14\n3", why: "Brackets are done first, so `(2 + 3) * 4` is `5 * 4`." },
        { text: "14\n20\n9", why: "Subtraction at the same level goes from left to right: `10 - 4` is 6, and then 6 - 3 is 3." },
      ],
      hints: ["Which is done first, `+` or `*`?", "What do brackets change? In which direction does subtraction go?"],
      explanation: "Line 1 multiplies first, line 2 adds first because of the brackets, and line 3 goes left to right.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_num_update", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "16", why: "`total += 5` changes `total`. It is 15 afterwards, so the next line doubles 15, not 10." },
        { text: "11", why: "`total *= 2` changes `total` as well. 15 becomes 30 before 4 is taken away." },
      ],
      hints: ["Write down `total` after every line.", "Does `+=` change the variable, or only work out a value?"],
      explanation: "`total` goes 10, 15, 30, 26. Each shorthand line changes it.",
    },
  ],
  recap: [
    "`+`, `-`, `*`, `/`, `//` and `%` are Python's arithmetic operators. `/` always gives a float, `//` rounds down to a whole number, and `%` gives the remainder.",
    "`//` rounds down, so `-7 // 2` is -4, and `%` matches it.",
    "`*`, `/`, `//` and `%` go before `+` and `-`, operators at the same level go left to right, and brackets go first.",
    "Decimal numbers are stored in binary, so some are very slightly off. `round(number, 2)` rounds a result for display.",
    "`float(\"2.50\")` converts text to a float. `str(7.5)` converts a number to text.",
    "`score += 5` is shorthand for `score = score + 5`, and `-=` and `*=` work the same way.",
    "Dividing by 0 with `/`, `//` or `%` stops with a `ZeroDivisionError`.",
  ],
};
