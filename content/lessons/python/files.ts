import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: files.md. Shared idea: content/concepts/files.md.
// Every example writes the file it reads, so it runs on its own. The runner runs
// each example in a temporary folder that is deleted afterwards, and the
// playground gives every run a fresh in-memory file area.
export const pythonFiles: LessonSource = {
  course: "python",
  slug: "files",
  title: "Reading and writing files",
  status: "published",
  concept: "files",
  objective: "Write text to a file and read it back, go through a file line by line, and avoid overwriting a file by mistake.",
  analogy: {
    title: "A notebook",
    text: "A notebook stays on the shelf when you are not using it. To use it, you open it, write in it or read what is there, and close it.",
    limit:
      "you can flip to any page of a notebook. The programs in this lesson read a file from its start to its end. Opening a file to write with `\"w\"` is like tearing out every page first: whatever was in it is gone. And a program has to close the file, which `with` does for you.",
  },
  examples: {
    write: {
      file: "python/file_write_read",
      caption: "Write a file, then read it",
      notes: [
        { startLine: 1, endLine: 1, text: "Opens `notes.txt` for writing and creates it. The file is closed when the indented group ends." },
        { startLine: 2, endLine: 3, text: "`write` puts text into the file. Unlike `print`, it adds no line break, so each line ends with `\\n`." },
        { startLine: 5, endLine: 5, text: "Opens the same file for reading. `\"r\"` is the default mode, so `open(\"notes.txt\")` means the same." },
        { startLine: 6, endLine: 6, text: "`read()` gives back the whole file as one string, including its line breaks." },
        { startLine: 8, endLine: 8, text: "`strip()` removes the line break at the end, so `print` does not add an empty line after the text." },
      ],
    },
    lines: {
      file: "python/file_lines",
      caption: "One line at a time",
      notes: [
        { startLine: 7, endLine: 7, text: "`line` is the next line of the file, with its line break at the end." },
        { startLine: 8, endLine: 8, text: "`strip()` removes that line break, so `print` shows only the word." },
      ],
    },
    numbers: {
      file: "python/file_numbers",
      caption: "Adding up numbers from a file",
      notes: [
        {
          startLine: 9,
          endLine: 9,
          text: "`line` is text such as 70 followed by a line break. `int` accepts a line break around the number, so no `strip()` is needed here. The result is added to `total`.",
        },
        { startLine: 10, endLine: 10, text: "Not indented, so it runs once, after the file is read." },
      ],
    },
    append: {
      file: "python/file_append",
      caption: "Append mode",
      notes: [{ startLine: 4, endLine: 4, text: "`\"a\"` adds to the end of the file. Ada is still there." }],
    },
  },
  mistakes: [
    {
      title: "Opening with \"w\" when you meant \"a\"",
      example: {
        file: "python/file_overwrite",
        notes: [{ startLine: 4, endLine: 4, text: "`\"w\"` again empties the file before writing, so `first` is lost." }],
      },
      whatHappens: "the program runs without an error, but the file holds only second. Opening a file with `\"w\"` starts from an empty file every time.",
      whyEasyToMiss: "no error message appears, and the file looks fine afterwards. You only notice that the old text is gone.",
      fix: "open with `\"a\"` when you want to keep what is there and add to it.",
      fixExample: {
        file: "python/file_overwrite_fix",
        caption: "The fix",
        notes: [{ startLine: 4, endLine: 4, text: "`\"a\"` keeps `first` and adds `second` after it." }],
      },
    },
    {
      title: "Reading a file that does not exist",
      example: {
        file: "python/file_missing",
        notes: [{ startLine: 1, endLine: 1, text: "Nothing in this program creates `greeting.txt`, and `\"r\"` does not create a file." }],
      },
      whatHappens:
        "Python stops with a `FileNotFoundError` on line 1, before anything is shown. Opening a file to read it needs the file to exist.",
      howToRead:
        "the last line says there is no such file and gives its name. The number after `Errno` is a code from the operating system, and it can differ between systems: the CodeBloom playground, which runs Python in the browser, shows `Errno 44` for the same mistake.",
      whyEasyToMiss: "a small typo in the name, or running a program from another folder, gives the same error.",
      fix: "write the file first, or check the name and the folder.",
      fixExample: {
        file: "python/file_missing_fix",
        caption: "The fix",
        notes: [{ startLine: 1, endLine: 1, text: "Opening with `\"w\"` creates `greeting.txt`, so the read on line 4 finds it." }],
      },
    },
    {
      title: "Forgetting the line break",
      example: {
        file: "python/file_no_newline",
        notes: [{ startLine: 2, endLine: 3, text: "No `\\n`, so the two words run together in the file." }],
      },
      whatHappens: "the program runs without an error, but the file holds milkbread on one line. `write` adds no line break. Only the `\\n` you write does.",
      whyEasyToMiss: "`print` adds a line break by itself, so it is natural to expect `write` to do the same.",
      fix: "end each line with `\\n`.",
      fixExample: {
        file: "python/file_newline_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 3, text: "Each line ends with `\\n`, so the words are on separate lines." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_file_modes", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "1", why: "`\"a\"` adds to the file. It does not replace what is already there." },
        { text: "2", why: "The loop reads every line in the file, including the one added with `\"a\"`. The file holds three lines." },
      ],
      hints: ["What does opening with `\"a\"` do to the text already in the file?", "How many lines does the file hold when it is read?"],
      explanation: "Two lines are written, one more is appended, and the loop counts all three.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_file_text", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        {
          text: "9",
          why: "`line.strip()` is still text, and `total` starts as an empty string. `+` between strings joins them, so 4 and 5 become 45. Only `int` would make `+` add.",
        },
        { text: "5", why: "`total = total + line.strip()` keeps the old total and joins the new line onto it. It does not replace it." },
      ],
      hints: ["Is `line.strip()` a number or text?", "What does `+` do between two strings?"],
      explanation: "Both lines are text, so `+` joins them: an empty string, then 4, then 5.",
    },
    {
      kind: "choice",
      question: "A program opens a file with `\"w\"` and runs `file.write(\"milk\")` and then `file.write(\"bread\")`. What does the file hold?",
      options: [
        { text: "milkbread on a single line.", why: "`write` adds no line break, so the second text follows the first, as in the third mistake above.", correct: true },
        { text: "milk and bread on two lines.", why: "`print` adds a line break, but `write` does not. You must write `\\n` yourself." },
        {
          text: "Only bread, because the second write replaces the first.",
          why: "Both writes happen while the file stays open, so the second adds to the first. Only opening the file again with `\"w\"` empties it.",
        },
      ],
      hints: ["Does `write` add a line break by itself?", "Is the file opened once or twice?"],
      explanation: "The file is opened once, and each write adds to the end of what is already there. Without `\\n` the words join.",
    },
  ],
  recap: [
    "`with open(name, mode) as file:` opens a file and closes it when the indented group ends. The modes are `\"r\"` to read (the default), `\"w\"` to write and `\"a\"` to append.",
    "`\"w\"` creates the file, or empties it if it is there. `\"a\"` keeps what is there and adds at the end.",
    "`file.write(text)` adds no line break. End each line with `\\n`.",
    "`file.read()` gives the whole file as one string. A `for` loop over a file gives one line at a time, with its line break.",
    "`strip()` removes the line break from the end of a line.",
    "Everything read from a file is text. Convert numbers with `int`.",
    "Opening a file that does not exist for reading is a `FileNotFoundError`.",
  ],
};
