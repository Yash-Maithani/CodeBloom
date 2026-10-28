import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: conditions.md. Shared idea: content/concepts/combined-conditions.md.
export const pythonConditions: LessonSource = {
  course: "python",
  slug: "conditions",
  title: "Combining conditions with and, or and not",
  status: "published",
  concept: "combined-conditions",
  objective: "Combine conditions in Python with `and`, `or` and `not`, choose the order with brackets, and avoid the common mistakes with `or` and `and`.",
  analogy: {
    title: "Door rules",
    text: "A sign at a door says who may come in. \"Over 18 and on the guest list\" lets in only people who meet both rules. \"Staff or guest\" lets in anyone who meets at least one. \"Not under 18\" lets in everyone except those under 18.",
    limit:
      "a person at the door can hear all the rules and judge everything at once. Python checks the parts from left to right and stops as soon as it knows the answer, so a part it skips is never run.",
  },
  examples: {
    and: {
      file: "python/cond_and",
      caption: "Both parts must be true",
      notes: [
        { startLine: 2, endLine: 2, text: "Both parts must be true. 30 is 13 or more, and 30 is less than 65, so the whole condition is true." },
      ],
    },
    or: {
      file: "python/cond_or",
      caption: "Either part is enough",
      notes: [
        { startLine: 2, endLine: 2, text: "Each side is a complete comparison of its own. The first is false and the second is true, and one is enough." },
      ],
    },
    not: {
      file: "python/cond_not",
      caption: "Reversing a value",
      notes: [{ startLine: 2, endLine: 2, text: "`raining` is `False`, so `not raining` is `True`." }],
    },
    values: {
      file: "python/cond_values",
      caption: "The three on True and False",
      notes: [
        { startLine: 1, endLine: 1, text: "Only one side is true, so `and` gives `False`." },
        { startLine: 2, endLine: 2, text: "One true side is enough for `or`." },
        { startLine: 4, endLine: 4, text: "Neither side is true, so `or` gives `False`." },
      ],
    },
    precedence: {
      file: "python/cond_precedence",
      caption: "and before or",
      notes: [
        { startLine: 1, endLine: 1, text: "`and` is done before `or`: `False and False` is `False`, and then `True or False` is `True`." },
        { startLine: 2, endLine: 2, text: "The brackets make the `or` happen first: `True or False` is `True`, and then `True and False` is `False`." },
      ],
    },
    short: {
      file: "python/cond_short",
      caption: "The right part is skipped",
      notes: [
        {
          startLine: 3,
          endLine: 3,
          text: "`count != 0` is `False`, so Python never works out `total / count`. Dividing by 0 would have stopped the program with an error.",
        },
      ],
    },
  },
  mistakes: [
    {
      title: "Writing or the way you say it",
      example: {
        file: "python/cond_or_text",
        notes: [{ startLine: 2, endLine: 2, text: "`\"Sunday\"` on its own is not a comparison. Python treats any text that is not empty as true." }],
      },
      whatHappens:
        "the program runs without an error, but it shows Weekend for a Monday. The condition is `day == \"Saturday\"` or `\"Sunday\"`. The second part is not a comparison: it is text, and text that is not empty counts as true. So the condition is true for every day.",
      whyEasyToMiss:
        "it reads like English, and it gives the right answer when the day really is Saturday or Sunday. Only a test with another day shows the problem.",
      fix: "give each side its own comparison: `day == \"Saturday\" or day == \"Sunday\"`.",
      fixExample: {
        file: "python/cond_or_text_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "Each side of `or` is now a complete comparison." }],
      },
    },
    {
      title: "Using and where you need or",
      example: {
        file: "python/cond_and_or",
        notes: [{ startLine: 2, endLine: 2, text: "No number is both less than 13 and 65 or more, so this condition is never true." }],
      },
      whatHappens:
        "the program runs without an error, but it shows Full price for a child. 10 is less than 13, but it is not 65 or more. One part is `False`, and `and` needs both.",
      whyEasyToMiss:
        "in English you say \"children and seniors get a discount\". But the condition checks one person at a time, and one person is not both.",
      fix: "use `or`, because a person gets the discount when either part is true.",
      fixExample: {
        file: "python/cond_and_or_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "`or` is true when either part is true, and 10 is less than 13." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_cond_ticket", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "Member discount", why: "`and` needs both parts to be true. `age >= 18` is true, but `member` is `False`." },
        { text: "Child price", why: "`or` needs only one true part. `age >= 18` is true, so the `elif` condition is true." },
        {
          text: "Member discount\nAdult price",
          why: "Only one group in an `if`, `elif` and `else` chain runs, and the `if` condition is not true here.",
        },
      ],
      hints: ["Is the `if` condition true when only one part is true?", "What does the `elif` condition need?"],
      explanation: "The `if` needs both parts and `member` is `False`, so it is skipped. The `elif` needs only one, and `age >= 18` is true.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_cond_not", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        {
          text: "False\nFalse",
          why: "`not` applies only to the part right after it unless brackets say otherwise. In line 3 it applies to `a`, and then `or b` is true.",
        },
        { text: "True\nTrue", why: "In line 4 the brackets make `a or b` happen first, and `not` then reverses that `True`." },
        { text: "False\nTrue", why: "Both lines are mixed up. Line 3 is `False or True`, which is `True`, and line 4 is `not True`, which is `False`." },
      ],
      hints: ["In line 3, does `not` apply to `a` or to `a or b`?", "What do the brackets in line 4 change?"],
      explanation: "Line 3 is `(not a) or b`, which is `False or True`. Line 4 works out the brackets first: `not True`.",
    },
    {
      kind: "choice",
      question: "Which condition is `True` when `day` holds \"Saturday\" or \"Sunday\", and `False` for every other day?",
      options: [
        {
          text: "`day == \"Saturday\" or day == \"Sunday\"`",
          why: "Each side is a full comparison, and `or` is true when either one is.",
          correct: true,
        },
        {
          text: "`day == \"Saturday\" or \"Sunday\"`",
          why: "The second part is text that is not empty, which always counts as true, as in the first mistake above.",
        },
        {
          text: "`day == \"Saturday\" and day == \"Sunday\"`",
          why: "`day` holds one value, which cannot be both. This condition is never true.",
        },
      ],
      hints: ["Can one value of `day` be both Saturday and Sunday?", "Does each side of `or` contain its own comparison?"],
      explanation: "Use `or` between two complete comparisons.",
    },
  ],
  recap: [
    "`and` is true only when both parts are true. `or` is true when at least one part is true. `not` reverses a condition.",
    "`not` is done first, then `and`, then `or`. Use brackets when you mix them.",
    "Each side of `and` or `or` must be a complete condition: `day == \"Saturday\" or day == \"Sunday\"`, not `day == \"Saturday\" or \"Sunday\"`.",
    "`==` compares text exactly, including capital letters.",
    "Python checks from left to right and stops as soon as the answer is known, which can protect a calculation that could fail.",
  ],
};
