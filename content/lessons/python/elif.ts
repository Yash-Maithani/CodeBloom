import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: elif.md. Shared idea: content/concepts/several-choices.md,
// written so that a later C lesson on else if could share it.
export const pythonElif: LessonSource = {
  course: "python",
  slug: "elif",
  title: "More decisions with elif",
  status: "published",
  concept: "several-choices",
  objective: "Make a Python program choose between three or more outcomes with `elif`, and explain why the order of the conditions matters.",
  analogy: {
    title: "A corridor of doors",
    text: "Picture a corridor with several doors, each with a sign. You read the signs from the nearest door onwards, and you go through the first door whose sign fits you. You never look at the doors after it.",
    limit:
      "a person can look at all the doors first and choose the best fit. A program cannot: it uses the first condition that is true, even when a later one fits better.",
  },
  examples: {
    ticket: {
      file: "python/elif_ticket",
      caption: "Three outcomes",
      notes: [
        { startLine: 2, endLine: 2, text: "`if` checks the first condition. 15 is not less than 13, so it is `False` and Python skips line 3." },
        {
          startLine: 4,
          endLine: 4,
          text: "`elif` means \"else if\": it is checked only because the condition on line 2 was `False`. 15 is less than 65, so it is `True`.",
        },
        { startLine: 5, endLine: 5, text: "This group runs. Python then skips the rest of the chain, including `else`, and carries on after it." },
        { startLine: 6, endLine: 7, text: "`else` runs only when every condition above it was `False`. Here it is skipped." },
      ],
    },
    grade: {
      file: "python/elif_grade",
      caption: "Four outcomes",
      notes: [
        { startLine: 2, endLine: 2, text: "Checked first. 72 is not 90 or more." },
        {
          startLine: 4,
          endLine: 4,
          text: "Checked only because line 2 was `False`, so `score` is below 90. 72 is 70 or more, so this is `True` and this group runs.",
        },
        { startLine: 6, endLine: 6, text: "Not checked at all. The chain stopped at line 4." },
        { startLine: 8, endLine: 9, text: "The `else` group is for scores below 50. It does not run here." },
      ],
    },
    separate: {
      file: "python/elif_separate",
      caption: "Two separate ifs",
      notes: [
        { startLine: 2, endLine: 2, text: "A first, independent `if`. 95 is 90 or more, so Grade A is shown." },
        { startLine: 4, endLine: 4, text: "A second `if`, not connected to the first. Python checks it anyway. 95 is 70 or more, so Grade B is shown too." },
      ],
    },
  },
  visuals: {
    ticket: {
      example: "python/elif_ticket",
      title: "Step through it: watch Python stop at the first true condition",
      notes: {
        1: "`age` gets the value 15.",
        2: "Python checks `age < 13`. It is `False`, because 15 is not less than 13.",
        3: "Python checks the `elif` condition, `age < 65`. It is `True`, so Python will not check anything else in this chain.",
        4: "Because the `elif` condition was `True`, Python ran its group and skipped `else`. Lines 6 and 7 are not steps because they never ran.",
      },
      branches: { 2: false, 3: true },
    },
  },
  mistakes: [
    {
      title: "Putting the conditions in the wrong order",
      example: {
        file: "python/elif_wrong_order",
        notes: [
          { startLine: 2, endLine: 2, text: "95 is 50 or more, so this is `True`, and it is checked first." },
          { startLine: 4, endLine: 4, text: "Never reached. The chain stopped at line 2." },
        ],
      },
      whatHappens:
        "the program runs without an error, but it shows Pass for a score of 95. Python stops at the first true condition, and 95 is 50 or more, so the `elif` meant to catch high scores is never checked.",
      whyEasyToMiss: "no error message appears, and Pass looks like a reasonable answer. You only notice if you test a high score.",
      fix: "put the strictest condition first: check 90 or more before 50 or more.",
      fixExample: {
        file: "python/elif_right_order",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "Checked first, so 95 is caught here." }],
      },
    },
    {
      title: "Forgetting the colon after elif",
      example: {
        file: "python/elif_missing_colon",
        notes: [{ startLine: 4, endLine: 4, text: "The colon at the end of this line is missing." }],
      },
      whatHappens:
        "Python stops with a `SyntaxError` before running any line, not even line 1. Every `if`, `elif` and `else` line must end with a colon.",
      howToRead:
        "the message gives the file and the line number and shows the line. The `^` marks the spot where Python expected a colon, and the last line says what it expected.",
      fix: "add the colon: `elif age < 65:`.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "This is the ticket program again, with an older person. What does it show?",
      example: { file: "python/practice_elif_boundary", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "Standard ticket", why: "`<` means strictly less than. 65 is not less than 65, so the `elif` condition is `False`." },
        { text: "Standard ticket\nSenior ticket", why: "Only one group in an `if`, `elif` and `else` chain runs. Once Python runs a group, it skips the rest." },
      ],
      hints: ["Is 65 less than 65?", "How many groups of an `if`, `elif`, `else` chain can run?"],
      explanation: "65 is not less than 13, and 65 is not less than 65, so both conditions are `False` and Python runs the `else` group.",
    },
    {
      kind: "predict-output",
      question: "What does this program show? Check the conditions from the top.",
      example: { file: "python/practice_elif_order", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "Hot", why: "The `elif` on line 4 is never checked. Line 2 is already true for 30, because 30 is more than 10." },
        { text: "Mild\nHot", why: "Only the first true condition runs. After line 3, Python skips the rest of the chain." },
        { text: "Cold", why: "`else` runs only when every condition above it is `False`. The condition on line 2 is true." },
      ],
      hints: ["Check the conditions from the top. Which is the first true one?", "What happens to the rest of the chain after a group runs?"],
      explanation:
        "30 is more than 10, and that is checked first, so Python runs line 3 and skips the rest. The `elif` for 25 is never checked, even though 30 is more than 25 as well.",
    },
    {
      kind: "choice",
      question: "A shop gives 20% off orders of 100 or more, 10% off orders of 50 or more, and nothing otherwise. Which order of conditions gives an order of 120 the 20% discount?",
      options: [
        { text: "`if total >= 100:` first, then `elif total >= 50:`", why: "120 is 100 or more, so the first condition is true and Python skips the rest.", correct: true },
        { text: "`if total >= 50:` first, then `elif total >= 100:`", why: "120 is also 50 or more, so the first condition is true and Python never checks the second. The order mistake in this lesson works the same way." },
        { text: "`if total >= 100:` then a separate `if total >= 50:`", why: "These are two independent decisions. Python checks both, and 120 passes both, so it would get both discounts." },
      ],
      hints: ["Python stops at the first true condition. Which conditions are true for 120?", "Which should be checked first, the stricter condition or the looser one?"],
      explanation: "Put the strictest condition first. For 120, `total >= 100` is true, so Python uses the 20% group and skips the rest.",
    },
  ],
  recap: [
    "`elif` (short for else if) adds another condition to a decision, so a program can choose between three or more outcomes.",
    "Python checks the conditions from the top and runs only the group of the first true one. It skips the rest, including `else`.",
    "A later condition is only checked when every condition above it was `False`.",
    "Order matters: put the strictest condition first, or a looser one can take its values.",
    "Separate `if` lines are independent and can all run. `elif` lines are part of one chain.",
    "`if`, `elif` and `else` lines all end with a colon.",
  ],
};
