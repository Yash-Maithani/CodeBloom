import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: loops.md. Shared idea: content/concepts/repetition.md.
// The infinite loop is taught in prose and in a practice question, not as an
// example, because an example that never ends cannot be verified.
export const pythonLoops: LessonSource = {
  course: "python",
  slug: "loops",
  title: "Loops: while and for",
  status: "published",
  concept: "repetition",
  objective: "Repeat instructions with `while` and `for`, use `range` correctly, and avoid loops that never end.",
  analogy: {
    title: "Climbing a staircase",
    text: "Picture climbing a staircase to the top floor. Before every step you look up and ask: am I at the top yet? If not, you climb one step and ask again. When the answer is yes, you stop.",
    limit:
      "you can see the whole staircase and stop partway through a step if you like. A loop checks its question only once per pass, before the pass starts. If the answer would change in the middle of a pass, the rest of that pass still runs.",
  },
  examples: {
    count: {
      file: "python/loop_while_count",
      caption: "Counting to three",
      notes: [
        { startLine: 1, endLine: 1, text: "This is the loop's counter. It starts at 1." },
        {
          startLine: 2,
          endLine: 2,
          text: "Python checks the condition before every pass. While it is `True`, the indented lines below run. When it is `False`, Python skips them and moves on to line 5.",
        },
        { startLine: 3, endLine: 3, text: "Part of the repeated group, because it is indented." },
        {
          startLine: 4,
          endLine: 4,
          text: "Without this line, `count` would never change and the loop would never end. After the last pass `count` is 4, and `4 <= 3` is `False`.",
        },
        { startLine: 5, endLine: 5, text: "Not indented, so it is not part of the loop. It runs once, after the loop ends." },
      ],
    },
    ask: {
      file: "python/loop_ask_again",
      caption: "Repeat until the answer is right",
      notes: [
        { startLine: 1, endLine: 1, text: "The first answer is read before the loop. If it were already `open`, the group would never run." },
        { startLine: 2, endLine: 2, text: "`!=` means \"not equal to\". The condition is true while the word is wrong." },
        {
          startLine: 3,
          endLine: 3,
          text: "Runs once per wrong answer. It replaces `word` with the next typed line, and then Python checks the condition again.",
        },
        { startLine: 4, endLine: 4, text: "Runs once, after the right word." },
      ],
    },
    range: {
      file: "python/loop_range",
      caption: "Two ranges",
      notes: [
        {
          startLine: 1,
          endLine: 1,
          text: "`range(3)` makes three numbers, starting at 0 and stopping before 3. On each pass `number` is the next one. The name `number` is your choice.",
        },
        {
          startLine: 4,
          endLine: 4,
          text: "`range(1, 4)` starts at 1 and stops before 4. It also makes three numbers. The first value is included, the last is not.",
        },
      ],
    },
    sum: {
      file: "python/loop_sum",
      caption: "Adding up numbers",
      notes: [
        { startLine: 1, endLine: 1, text: "The running total starts at 0, before the loop. If this line were inside the group, `total` would be reset on every pass." },
        { startLine: 2, endLine: 2, text: "`range(1, 5)` stops before 5." },
        { startLine: 3, endLine: 3, text: "Runs once per pass. It adds the current number to `total` and stores the result back in `total`." },
        { startLine: 4, endLine: 4, text: "Not indented, so it runs once, after the loop." },
      ],
    },
  },
  visuals: {
    count: {
      example: "python/loop_while_count",
      title: "Step through it: watch Python check the condition every pass",
      notes: {
        2: "Python checks `count <= 3`. 1 is not more than 3, so the condition is true and the group will run.",
        4: "`count` goes up by one. This is the line that eventually makes the condition false.",
        5: "Back to line 2, now with `count` at 2. Python checks the condition again at the start of every pass.",
        11: "`count` is 4, so `count <= 3` is false. Python does not run the group again and moves to line 5.",
        12: "The loop is over. This line is not indented, so it ran once.",
      },
    },
  },
  mistakes: [
    {
      title: "Expecting range to include the stop value",
      example: {
        file: "python/loop_off_by_one",
        notes: [{ startLine: 1, endLine: 1, text: "`range(1, 5)` stops before 5." }],
      },
      whatHappens:
        "the program runs without an error and shows the numbers 1 to 4. The 5 is missing because `range` never includes its stop value.",
      whyEasyToMiss: "no error message appears, and a list of numbers ending at 4 looks plausible unless you expected 5.",
      fix: "stop one number later: `range(1, 6)`.",
      fixExample: {
        file: "python/loop_off_by_one_fix",
        caption: "The fix",
        notes: [{ startLine: 1, endLine: 1, text: "`range(1, 6)` stops before 6, so 5 is included." }],
      },
    },
    {
      title: "Indenting a line that should run once",
      example: {
        file: "python/loop_done_inside",
        notes: [{ startLine: 3, endLine: 3, text: "This line is indented, so it is part of the loop and runs on every pass." }],
      },
      whatHappens:
        "the program runs without an error, but Done is shown after every number instead of once at the end. Every indented line under the `for` line repeats.",
      whyEasyToMiss: "no error message appears. Only the amount of output tells you something is wrong.",
      fix: "remove the indent from the line that should run once, so it runs after the loop ends.",
      fixExample: {
        file: "python/loop_done_after",
        caption: "The fix",
        notes: [{ startLine: 3, endLine: 3, text: "Not indented, so it runs once, after the loop." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show? Check the condition at the start of every pass.",
      example: { file: "python/practice_loop_trace", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "10\n6\n2", why: "`print` comes after the subtraction on line 3, so the first line shown is 6, not the starting value 10." },
        {
          text: "6\n2",
          why: "Python checks the condition only at the start of a pass. At the start of the last pass `count` is 2, which is more than 0, so the whole group runs, including the `print`. The -2 is shown, and only then does the check fail.",
        },
        { text: "-2", why: "`print` is inside the loop, so it runs on every pass, not only the last." },
      ],
      hints: ["Write down `count` after line 3 on each pass.", "Is the condition checked after each line, or only at the start of a pass?"],
      explanation:
        "`count` goes 10, 6, 2, -2. 10, 6 and 2 are all more than 0, so three passes run, and each shows the new `count`. After the third pass `count` is -2, the check fails and the loop ends.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_loop_sum", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "10", why: "`range(4)` starts at 0 and stops before 4. It gives 0, 1, 2 and 3, not 1 to 4." },
        { text: "3", why: "`total = total + number` adds to the old total on every pass. It does not replace the total with the latest number." },
        { text: "4", why: "4 is the stop value of `range`, not the total. The program shows the sum of the numbers." },
      ],
      hints: ["List the values `number` takes. What does `range(4)` give?", "What is `total` after each pass?"],
      explanation: "`number` is 0, 1, 2 and 3, and `total` adds each one: 0, 1, 3, 6.",
    },
    {
      kind: "choice",
      question: "A program sets `count = 1` and then runs `while count <= 3:`. The indented group only shows a message and does not touch `count`. What happens?",
      options: [
        {
          text: "The loop never ends, because `count <= 3` stays true.",
          why: "Nothing changes `count`, so Python gets the same answer every time. This is an infinite loop.",
          correct: true,
        },
        {
          text: "The loop runs three times and then stops.",
          why: "A `while` loop does not count for you. A `for` loop over `range` takes its values from the range, but with `while` you must change the variable yourself.",
        },
        {
          text: "The loop runs once, because the group has one line.",
          why: "A `while` loop repeats its whole group for as long as the condition is true. The number of lines in the group does not limit the passes.",
        },
        {
          text: "Python stops the program with an error after a few passes.",
          why: "Python does not look for infinite loops. The program keeps going until something outside stops it, such as the playground's Stop button or its time limit.",
        },
      ],
      hints: ["Does anything in the group change `count`?", "Python asks the same question on every pass. Can the answer ever become false?"],
      explanation:
        "The condition depends on `count`, and `count` never changes, so the condition is true on every check. A `while` loop needs a line inside its group that moves the condition toward `False`.",
    },
  ],
  recap: [
    "A loop repeats a group of instructions. Each repeat is a pass.",
    "`while condition:` repeats its group for as long as the condition is true. Python checks the condition at the start of every pass, never in the middle of one.",
    "A `while` loop needs a starting value, a condition, and a change that moves toward `False`. Without the change it never ends, and Python itself never stops it.",
    "`for name in range(start, stop):` runs once per number, starting at `start` and stopping before `stop`. `range(stop)` starts at 0.",
    "Use `for` when you know the values and `while` when you repeat until something happens.",
    "The indented lines under a loop line repeat. The first line that is not indented runs once, after the loop.",
  ],
};
