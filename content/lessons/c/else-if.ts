import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: else-if.md. Shared idea: content/concepts/several-choices.md,
// which the Python elif lesson uses too. switch works on whole numbers only: char and
// text are taught later. The fall-through and semicolon mistakes are gcc reports that
// -Wextra (and -Wall for the second) turn on and CodeBloom's -Werror makes errors; the
// text says which flag produces each message and describes the result without printing it.
export const cElseIf: LessonSource = {
  course: "c",
  slug: "else-if",
  title: "More decisions with else if and switch",
  status: "published",
  concept: "several-choices",
  objective: "Make a C program choose between three or more outcomes with `else if` and `switch`, explain why the order of the conditions matters, and use `break` correctly.",
  analogy: {
    title: "A corridor of doors",
    text: "Picture a corridor with several doors, each with a sign. You read the signs from the nearest door onwards, and you go through the first door whose sign fits you. You never look at the doors after it.",
    limit:
      "a person can look at all the doors first and choose the best fit. A program cannot: it uses the first condition that is true, even when a later one fits better. A `switch` is a different kind of corridor: it jumps straight to the door with the matching number, and then keeps walking through the doors after it until it meets a `break`.",
  },
  examples: {
    ticket: {
      file: "c/sw_ticket",
      caption: "Three outcomes",
      notes: [
        { startLine: 5, endLine: 5, text: "`if` checks the first condition. 15 is not less than 13, so it is false and C skips line 6." },
        { startLine: 7, endLine: 7, text: "`else if` is checked only because the condition on line 5 was false. 15 is less than 65, so it is true." },
        { startLine: 8, endLine: 8, text: "This group runs. C then skips the rest of the chain, including `else`, and carries on after it." },
        { startLine: 9, endLine: 9, text: "`else` runs only when every condition above it was false. Here it is skipped." },
      ],
    },
    grade: {
      file: "c/sw_grade",
      caption: "Four outcomes",
      notes: [
        { startLine: 5, endLine: 5, text: "Checked first. 72 is not 90 or more." },
        { startLine: 7, endLine: 7, text: "Checked only because line 5 was false, so `score` is below 90. 72 is 70 or more, so this group runs." },
        { startLine: 9, endLine: 9, text: "Not checked at all. The chain stopped at line 7." },
        { startLine: 11, endLine: 11, text: "The `else` group is for scores below 50. It does not run here." },
      ],
    },
    separate: {
      file: "c/sw_separate",
      caption: "Two separate ifs",
      notes: [
        { startLine: 5, endLine: 5, text: "A first, independent `if`. 95 is 90 or more, so Grade A is shown." },
        { startLine: 8, endLine: 8, text: "A second `if`, not connected to the first. C checks it anyway. 95 is 70 or more, so Grade B is shown too." },
      ],
    },
    day: {
      file: "c/sw_day",
      caption: "A switch with break",
      notes: [
        { startLine: 5, endLine: 5, text: "`switch` looks at the value of `day`, 3, and jumps to the label with that value." },
        { startLine: 6, endLine: 6, text: "A label, not a condition. C does not test it. It only jumps to the matching one." },
        { startLine: 14, endLine: 14, text: "`break` leaves the switch. Without it, C would carry on into the next label." },
        { startLine: 15, endLine: 15, text: "`default` runs when no `case` matches. It is optional and usually goes last." },
      ],
    },
    weekend: {
      file: "c/sw_weekend",
      caption: "Two labels, one group",
      notes: [
        { startLine: 6, endLine: 6, text: "C jumps here for 6. This label has no instructions of its own, so C carries on into the instructions under the next label." },
        { startLine: 9, endLine: 9, text: "Ends the switch after the shared group." },
      ],
    },
    menu: {
      file: "c/sw_menu",
      caption: "A menu",
      notes: [
        { startLine: 7, endLine: 7, text: "The typed number is stored in `choice`, and the `switch` below uses it." },
        { startLine: 18, endLine: 18, text: "Runs for any number that is not 1, 2 or 3." },
      ],
    },
  },
  mistakes: [
    {
      title: "Putting the conditions in the wrong order",
      example: {
        file: "c/sw_wrong_order",
        notes: [
          { startLine: 5, endLine: 5, text: "95 is 50 or more, so this is true, and it is checked first." },
          { startLine: 7, endLine: 7, text: "Never reached. The chain stopped at line 5." },
        ],
      },
      whatHappens:
        "the program compiles and runs without any message, but it shows Pass for a score of 95. C stops at the first true condition, and 95 is 50 or more, so the `else if` meant for high scores is never checked. gcc says nothing with any flags.",
      whyEasyToMiss: "no message appears, and Pass looks reasonable. You only notice if you test a high score.",
      fix: "put the strictest condition first: check 90 or more before 50 or more.",
      fixExample: {
        file: "c/sw_right_order",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "Checked first, so 95 is caught here." }],
      },
    },
    {
      title: "Forgetting break in a switch",
      example: {
        file: "c/sw_no_break",
        notes: [{ startLine: 7, endLine: 7, text: "There is no `break` after this instruction, so C would carry on into `case 2`." }],
      },
      whatHappens:
        "gcc reports the problem when you compile with `-Wextra`, and CodeBloom compiles with `-Wall -Wextra -Werror`, so it is an error here and no program is made. With plain `gcc` or `gcc -Wall`, gcc says nothing and the program is made. It then does what C defines: it runs the matching label and carries on through every instruction below it, until a `break` or the closing brace. This is called **fall-through**.",
      howToRead:
        "\"this statement may fall through\" means the instruction on line 7 can continue into the next label. The `note: here` points at the label it would run into.",
      whyEasyToMiss:
        "the program runs without any other sign, and falling through is allowed. It is useful on purpose, as in the weekend example, but on line 7 it was not meant.",
      fix: "end each group with `break;`.",
      fixExample: {
        file: "c/sw_with_break",
        caption: "The fix",
        notes: [{ startLine: 8, endLine: 8, text: "`break` leaves the switch after Monday." }],
      },
    },
    {
      title: "A semicolon after the if condition",
      example: {
        file: "c/sw_semicolon",
        notes: [{ startLine: 5, endLine: 5, text: "The semicolon ends the `if`. Its group is empty, so the braces below are not part of the `if`." }],
      },
      whatHappens:
        "CodeBloom compiles with `-Wall -Wextra -Werror`. `-Wall` makes gcc report the misleading indentation, `-Wextra` adds the empty body, and `-Werror` makes both errors. With plain `gcc`, gcc says nothing and the program is made. It then runs the braces group whatever the condition says, because the `if` controls only the empty instruction before the semicolon.",
      howToRead:
        "\"suggest braces around empty body\" means the `if` controls nothing. \"this `if` clause does not guard... the latter\" says the next block is not guarded by the `if`, although its indentation suggests it is.",
      fix: "remove the semicolon: `if (age >= 18) {`.",
      fixExample: {
        file: "c/sw_semicolon_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "The braces group now belongs to the `if`, so it is skipped for 15." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "This is the ticket program again, with an older person. What does it print?",
      example: { file: "c/practice_sw_boundary", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "Standard ticket", why: "`<` means strictly less than. 65 is not less than 65, so the `else if` condition is false." },
        { text: "Standard ticket\nSenior ticket", why: "Only one group in an `if`, `else if`, `else` chain runs. Once C runs a group, it skips the rest." },
      ],
      hints: ["Is 65 less than 65?", "How many groups of an `if`, `else if`, `else` chain can run?"],
      explanation: "65 is not less than 13, and 65 is not less than 65, so both conditions are false and C runs the `else` group.",
    },
    {
      kind: "predict-output",
      question: "What does this program print? Check the conditions from the top.",
      example: { file: "c/practice_sw_order", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "Hot", why: "The `else if` is never checked. The first condition is already true for 30, because 30 is more than 10." },
        { text: "Mild\nHot", why: "Only the first true condition runs. After the first group, C skips the rest of the chain." },
        { text: "Cold", why: "`else` runs only when every condition above it is false. The first condition is true." },
      ],
      hints: ["Check the conditions from the top. Which is the first true one?", "What happens to the rest of the chain after a group runs?"],
      explanation:
        "30 is more than 10, and that is checked first, so C runs the first group and skips the rest. The `else if` for 25 is never checked, even though 30 is more than 25 as well.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_sw_switch", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "", why: "`case 2:` has no instructions of its own, but C carries on into the instructions under the next label, which here print Medium." },
        { text: "Medium\nHigh", why: "The `break` after Medium leaves the switch, so `default` is not reached." },
        { text: "High", why: "`default` runs only when no label matches. `case 2` matches 2." },
      ],
      hints: ["Which label does C jump to for 2?", "What does an empty label do, and what does `break` do?"],
      explanation: "C jumps to `case 2:`, which has no instructions, so it carries on into the group of `case 3:`. That group prints Medium, and the `break` leaves the switch.",
    },
  ],
  recap: [
    "`else if` adds another condition to a decision, so a program can choose between three or more outcomes.",
    "C checks the conditions from the top and runs only the group of the first true one. It skips the rest, including `else`.",
    "Order matters: put the strictest condition first, or a looser one can take its values.",
    "Separate `if` statements are independent and can all run. `else if` lines are part of one chain.",
    "`switch (value)` jumps to the `case` label with that whole-number value. `break` leaves the switch, and `default` runs when nothing matches.",
    "Without `break`, C continues into the next label. Stacked labels share one group on purpose, and a missing `break` does it by mistake. gcc reports that with `-Wextra`.",
    "A semicolon after `if (condition)` makes its group empty. gcc reports it with `-Wall` and `-Wextra`.",
  ],
};
