import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: decisions.md. Shared idea: content/concepts/decisions.md,
// written so that a later C lesson on decisions can share it.
export const pythonDecisions: LessonSource = {
  course: "python",
  slug: "decisions",
  title: "Making decisions with if and else",
  status: "published",
  concept: "decisions",
  objective: "Make a Python program choose what to do with `if` and `else`, using comparisons such as `>=` and `==`.",
  analogy: {
    title: "A fork in the road",
    text: "Picture a road that splits in two, with a sign asking a yes-or-no question. If the answer is yes, you take one branch; if no, the other. A little further on, both branches join the same road again.",
    limit:
      "a traveller can hesitate or change their mind. A program cannot: it checks the condition once, at the moment it reaches it, using the values its variables have at that moment, and the answer is always exactly true or false.",
  },
  examples: {
    compare: {
      file: "python/compare",
      notes: [
        {
          startLine: 2,
          endLine: 2,
          text: "`>=` means \"greater than or equal to\". 17 is not 18 or more, so the answer is `False`.",
        },
        { startLine: 3, endLine: 3, text: "`<` means \"less than\". 17 is less than 18, so the answer is `True`." },
        {
          startLine: 4,
          endLine: 4,
          text: "`==`, two equals signs, asks \"are these equal?\". A single `=` would give `age` a value instead; the first common mistake below shows what happens.",
        },
        {
          startLine: 5,
          endLine: 5,
          text: "A comparison gives a value of type `bool`. A `bool` has only two possible values, `True` and `False`.",
        },
      ],
    },
    vote: {
      file: "python/vote",
      notes: [
        {
          startLine: 2,
          endLine: 2,
          text: "`if`, then the condition, then a colon. Python checks the condition once. Here `age >= 18` is `False`.",
        },
        {
          startLine: 3,
          endLine: 3,
          text: "This line is **indented**: it starts with four spaces. Indented lines under `if` run only when the condition is `True`, so Python skips this one.",
        },
        {
          startLine: 4,
          endLine: 5,
          text: "`else:` means \"otherwise\". Its indented line runs whenever the `if` condition is `False`, as it is here.",
        },
      ],
    },
    fee: {
      file: "python/delivery_fee",
      notes: [
        {
          startLine: 1,
          endLine: 1,
          text: "Names can contain underscores. They make a name of two words, such as `order_total`, easy to read.",
        },
        {
          startLine: 3,
          endLine: 3,
          text: "An `if` with no `else`. When the condition is `False`, Python skips the indented lines below it.",
        },
        {
          startLine: 4,
          endLine: 5,
          text: "Both lines are indented, so both belong to the `if`. 30 is less than 50, so both run.",
        },
        {
          startLine: 6,
          endLine: 6,
          text: "Not indented, so it is not part of the `if`. It runs every time, whatever the condition was.",
        },
      ],
    },
  },
  visuals: {
    vote: {
      example: "python/vote",
      title: "Step through it: watch which lines run",
      notes: {
        1: "`age` gets the value 17.",
        2: "Python checks the condition `age >= 18`. It is `False`, because 17 is less than 18.",
        3: "Because the condition was `False`, Python skipped line 3 and ran the line under `else:`. Line 4, `else:`, is not a step of its own: it only marks where the other path starts.",
      },
      branches: { 2: false },
    },
  },
  mistakes: [
    {
      title: "Using = instead of ==",
      example: {
        file: "python/assign_in_if",
        notes: [
          { startLine: 2, endLine: 2, text: "A single `=` gives a variable a value. It cannot be used to ask a question." },
        ],
      },
      whatHappens:
        "Python stops with a `SyntaxError` before running anything, not even line 1. **Syntax** means the rules for how code must be written, and a single `=` inside an `if` condition breaks them. Notice the message has no `Traceback` line: Python found this mistake while reading the file, before the program started.",
      howToRead:
        "the first line gives the file and line number, and the `^^^^^^^^` marks the part Python could not understand. The last line suggests `==`. It also mentions `:=`, a more advanced operator that you do not need yet.",
      fix: "use two equals signs to compare, as in `if age == 18:`.",
    },
    {
      title: "Forgetting to indent",
      example: {
        file: "python/missing_indent",
        notes: [{ startLine: 3, endLine: 3, text: "This line should belong to the `if`, but it is not indented." }],
      },
      whatHappens:
        "Python stops with an `IndentationError`, again before running any line. After a line that ends in a colon, Python requires at least one indented line, so it knows what belongs to the `if`.",
      howToRead:
        "the message points at line 3 and says what Python expected: an indented block after the `if` on line 2. A **block** is a group of indented lines that belong together.",
      fix: "put four spaces at the start of line 3.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "This is the delivery program again, with a larger order. What does it print?",
      example: { file: "python/practice_fee", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "Small order: delivery costs extra\nDelivery fee: 5", why: "80 is not less than 50, so the condition is `False` and Python skips both indented lines, 4 and 5." },
        { text: "Delivery fee: 5", why: "Line 4 is indented, so it belongs to the `if` and is skipped too. `delivery_fee` keeps its starting value." },
        { text: "", why: "Line 6 is not indented, so it is not part of the `if`. It runs every time, whatever the condition was." },
      ],
      hints: ["Is 80 less than 50?", "Which lines are indented under the `if`, and which are not?"],
      explanation: "80 is not less than 50, so the condition is `False` and Python skips lines 4 and 5. `delivery_fee` keeps its starting value, 0, and line 6 runs as always.",
    },
    {
      kind: "predict-output",
      question: "What does this program print? Look closely at the two comparisons.",
      example: { file: "python/practice_compare", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "True\nTrue", why: "`>` means strictly greater than. 50 is not greater than 50, so `score > 50` is `False`. Only `>=` includes the value itself." },
        { text: "50\n50", why: "`print(score >= 50)` shows the answer to the comparison, a `bool`, not the value of `score`." },
      ],
      hints: ["What is the difference between `>=` and `>`?", "What kind of value does a comparison give?"],
      explanation: "`>=` includes the value itself, so 50 >= 50 is `True`. `>` does not, so 50 > 50 is `False`.",
    },
    {
      kind: "choice",
      question: "Which line checks whether `age` is exactly 18?",
      options: [
        { text: "`if age >= 18:`", why: "That is also true for 19, 40 or any larger age. \"Exactly 18\" needs a test for equality." },
        { text: "`if age = 18:`", why: "A single `=` gives a variable a value; it cannot ask a question. Python stops with a `SyntaxError`, as the first common mistake in this lesson shows." },
        { text: "`if age == 18:`", why: "`==` asks whether two values are equal, and the line ends with a colon.", correct: true },
        { text: "`if age == 18`", why: "Every `if` line must end with a colon. Without it, Python stops with a `SyntaxError` before running any line." },
      ],
      hints: ["Which symbol asks whether two values are equal?", "What must every `if` line end with?"],
      explanation: "`==` compares two values and gives `True` or `False`; `if condition:` then decides which lines run.",
    },
  ],
  recap: [
    "A decision lets a program choose which lines to run, based on a condition that is either true or false.",
    "In Python, comparisons such as `>=`, `<` and `==` give a `bool` value: `True` or `False`.",
    "`if condition:` runs its indented lines only when the condition is `True`. `else:` runs its indented lines when it is `False`.",
    "Indentation decides which lines belong to `if` and `else`. Lines that are not indented run every time.",
    "`==` asks whether two values are equal; `=` gives a variable a value. Using `=` in a condition is a `SyntaxError`.",
  ],
};
