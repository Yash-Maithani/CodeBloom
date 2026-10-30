import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: printf-scanf.md. Shared idea: content/concepts/input-output.md,
// which the Python lesson uses too. Examples that read input have a name.input.txt next
// to them. A compiled C program does not echo what it reads, so the recorded output
// holds only what it printed, and the page shows the typed lines in a Typed input panel.
// Wrong placeholders and a missing & are undefined behavior: they appear here only as
// the compiler's report (an error with CodeBloom's -Werror), never as a program that runs.
export const cPrintfScanf: LessonSource = {
  course: "c",
  slug: "printf-scanf",
  title: "Printing and reading values with printf and scanf",
  status: "published",
  concept: "input-output",
  objective: "Print several values with one `printf`, read numbers that a person types with `scanf`, and know what `scanf` returns when the input is wrong.",
  analogy: {
    title: "A form with labelled boxes",
    text: "A form has boxes, and each box has a label for the kind of answer it takes. `scanf` is like a clerk who copies the typed answer into the box you point to.",
    limit:
      "a clerk would tell you when the answer does not fit the box. `scanf` stores nothing, leaves the box as it was, and tells you only through the number it returns. And you must point at the box yourself, with `&`.",
  },
  examples: {
    printf: {
      file: "c/io_printf",
      caption: "Several placeholders",
      notes: [
        {
          startLine: 6,
          endLine: 6,
          text: "The placeholders are filled in order: `%d` with `apples`, then `%.2f` with the calculation. A whole number times a decimal number gives a decimal number.",
        },
      ],
    },
    age: {
      file: "c/io_age",
      caption: "Asking for an age",
      notes: [
        { startLine: 4, endLine: 4, text: "`age` starts at 0, so it always has a value." },
        { startLine: 5, endLine: 5, text: "A prompt. It has no `\\n`, so the typing would appear right after it on a terminal." },
        { startLine: 6, endLine: 6, text: "`scanf` waits for a line, reads a whole number from it and stores it in `age`. The `&` is required." },
        { startLine: 7, endLine: 7, text: "The 17 is not in the output: the person typed it, and the program did not print it." },
      ],
    },
    sum: {
      file: "c/io_sum",
      caption: "Two numbers on two lines",
      notes: [{ startLine: 6, endLine: 7, text: "Each call reads the next number. The line break between the typed lines is skipped." }],
    },
    double: {
      file: "c/io_double",
      caption: "Reading a decimal number",
      notes: [{ startLine: 6, endLine: 6, text: "`%lf` is what `scanf` uses for a `double`. `printf` uses `%f`, but `scanf` needs the `l`." }],
    },
    count: {
      file: "c/io_count",
      caption: "The returned value",
      notes: [{ startLine: 5, endLine: 5, text: "`scanf` is a function call that gives back a value, here the number of values it stored." }],
    },
  },
  mistakes: [
    {
      title: "Leaving out the &",
      example: {
        file: "c/io_no_amp",
        notes: [{ startLine: 5, endLine: 5, text: "The second argument is the value of `age`. `scanf` needs where `age` lives." }],
      },
      whatHappens:
        "gcc stops with an error, so no program is made. gcc reports this problem when you compile with `-Wall`, and CodeBloom compiles with `-Wall -Wextra -Werror`: `-Werror` turns every warning into an error. Without `-Werror` the report is only a warning, and the program is still made. On some systems, such as Ubuntu, gcc prints the warning even without `-Wall`, but not on every system. Running a program like this is undefined behavior: C does not say what happens, and it may crash.",
      howToRead:
        "the message says `%d` expects an argument of type `int *`, an address of an `int`. `int *` is the type \"pointer to `int`\": an address of an `int`, which the Pointers lesson explains later. It then says that argument 2 has type `int`: the second item in the call is the `int` itself, so the `&` is missing.",
      fix: "write `&age`.",
      fixExample: {
        file: "c/io_no_amp_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "`&age` gives `scanf` the place where `age` lives." }],
      },
    },
    {
      title: "Using %f to read a double",
      example: {
        file: "c/io_wrong_format",
        notes: [{ startLine: 5, endLine: 5, text: "`%f` in `scanf` is for a `float`, a smaller decimal type. `price` is a `double`." }],
      },
      whatHappens:
        "the same as the first mistake. gcc reports it with `-Wall`, CodeBloom's `-Werror` makes it an error, and a program made without `-Werror` has undefined behavior. It may crash, give wrong numbers, or seem to work until it matters.",
      howToRead:
        "gcc says what the placeholder expects, a `float *`, and what it was given, a `double *`. The lines under the code suggest `%lf`.",
      fix: "use `%lf` in `scanf` for a `double`.",
      fixExample: {
        file: "c/io_wrong_format_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "`%lf` matches a `double`." }],
      },
    },
    {
      title: "Typing something that is not a number",
      example: {
        file: "c/io_bad_input",
        notes: [
          { startLine: 6, endLine: 6, text: "`scanf` cannot read a whole number from `abc`. It stores nothing and returns 0, and this program ignores that." },
        ],
      },
      whatHappens:
        "the program runs without an error. `number` keeps its starting value, 0, so the program carries on as if the person had typed 0.",
      whyEasyToMiss:
        "nothing is printed to say the input was wrong. Only the value that `scanf` returns tells you, and a program that ignores it never finds out.",
      fix: "check what `scanf` returned before you use the number. The next lesson, Making decisions with if and else, ends with an example that does this.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_io_printf", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "4 x 2.5 = 10", why: "`%.1f` always shows one digit after the decimal point, so 10 is shown as 10.0." },
        { text: "%d x %.1f = %.1f", why: "`printf` replaces each placeholder with a value, so the placeholders never appear in the output." },
        { text: "2.5 x 4 = 10.0", why: "Placeholders are filled in order. The first one, `%d`, gets `a`, which is 4." },
      ],
      hints: ["Which value goes into the first placeholder?", "How many digits does `%.1f` show after the point?"],
      explanation: "`a`, `b` and `a * b` fill the three placeholders in order, and `%.1f` shows 10 as 10.0.",
    },
    {
      kind: "choice",
      question: "`price` is a `double`. Which call reads a decimal number into it?",
      options: [
        { text: "`scanf(\"%lf\", &price);`", why: "`%lf` is the placeholder `scanf` uses for a `double`, and `&price` says where to store it.", correct: true },
        {
          text: "`scanf(\"%f\", &price);`",
          why: "In `scanf`, `%f` is for a `float`, not a `double`. gcc reports it with `-Wall`, and CodeBloom's flags make it an error, as in the second mistake.",
        },
        { text: "`scanf(\"%lf\", price);`", why: "The `&` is missing. `scanf` needs where `price` lives, as in the first mistake." },
      ],
      hints: ["Does `scanf` use the same placeholder as `printf` for a `double`?", "Does the second argument need an `&`?"],
      explanation: "`scanf` needs both the right placeholder, `%lf`, and the address of the variable, `&price`.",
    },
    {
      kind: "choice",
      question: "A program has `int n = 5;` and runs `scanf(\"%d\", &n);`, but the person types `hello`. What is `n` afterwards?",
      options: [
        {
          text: "5, because `scanf` stores nothing when it cannot read a number.",
          why: "`scanf` leaves the variable as it was, and returns 0 to say that it stored nothing, as in the third mistake.",
          correct: true,
        },
        { text: "0, because `scanf` stores zero for text.", why: "`scanf` never makes up a number. Without a number to store, the variable keeps its value." },
        { text: "The program stops with an error.", why: "`scanf` does not stop the program. It reports the failure only through the value it returns." },
      ],
      hints: ["Can `scanf` read a whole number from `hello`?", "What did the third mistake do with the starting value?"],
      explanation: "`scanf` stores a value only when it can read one, so `n` is still 5 and the call returned 0.",
    },
  ],
  recap: [
    "One `printf` can print several values. Use one placeholder for each value, in order, matching its type.",
    "`scanf(\"%d\", &x)` reads a whole number into `x`. `scanf(\"%lf\", &y)` reads a decimal number into a `double`. The `&` is required.",
    "`printf` uses `%f` for a `double`, but `scanf` needs `%lf`.",
    "Give a variable a starting value before you pass it to `scanf`.",
    "`scanf` returns how many values it stored. On bad input it stores nothing and leaves the variable as it was.",
    "A wrong placeholder or a missing `&` is undefined behavior. gcc reports it when you compile with `-Wall`, and CodeBloom's flags turn that report into an error.",
  ],
};
