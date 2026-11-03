import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: files.md. Shared idea: content/concepts/files.md, which the
// Python lesson uses too. Every example writes the file it reads and runs in the runner's
// temporary folder, which is deleted afterwards. Using a NULL FILE * and passing fgets a
// size bigger than the array are undefined behavior, so they are taught in prose and a
// choice question, never as examples that run. The three mistakes compile and run with
// every flag; the second one shows behavior of glibc's buffering (not undefined, but not
// promised by C), and the lesson says so.
export const cFiles: LessonSource = {
  course: "c",
  slug: "files",
  title: "Reading and writing files with fopen",
  status: "published",
  concept: "files",
  objective:
    "Write text to a file and read it back with `fopen`, `fprintf`, `fgets` and `fclose`, check that a file opened, and avoid overwriting or losing text by mistake.",
  analogy: {
    title: "A notebook",
    text: "A notebook stays on the shelf when you are not using it. To use it, you open it, write in it or read what is there, and close it.",
    limit:
      "you can flip to any page of a notebook. The programs in this lesson read a file from its start to its end. Opening a file with `\"w\"` is like tearing out every page first. A C program also has to check that the notebook opened, and the text it writes may wait in memory before it reaches the file, until the file is closed.",
  },
  examples: {
    write: {
      file: "c/file_write_read",
      caption: "Write a file, then read it back",
      notes: [
        { startLine: 4, endLine: 4, text: "`file` is a pointer to the open file. `\"w\"` creates `notes.txt`, or empties it if it exists." },
        {
          startLine: 5,
          endLine: 8,
          text: "`fopen` gives back `NULL` when it cannot open the file. Checking first keeps the program from using it. `return 1` tells the system there was a problem.",
        },
        { startLine: 9, endLine: 9, text: "Like `printf`, but into the file. The `\\n` ends the line, because `fprintf` adds nothing." },
        { startLine: 10, endLine: 10, text: "Closes the file, so the text is in it before it is opened again." },
        { startLine: 12, endLine: 12, text: "The same variable opens the same file again, now for reading." },
        { startLine: 17, endLine: 17, text: "A buffer of 50 items." },
        { startLine: 18, endLine: 18, text: "Reads one line, at most 49 characters and the terminator. It gives back `NULL` if nothing could be read." },
        { startLine: 19, endLine: 19, text: "The line still ends with its line break, so the format has no `\\n`." },
      ],
    },
    missing: {
      file: "c/file_missing",
      caption: "A file that does not exist",
      notes: [
        { startLine: 4, endLine: 4, text: "`\"r\"` does not create a file, and nothing in this program creates `missing.txt`." },
        { startLine: 5, endLine: 6, text: "`fopen` gave back `NULL`, so the program says so instead of using the file." },
        { startLine: 8, endLine: 9, text: "This branch only runs when the file opened. There is nothing to close otherwise." },
      ],
    },
    lines: {
      file: "c/file_lines",
      caption: "One line at a time",
      notes: [
        { startLine: 8, endLine: 10, text: "Each `fprintf` writes one line, ending with `\\n`." },
        { startLine: 18, endLine: 18, text: "Runs once for each line. `fgets` gives back `NULL` after the last one." },
        { startLine: 19, endLine: 19, text: "The brackets show where `line` ends. The closing bracket is on the next line, because the line break is part of `line`." },
      ],
    },
    smallbuffer: {
      file: "c/file_small_buffer",
      caption: "A buffer that is too small",
      notes: [
        { startLine: 8, endLine: 8, text: "One line of seven letters and a line break." },
        { startLine: 15, endLine: 15, text: "Five items: room for four characters and the terminator." },
        {
          startLine: 16,
          endLine: 16,
          text: "The first call reads `abcd` and stops because the buffer is full. There is no line break in it, so the line was cut. The second call reads `efg` and the line break.",
        },
      ],
    },
    strip: {
      file: "c/file_strip",
      caption: "Removing the newline",
      notes: [
        { startLine: 19, endLine: 19, text: "`strlen` counts the characters before the terminator, including the line break." },
        {
          startLine: 20,
          endLine: 22,
          text: "If the last character is a line break, replace it with the terminator. The test also covers a last line that has none.",
        },
        { startLine: 23, endLine: 23, text: "The brackets now wrap only the text." },
      ],
    },
    numbers: {
      file: "c/file_numbers",
      caption: "Adding up numbers from a file",
      notes: [
        { startLine: 20, endLine: 20, text: "A starting value, in case the line holds no number." },
        {
          startLine: 21,
          endLine: 21,
          text: "`sscanf` reads a number from the text in `line`. It gives back 1 when it stored one. The line break after the digits does not matter.",
        },
        { startLine: 26, endLine: 26, text: "Not inside the loop, so it runs once, after the file is read." },
      ],
    },
    append: {
      file: "c/file_append",
      caption: "Append mode",
      notes: [
        { startLine: 11, endLine: 11, text: "`\"a\"` adds to the end of the file. Ada is still there." },
        { startLine: 24, endLine: 24, text: "The line break is part of each line, so there is no `\\n` in the format." },
      ],
    },
  },
  mistakes: [
    {
      title: "Opening with \"w\" when you meant \"a\"",
      example: {
        file: "c/file_overwrite",
        notes: [{ startLine: 11, endLine: 11, text: "`\"w\"` empties the file again before writing, so `first` is lost." }],
      },
      whatHappens:
        "the program compiles and runs without any message, with every set of flags, and the file holds only second. Opening a file with `\"w\"` starts from an empty file every time.",
      whyEasyToMiss: "no message appears, and the file looks fine afterwards. You only notice that the old text is gone.",
      fix: "open with `\"a\"` when you want to keep what is there and add to it.",
      fixExample: {
        file: "c/file_overwrite_fix",
        caption: "The fix",
        notes: [{ startLine: 11, endLine: 11, text: "`\"a\"` keeps `first` and adds `second` after it." }],
      },
    },
    {
      title: "Reading a file before closing it",
      example: {
        file: "c/file_no_close",
        notes: [
          { startLine: 8, endLine: 8, text: "The text goes into a buffer in memory. It has not reached the file yet." },
          { startLine: 10, endLine: 10, text: "Opens the file while `out` is still open and unflushed." },
        ],
      },
      whatHappens:
        "the program compiles and runs without any message from `-Wall -Wextra`. In CodeBloom's tests with gcc 13.3 on Linux, the read found nothing, because the text was still waiting in memory. C does not promise this result or the opposite: when text reaches the file before the close is not defined by the rules of C. C does guarantee that returning from `main` flushes and closes every open file, so the text would still reach the file when this program ends.",
      whyEasyToMiss: "the file is full after the program ends, so looking at it afterwards shows nothing wrong.",
      fix: "close the file before you open it again, or call `fflush(out)` to send the buffer.",
      fixExample: {
        file: "c/file_no_close_fix",
        caption: "The fix",
        notes: [{ startLine: 9, endLine: 9, text: "Closing sends the text to the file, so the read on the next lines finds it." }],
      },
    },
    {
      title: "Comparing a line without removing its newline",
      example: {
        file: "c/file_newline_compare",
        notes: [{ startLine: 20, endLine: 20, text: "`line` holds `bread` followed by a line break, so it is not equal to `\"bread\"`." }],
      },
      whatHappens:
        "the program compiles and runs without any message, with every set of flags. `strcmp` gives a number that is not 0, so the program reports that the line is missing.",
      whyEasyToMiss: "the file does contain the word. Printing the line shows it, and the line break is invisible.",
      fix: "remove the line break before comparing, as in the earlier example.",
      fixExample: {
        file: "c/file_newline_compare_fix",
        caption: "The fix",
        notes: [
          { startLine: 20, endLine: 23, text: "Replaces the line break with the terminator." },
          { startLine: 24, endLine: 24, text: "Now `line` is exactly `bread`." },
        ],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_file_modes", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "1", why: "`\"a\"` adds to the end of the file. It does not replace what is already there." },
        { text: "2", why: "The loop reads every line in the file, including the one added with `\"a\"`. The file holds three lines." },
      ],
      hints: ["What does opening with `\"a\"` do to the text already in the file?", "How many lines does the file hold when it is read?"],
      explanation: "Two lines are written, one more is appended, and the loop counts all three.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_file_buffer", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        {
          text: "[hello\n]",
          why: "`part` has 4 items, so `fgets` stores at most 3 characters and the terminator. Six characters cannot arrive in one call.",
        },
        { text: "[hell]\n[o\n]", why: "`sizeof part` is 4, and `fgets` keeps one item for the terminator, so it reads 3 characters, not 4." },
        {
          text: "[hel]\n[lo]",
          why: "The second `fgets` reads `lo` and the line break, and it keeps the line break, so the closing bracket is on its own line.",
        },
      ],
      hints: ["How many characters can `fgets` store in an array of 4 items?", "Is the line break kept when the line is cut?"],
      explanation: "The first call stores `hel` and the terminator. The second stores `lo` and the line break.",
    },
    {
      kind: "choice",
      question:
        "A program runs `FILE *file = fopen(\"data.txt\", \"r\");` for a file that does not exist, and then calls `fgets(line, sizeof line, file)` without checking `file`. What does C guarantee?",
      options: [
        {
          text: "Nothing. `fopen` gave back `NULL`, and passing `NULL` to `fgets` is undefined behavior.",
          why: "C does not check the pointer. In CodeBloom's test the program stopped with a segmentation fault, but C does not promise that.",
          correct: true,
        },
        {
          text: "`fopen` created an empty `data.txt`, so `fgets` finds nothing and gives back `NULL`.",
          why: "Only `\"w\"` and `\"a\"` create a file. `\"r\"` gives back `NULL` instead.",
        },
        {
          text: "`fgets` notices the `NULL` and gives back `NULL`.",
          why: "`fgets` is not required to check its file argument. Check `fopen`'s result yourself, before any other call.",
        },
      ],
      hints: ["Does `\"r\"` create a missing file?", "Who checks the pointer: the library, or your program?"],
      explanation: "Check `file == NULL` right after `fopen`.",
    },
  ],
  recap: [
    "`fopen(name, mode)` gives back a `FILE *`. The modes are `\"r\"` to read, `\"w\"` to write and `\"a\"` to append. Close the file with `fclose`.",
    "Check the result of `fopen` for `NULL` before you use it. Using a `NULL` file is undefined behavior.",
    "`\"w\"` creates the file, or empties it if it is there. `\"a\"` keeps what is there and adds at the end.",
    "`fprintf(file, ...)` writes like `printf`. End each line with `\\n`.",
    "`fgets(line, sizeof line, file)` reads one line, at most one fewer than the size, and gives back `NULL` at the end. It keeps the line break.",
    "Everything read from a file is text. `sscanf` converts a number from a line.",
    "`fprintf` writes into a buffer first. `fclose` (or `fflush`) sends it. Close a file before you read it back, and close each file as soon as you are done.",
  ],
};
