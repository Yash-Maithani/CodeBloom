import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: first-program.md. No shared concept file yet: Python's
// first lesson will share one when it is written.
export const cFirstProgram: LessonSource = {
  course: "c",
  slug: "first-program",
  title: "Your first C program",
  status: "published",
  objective: "Explain what compiling means, and write a C program that prints text with `printf`.",
  analogy: {
    title: "Translating a recipe",
    text: "Compiling is like having a recipe translated into the cook's language before the cook starts. The cook never reads your original; they follow the translation, step by step.",
    limit:
      "a human translator can guess what a sloppy sentence meant. A compiler does not guess: a missing semicolon or a misspelled word stops the translation, and you fix the source code and compile again. The translation also suits only one kind of computer: machine code made for one kind of processor and operating system (such as Windows, macOS or Linux) does not run on another.",
  },
  examples: {
    hello: {
      file: "c/first_program",
      notes: [
        {
          startLine: 1,
          endLine: 1,
          text: "`#include <stdio.h>` adds C's standard input and output tools to your program, including `printf`. `stdio` stands for standard input and output. A file ending in `.h` is a header file: it describes tools your program can use.",
        },
        {
          startLine: 3,
          endLine: 3,
          text: "Every C program starts running at `main`. `main` is a **function**: a named group of instructions. The `{` opens the group.",
        },
        {
          startLine: 4,
          endLine: 4,
          text: "`printf` prints the text between the double quotes. `\\n` is not printed: it means start a new line. The semicolon ends the instruction.",
        },
        {
          startLine: 5,
          endLine: 5,
          text: "`return 0;` ends `main` and hands back the value 0 as its result. The operating system reads 0 as: the program finished without problems.",
        },
        { startLine: 6, endLine: 6, text: "The `}` closes the group that `{` opened on line 3." },
      ],
    },
    order: {
      file: "c/print_order",
      notes: [
        {
          startLine: 4,
          endLine: 4,
          text: "No `\\n` here, so the next output continues on the same line. The space before the closing quote is printed too.",
        },
        { startLine: 5, endLine: 5, text: "This `\\n` ends the first line of output." },
        { startLine: 6, endLine: 6, text: "Runs after line 5, so its text appears on the next line." },
      ],
    },
  },
  mistakes: [
    {
      title: "Forgetting a semicolon",
      example: {
        file: "c/missing_semicolon",
        notes: [{ startLine: 4, endLine: 4, text: "The semicolon at the end of this line is missing." }],
      },
      whatHappens:
        "compilation fails, so there is no program to run. Without the semicolon, the compiler cannot tell where the `printf` instruction ends, and it notices the problem when it reaches `return` on the next line.",
      howToRead:
        "`missing_semicolon.c:4:30` means line 4, column 30: the end of line 4, where the semicolon belongs. The message says the compiler expected a semicolon before the word `return`. Under the line, gcc marks the spot with `^` and shows the `;` it expected.",
      fix: "add the semicolon, as in `printf(\"Hello, world!\\n\");`, then compile again.",
    },
    {
      title: "Forgetting the closing brace",
      example: {
        file: "c/missing_brace",
        notes: [
          { startLine: 5, endLine: 5, text: "The file ends here, but the `}` that should close `main` is missing." },
        ],
      },
      whatHappens:
        "the compiler reads to the end of the file while still inside `main`, waiting for more instructions or a `}`. \"End of input\" means the end of the file. Compilation fails, so there is no program to run.",
      howToRead:
        "line 5 is the last line the compiler read before the file ended. The real problem is what is missing after it.",
      fix: "add `}` on a new line at the end, to close the `{` from line 3. Every `{` needs a matching `}`.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print? Think about where each line of output ends.",
      example: { file: "c/practice_print", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "Good\nmorning\neveryone", why: "`printf` never starts a new line by itself. Line 4 has no `\\n`, so `morning` continues right after `Good `." },
        { text: "Good morning everyone", why: "Line 5 ends with `\\n`, which starts a new line, so `everyone` appears on the next line." },
      ],
      hints: ["Find every `\\n` in the program.", "Does `printf` start a new line on its own?"],
      explanation: "Line 4 has no `\\n`, so line 5's text continues on the same line. Line 5 ends with `\\n`, so line 6's text starts a new line.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_newline", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "A\\nB", why: "`\\n` is written as two characters in the source code, but it means one thing: start a new line. It is never printed as a backslash and an n." },
        { text: "AB", why: "The `\\n` between A and B starts a new line, so B is printed on the line below A." },
      ],
      hints: ["What does `\\n` mean inside the text of `printf`?", "How many `\\n` are there between `A` and `B`?"],
      explanation: "One `printf` can print several lines. Each `\\n` inside the text starts a new line, so `A` and `B` appear on separate lines.",
    },
    {
      kind: "choice",
      question: "You compile `first_program.c`, then change the message in the source code and run `./first_program` again without compiling. What do you see?",
      options: [
        { text: "The new message, because the computer reads the `.c` file each time.", why: "The processor runs the machine code in the program file, not the source code. Until you compile again, that file still holds the old instructions." },
        { text: "The old message.", why: "The program file only changes when you compile, so it still contains the old instructions.", correct: true },
        { text: "An error, because the source code changed.", why: "Running a program does not look at the source file, so changing it cannot cause an error at this point." },
      ],
      hints: ["Which file does `./first_program` run: the source code or the machine code?", "When does the program file change?"],
      explanation: "Compiling turns source code into a separate program file. Running uses that file, so after a change you compile again before you run.",
    },
  ],
  recap: [
    "A program is a list of instructions. You write them as source code, and C source files end in `.c`.",
    "A compiler translates source code into machine code before the program runs. This is compiling. If the compiler finds an error, compilation fails, so there is no program to run.",
    "Every C program starts at `main`. Its instructions run from top to bottom, and each ends with a semicolon.",
    "`printf` prints text, and `\\n` starts a new line. `printf` never starts a new line by itself.",
    "`return 0;` ends `main` and reports that the program finished without problems.",
  ],
};
