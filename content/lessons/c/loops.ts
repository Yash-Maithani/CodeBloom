import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: loops.md. Shared idea: content/concepts/repetition.md,
// which the Python lesson uses too. The infinite loop is taught in prose, not as an
// example, because an example that never ends cannot be verified (gcc says nothing
// about it with any flags). The semicolon and = mistakes are gcc reports that -Wall turns
// on and CodeBloom's -Werror makes errors.
export const cLoops: LessonSource = {
  course: "c",
  slug: "loops",
  title: "Loops: while, for and do while",
  status: "published",
  concept: "repetition",
  objective: "Repeat instructions in C with `while`, `for` and `do while`, count correctly with `<` and `<=`, and avoid loops that never end.",
  analogy: {
    title: "Climbing a staircase",
    text: "Picture climbing a staircase to the top floor. Before every step you look up and ask: am I at the top yet? If not, you climb one step and ask again. When the answer is yes, you stop.",
    limit:
      "you can see the whole staircase and stop partway through a step if you like. A `while` or `for` loop checks its question only once per pass, before the pass starts. If the answer would change in the middle of a pass, the rest of that pass still runs. A `do while` loop is a staircase where you take the first step before you look up.",
  },
  examples: {
    count: {
      file: "c/loop_while_count",
      caption: "Counting to three",
      notes: [
        { startLine: 4, endLine: 4, text: "This is the loop's counter. It starts at 1." },
        {
          startLine: 5,
          endLine: 5,
          text: "C checks the condition before every pass. While it is true, the group in braces runs. When it is false, C skips it and moves on to line 9.",
        },
        {
          startLine: 7,
          endLine: 7,
          text: "Without this line, `count` would never change and the loop would never end. After the last pass `count` is 4, and `4 <= 3` is false.",
        },
        { startLine: 9, endLine: 9, text: "After the closing brace, so it is not part of the loop. It runs once, after the loop ends." },
      ],
    },
    ask: {
      file: "c/loop_ask",
      caption: "Repeat until the answer is right",
      notes: [
        { startLine: 6, endLine: 6, text: "The first guess is read before the loop. If it were already 7, the group would never run." },
        { startLine: 7, endLine: 7, text: "`!=` means \"not equal to\". The condition is true while the guess is wrong." },
        {
          startLine: 9,
          endLine: 9,
          text: "Runs once per wrong guess. It replaces `guess` with the next typed number, and then C checks the condition again.",
        },
        { startLine: 11, endLine: 11, text: "Runs once, after the right guess." },
      ],
    },
    for: {
      file: "c/loop_for",
      caption: "Counting with for",
      notes: [
        {
          startLine: 4,
          endLine: 4,
          text: "Three parts between the parentheses. `int number = 1` runs once, before the first pass. `number <= 3` is checked before every pass. `number++` runs after every pass.",
        },
        { startLine: 7, endLine: 7, text: "`number` does not exist here. A variable declared in the `for` line exists only inside the loop." },
      ],
    },
    sum: {
      file: "c/loop_sum",
      caption: "Adding up numbers",
      notes: [
        { startLine: 4, endLine: 4, text: "The running total starts at 0, before the loop. If this line were inside the group, `total` would be reset on every pass." },
        { startLine: 5, endLine: 5, text: "`number <= 4` includes 4, so the loop counts 1, 2, 3 and 4." },
        { startLine: 6, endLine: 6, text: "Runs once per pass. It adds the current number to `total`." },
      ],
    },
    down: {
      file: "c/loop_down",
      caption: "Counting down",
      notes: [
        { startLine: 4, endLine: 4, text: "Starts at 3, stays in the loop while `number` is 1 or more, and takes 1 away after every pass." },
      ],
    },
    dowhile: {
      file: "c/loop_do_while",
      caption: "At least one pass",
      notes: [
        { startLine: 5, endLine: 5, text: "`do` starts the group. There is no check yet." },
        { startLine: 8, endLine: 8, text: "The condition is checked after the group. 6 <= 3 is false, so the loop ends after one pass. Do not forget the semicolon at the end." },
      ],
    },
  },
  mistakes: [
    {
      title: "Stopping one number too early",
      example: {
        file: "c/loop_off_by_one",
        notes: [{ startLine: 4, endLine: 4, text: "`number < 5` is false when `number` is 5, so 5 is never printed." }],
      },
      whatHappens:
        "the program compiles and runs without any message, with every set of flags. It shows the numbers 1 to 4. `<` excludes the limit, and `<=` includes it. Being one too high or one too low is so common that it has a name: an **off-by-one error**.",
      whyEasyToMiss: "gcc cannot know what you meant, and a list of numbers ending at 4 looks reasonable unless you expected 5.",
      fix: "use `<=`, or a limit one higher.",
      fixExample: {
        file: "c/loop_off_by_one_fix",
        caption: "The fix",
        notes: [{ startLine: 4, endLine: 4, text: "`number <= 5` includes 5." }],
      },
    },
    {
      title: "A semicolon after the for line",
      example: {
        file: "c/loop_semicolon",
        notes: [
          { startLine: 4, endLine: 4, text: "The semicolon ends the `for`. The loop's group is empty, so it repeats nothing, and the braces below are not part of it." },
        ],
      },
      whatHappens:
        "gcc reports this when you compile with `-Wall`, and CodeBloom compiles with `-Wall -Wextra -Werror`, so it is an error here. With plain `gcc`, gcc says nothing and the program is made. It then runs the empty loop three times, and the braces group once afterwards.",
      howToRead:
        "\"this `for` clause does not guard... the latter\" says the next block is not controlled by the loop, although its indentation suggests it is.",
      fix: "remove the semicolon: put the group straight after the parentheses.",
      fixExample: {
        file: "c/loop_semicolon_fix",
        caption: "The fix",
        notes: [{ startLine: 4, endLine: 4, text: "The braces group now belongs to the loop, so it repeats." }],
      },
    },
    {
      title: "= instead of == in a while condition",
      example: {
        file: "c/loop_assign",
        notes: [
          { startLine: 5, endLine: 5, text: "This is not a comparison. `=` stores 3 in `count`, and the value of the assignment, 3, is not 0, so the condition is true." },
        ],
      },
      whatHappens:
        "gcc reports this when you compile with `-Wall`, and CodeBloom's `-Werror` makes it an error. With plain `gcc`, gcc says nothing, and the program is made. It then never ends: every pass stores 3 in `count` again, so `count++` cannot make the condition false.",
      howToRead:
        "\"suggest parentheses around assignment used as truth value\" means gcc found an assignment where a condition is expected. The `^~~~~` marks it.",
      fix: "`<=` compares and `=` stores: `while (count <= 3)`.",
      fixExample: {
        file: "c/loop_assign_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "`<=` compares `count` with 3, so the loop ends after `count` reaches 4." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print? Check the condition at the start of every pass.",
      example: { file: "c/practice_loop_trace", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "10\n6\n2", why: "`printf` comes after the subtraction, so the first number shown is 6, not the starting value 10." },
        {
          text: "6\n2",
          why: "C checks the condition only at the start of a pass. At the start of the last pass `count` is 2, which is more than 0, so the whole group runs, including the `printf`. The -2 is shown, and only then does the check fail.",
        },
        { text: "-2", why: "`printf` is inside the loop, so it runs on every pass, not only the last." },
      ],
      hints: ["Write down `count` after the subtraction on each pass.", "Is the condition checked after each line, or only at the start of a pass?"],
      explanation:
        "`count` goes 10, 6, 2, -2. 10, 6 and 2 are all more than 0, so three passes run, and each shows the new `count`. After the third pass `count` is -2, the check fails and the loop ends.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_loop_sum", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "10", why: "The loop starts at 0 and stops before 4, so `number` is 0, 1, 2 and 3, not 1 to 4." },
        { text: "3", why: "`total += number` adds to the old total on every pass. It does not replace the total with the latest number." },
        { text: "4", why: "4 is the limit of the loop, not the total. The program shows the sum of the numbers." },
      ],
      hints: ["List the values `number` takes. When does the loop stop?", "What is `total` after each pass?"],
      explanation: "`number` is 0, 1, 2 and 3, and `total` adds each one: 0, 1, 3, 6.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_loop_do", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "10", why: "The condition is checked after each pass. After the first pass `n` is 9, and 9 > 8 is true, so the loop runs again." },
        { text: "10\n9\n8", why: "After the second pass `n` is 8, and 8 > 8 is false, so the loop ends before 8 is shown." },
        { text: "9\n8", why: "The group runs before the first check and shows `n` before it is reduced, so the first number is 10." },
      ],
      hints: ["What is `n` when the first check happens?", "Is `n` shown before or after `n--`?"],
      explanation: "Pass 1 shows 10 and makes `n` 9, which is more than 8. Pass 2 shows 9 and makes `n` 8, which is not more than 8, so the loop ends.",
    },
  ],
  recap: [
    "A loop repeats a group of instructions. Each repeat is a pass.",
    "`while (condition) { ... }` repeats its group for as long as the condition is true. C checks the condition at the start of every pass, never in the middle of one.",
    "A `while` loop needs a starting value, a condition, and a change that moves toward false. Without the change it never ends, and gcc cannot warn about it.",
    "`for (int i = start; i <= stop; i++)` puts the start, the condition and the change in one line. `<` leaves out the limit and `<=` includes it.",
    "`do { ... } while (condition);` checks after the group, so the group runs at least once.",
    "A semicolon right after `for (...)` or `while (...)` makes the group empty, and `=` in a condition stores instead of comparing. gcc reports both with `-Wall`.",
  ],
};
