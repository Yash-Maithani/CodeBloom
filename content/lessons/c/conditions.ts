import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: conditions.md. Shared idea: content/concepts/combined-conditions.md,
// which the Python lesson uses too. The true and false words (stdbool.h, C23) are not
// covered. Mixing && with || without brackets is a gcc report with -Wall that
// CodeBloom's -Werror makes an error; the other two mistakes compile with every flag.
export const cConditions: LessonSource = {
  course: "c",
  slug: "conditions",
  title: "Combining conditions with &&, || and !",
  status: "published",
  concept: "combined-conditions",
  objective: "Combine conditions in C with `&&`, `||` and `!`, choose the order with brackets, and avoid the common mistakes with `||`, `&&` and `&`.",
  analogy: {
    title: "Door rules",
    text: "A sign at a door says who may come in. \"Over 18 and on the guest list\" lets in only people who meet both rules. \"Staff or guest\" lets in anyone who meets at least one. \"Not under 18\" lets in everyone except those under 18.",
    limit:
      "a person at the door can hear all the rules and judge everything at once. C checks the parts from left to right and stops as soon as it knows the answer, so a part it skips is never run.",
  },
  examples: {
    and: {
      file: "c/cond_and",
      caption: "Both parts must be true",
      notes: [{ startLine: 5, endLine: 5, text: "Both parts must be true. 30 is 13 or more, and 30 is less than 65, so the whole condition is true." }],
    },
    or: {
      file: "c/cond_or",
      caption: "Either part is enough",
      notes: [{ startLine: 5, endLine: 5, text: "Each side is a complete comparison of its own. The first is false and the second is true, and one is enough." }],
    },
    not: {
      file: "c/cond_not",
      caption: "Reversing a value",
      notes: [{ startLine: 5, endLine: 5, text: "`raining` is 0, which counts as false, so `!raining` is true." }],
    },
    values: {
      file: "c/cond_values",
      caption: "The three on numbers",
      notes: [
        { startLine: 4, endLine: 4, text: "Only one side is true, so `&&` gives 0." },
        { startLine: 5, endLine: 5, text: "One true side is enough for `||`." },
        { startLine: 7, endLine: 7, text: "Neither side is true, so `||` gives 0." },
        { startLine: 8, endLine: 8, text: "Neither side is 0, so both count as true. The answer is 1, not 3: these operators always give 1 or 0." },
      ],
    },
    notorder: {
      file: "c/cond_not_order",
      caption: "! before &&",
      notes: [
        { startLine: 4, endLine: 4, text: "`!` is done first: `!0` is 1, and then `1 && 0` is 0." },
        { startLine: 5, endLine: 5, text: "The brackets make `0 && 0` happen first. It is 0, and `!` turns it into 1." },
      ],
    },
    short: {
      file: "c/cond_short",
      caption: "The right part is skipped",
      notes: [
        { startLine: 6, endLine: 6, text: "`count != 0` is false, so C never works out `total / count`. Dividing by 0 would have been undefined behavior." },
      ],
    },
  },
  mistakes: [
    {
      title: "Using & when you mean &&",
      example: {
        file: "c/cond_single_and",
        notes: [
          {
            startLine: 6,
            endLine: 6,
            text: "A single `&` is a different operator. It combines the bits of the two numbers, and the bits of 2 and 1 have nothing in common, so the result is 0.",
          },
        ],
      },
      whatHappens:
        "the program compiles and runs without any message, with every set of flags. It shows Missing a kind, although both `apples` and `oranges` are not 0. This lesson does not cover `&`: just remember that `&&` is the one that asks \"are both true?\". With two comparisons, as in `age >= 13 & age < 65`, a single `&` gives the same answer, but `gcc -Wall` warns about that form (\"suggest parentheses around comparison in operand of `&`\") and plain `gcc` does not. No flag warns about `apples & oranges`.",
      whyEasyToMiss:
        "gcc says nothing about this form, and for two comparisons a single `&` happens to give the same answer, so a test may pass by luck.",
      fix: "use `&&`.",
      fixExample: {
        file: "c/cond_double_and",
        caption: "The fix",
        notes: [{ startLine: 6, endLine: 6, text: "`&&` asks whether both numbers are true, that is, not 0." }],
      },
    },
    {
      title: "Writing || the way you say it",
      example: {
        file: "c/cond_or_value",
        notes: [{ startLine: 5, endLine: 5, text: "`7` on its own is not a comparison. It is a number that is not 0, so it counts as true." }],
      },
      whatHappens:
        "the program compiles and runs without any message, with every set of flags. It shows Weekend for day 3. The condition is `day == 6` or `7`. The second part is the number 7, which counts as true, so the condition is true for every day.",
      whyEasyToMiss:
        "it reads like English, and it gives the right answer when the day really is 6 or 7. Only a test with another day shows the problem.",
      fix: "give each side its own comparison: `day == 6 || day == 7`.",
      fixExample: {
        file: "c/cond_or_value_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "Each side of `||` is now a complete comparison." }],
      },
    },
    {
      title: "Mixing && and || without brackets",
      example: {
        file: "c/cond_mixed",
        notes: [{ startLine: 7, endLine: 7, text: "`&&` is done before `||`, so this means `a || (b && c)`. Many readers expect left to right." }],
      },
      whatHappens:
        "gcc reports it when you compile with `-Wall`, and CodeBloom's `-Werror` makes it an error. With plain `gcc` it says nothing, and the program is made. It is not a bug in C: `&&` is done before `||`. The warning is advice to make the order visible.",
      howToRead: "\"suggest parentheses around `&&` within `||`\" means gcc found both operators in one expression without brackets.",
      fix: "add the brackets that say what you mean: `a || (b && c)`.",
      fixExample: {
        file: "c/cond_mixed_fix",
        caption: "The fix",
        notes: [{ startLine: 7, endLine: 7, text: "The brackets show that `b && c` is worked out first." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_cond_ticket", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "Member discount", why: "`&&` needs both parts to be true. `age >= 18` is true, but `member` is 0, which counts as false." },
        { text: "Child price", why: "`||` needs only one true part. `age >= 18` is true, so the `else if` condition is true." },
        {
          text: "Member discount\nAdult price",
          why: "Only one group in an `if`, `else if`, `else` chain runs, and the `if` condition is false here.",
        },
      ],
      hints: ["Is the `if` condition true when only one part is true?", "What does the `else if` condition need?"],
      explanation: "The `if` needs both parts and `member` is 0, so it is skipped. The `else if` needs only one, and `age >= 18` is true.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_cond_not", notes: [] },
      correctPosition: 4,
      wrongOutputs: [
        {
          text: "0\n0",
          why: "`!` applies only to the part right after it unless brackets say otherwise. In line 1 it applies to `a`, and then `|| b` is true.",
        },
        { text: "1\n1", why: "In line 2 the brackets make `a || b` happen first, and `!` then reverses that 1." },
        { text: "0\n1", why: "Both lines are mixed up. Line 1 is `0 || 1`, which is 1, and line 2 is `!1`, which is 0." },
      ],
      hints: ["In line 1, does `!` apply to `a` or to `a || b`?", "What do the brackets in line 2 change?"],
      explanation: "Line 1 is `(!a) || b`, which is `0 || 1`. Line 2 works out the brackets first: `!1`.",
    },
    {
      kind: "choice",
      question: "Which condition is true when `day` is 6 or 7, and false for every other day?",
      options: [
        { text: "`day == 6 || day == 7`", why: "Each side is a full comparison, and `||` is true when either one is.", correct: true },
        { text: "`day == 6 || 7`", why: "The second part is the number 7, which always counts as true, as in the second mistake above." },
        { text: "`day == 6 && day == 7`", why: "`day` holds one value, which cannot be both. This condition is never true." },
      ],
      hints: ["Can one value of `day` be both 6 and 7?", "Does each side of `||` contain its own comparison?"],
      explanation: "Use `||` between two complete comparisons.",
    },
  ],
  recap: [
    "`&&` is true only when both parts are true. `||` is true when at least one part is true. `!` reverses a condition.",
    "They give 1 or 0, and treat any number that is not 0 as true.",
    "`!` is done first, then `&&`, then `||`. Use brackets when you mix `&&` with `||`.",
    "Each side of `&&` or `||` must be a complete condition: `day == 6 || day == 7`, not `day == 6 || 7`.",
    "A single `&` is a different operator. Use `&&` to ask \"are both true?\".",
    "C checks from left to right and stops as soon as the answer is known, which can protect a calculation that could fail.",
  ],
};
