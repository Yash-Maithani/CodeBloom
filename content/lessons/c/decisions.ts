import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: decisions.md. Shared idea: content/concepts/decisions.md,
// which the Python lesson uses too. Every example uses fixed values except the last,
// which reads input to check what scanf returned.
export const cDecisions: LessonSource = {
  course: "c",
  slug: "decisions",
  title: "Making decisions with if and else",
  status: "published",
  concept: "decisions",
  objective: "Make a C program choose what to do with `if` and `else`, using comparisons such as `>=` and `==`.",
  analogy: {
    title: "A fork in the road",
    text: "Picture a road that splits in two, with a sign asking a yes-or-no question. If the answer is yes, you take one branch, and if no, the other. A little further on, both branches join the same road again.",
    limit:
      "a traveller can hesitate or change their mind. A program cannot: it checks the condition once, at the moment it reaches it, using the values its variables have at that moment.",
  },
  examples: {
    compare: {
      file: "c/dec_compare",
      caption: "Comparisons give 1 or 0",
      notes: [
        { startLine: 5, endLine: 5, text: "`>=` means \"greater than or equal to\". 17 is not 18 or more, so the answer is 0, false." },
        { startLine: 6, endLine: 6, text: "`<` means \"less than\". 17 is less than 18, so the answer is 1, true." },
        { startLine: 7, endLine: 7, text: "`==` asks whether two values are equal. It is two equals signs." },
      ],
    },
    vote: {
      file: "c/dec_vote",
      caption: "if and else",
      notes: [
        { startLine: 5, endLine: 5, text: "The condition is in parentheses. 17 >= 18 is 0, false, so C skips the group in the braces after it." },
        { startLine: 7, endLine: 7, text: "`else` runs when the condition is false." },
        { startLine: 10, endLine: 10, text: "Outside both groups, so it runs either way." },
      ],
    },
    fee: {
      file: "c/dec_fee",
      caption: "if without else",
      notes: [{ startLine: 6, endLine: 6, text: "80 is not less than 50, so the group is skipped and `fee` stays 0." }],
    },
    nobraces: {
      file: "c/dec_no_braces",
      caption: "Without braces",
      notes: [
        { startLine: 5, endLine: 5, text: "No braces, so the `if` controls only line 6." },
        { startLine: 7, endLine: 7, text: "Not controlled by the `if`, so it runs whatever the condition says." },
      ],
    },
    truthy: {
      file: "c/dec_truthy",
      caption: "Zero is false",
      notes: [{ startLine: 5, endLine: 5, text: "`items` is 0, which counts as false." }],
    },
    check: {
      file: "c/dec_scanf_check",
      caption: "Checking what scanf returned",
      notes: [
        { startLine: 5, endLine: 5, text: "`scanf` stores a number and returns 1, or it returns less than 1 when the typed text is not a whole number." },
        { startLine: 6, endLine: 6, text: "Compares the returned value with 1. The typed text is `abc`, so `scanf` returned 0 and the condition is false." },
        { startLine: 9, endLine: 9, text: "Runs when `scanf` could not read a number, instead of carrying on with the starting value." },
      ],
    },
  },
  mistakes: [
    {
      title: "Leaving out a parenthesis",
      example: {
        file: "c/dec_missing_paren",
        notes: [{ startLine: 5, endLine: 5, text: "The parenthesis that opens the condition is never closed." }],
      },
      whatHappens:
        "the compiler stops with errors, so no program is made. The condition of an `if` goes inside a pair of parentheses, and the closing one is missing. The second message appears because the compiler lost track of the braces after the first error.",
      howToRead:
        "`5:18` is line 5, column 18. The `~` marks the parenthesis still waiting to be closed, the `^~` points at the `{` where `)` was expected, and the line under it shows the missing character. Fix the first error and compile again, because the later ones often disappear.",
      fix: "close the parenthesis before the brace: `if (age >= 18) {`.",
      fixExample: {
        file: "c/dec_missing_paren_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "The condition is now inside a complete pair of parentheses." }],
      },
    },
    {
      title: "Using = instead of ==",
      example: {
        file: "c/dec_assign",
        notes: [{ startLine: 5, endLine: 5, text: "This is not a comparison. `=` stores 18 in `age`." }],
      },
      whatHappens:
        "gcc stops with an error because CodeBloom compiles with `-Wall -Wextra -Werror`: `-Wall` makes gcc report it, and `-Werror` turns the report into an error. Without `-Wall`, gcc may say nothing at all: the program is made and runs. `age = 18` stores 18 in `age`, and the value of that assignment, 18, is not zero, so the condition is true. The program would say You are 18 whatever `age` was before.",
      howToRead:
        "\"suggest parentheses around assignment used as truth value\" means gcc found an assignment where a condition is expected. The `^~~` marks it.",
      fix: "`==` compares and `=` stores: `if (age == 18)`.",
      fixExample: {
        file: "c/dec_assign_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "`==` compares `age` with 18. 17 is not 18, so the `else` group runs." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_dec_scope", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "", why: "Without braces, the `if` controls only the next instruction. `Checked` is outside it, so it always runs." },
        { text: "Small order\nChecked", why: "80 < 50 is false, so the instruction under the `if` is skipped." },
      ],
      hints: ["Is 80 less than 50?", "Which instruction does the `if` control when there are no braces?"],
      explanation: "The condition is false, so the controlled line is skipped. The last line is not controlled by the `if`, so it runs.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_dec_values", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "true false", why: "A comparison in C gives the whole number 1 or 0, not the words, and `%d` shows a whole number." },
        { text: "0 1", why: "5 > 3 is true, which is 1, and 5 == 3 is false, which is 0. They are not the other way round." },
        { text: "1 1", why: "`==` asks whether the values are equal. 5 is not equal to 3, so the answer is 0." },
      ],
      hints: ["Is 5 greater than 3?", "What number does C use for true, and what number for false?"],
      explanation: "The first comparison is true and gives 1, and the second is false and gives 0.",
    },
    {
      kind: "choice",
      question: "Which condition is true only when `age` is exactly 18?",
      options: [
        { text: "`age == 18`", why: "`==` compares the two values.", correct: true },
        {
          text: "`age = 18`",
          why: "This stores 18 in `age`, and its value, 18, is not zero, so the condition is true for every starting value of `age`, as in the second mistake.",
        },
        { text: "`age === 18`", why: "`===` is not a C operator, and compilation fails." },
      ],
      hints: ["Which operator compares, and which one stores?", "How many equals signs does a comparison use?"],
      explanation: "C compares with `==`. A single `=` stores a value.",
    },
  ],
  recap: [
    "`==`, `!=`, `<`, `>`, `<=` and `>=` compare two values and give 1 for true and 0 for false.",
    "`if (condition) { ... } else { ... }` runs the first group when the condition is true and the second when it is false. The condition goes in parentheses.",
    "Braces mark the groups, and the compiler ignores indentation. Without braces, an `if` controls only the next instruction.",
    "In a condition, 0 is false and every other number is true.",
    "`=` stores a value and `==` compares. Writing `=` in a condition is a mistake that gcc reports when you compile with `-Wall`.",
    "Every `if` condition needs a complete pair of parentheses.",
    "Compare the value that `scanf` returns with 1 to find out whether it read a number.",
  ],
};
