import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: strings.md. Shared idea: content/concepts/text.md.
export const pythonStrings: LessonSource = {
  course: "python",
  slug: "strings",
  title: "Strings",
  status: "published",
  concept: "text",
  objective: "Work with text in Python: count its characters, pick one out by position, join and transform strings with methods, and build messages with f-strings.",
  analogy: {
    title: "A string of beads",
    text: "Picture a string of beads, each bead one character, laid out in order. You can count the beads, point at the bead in one position, or thread two strings together to make a longer one.",
    limit:
      "real beads can be swapped or re-threaded. A Python string cannot be changed after it is made. Every change produces a new string, and the old one stays as it was.",
  },
  examples: {
    basics: {
      file: "python/str_basics",
      caption: "Length and positions",
      notes: [
        { startLine: 2, endLine: 2, text: "`len` counts the characters of the string." },
        { startLine: 3, endLine: 3, text: "Index 0 is the first character." },
        { startLine: 4, endLine: 4, text: "The last index is one less than the length, as with a list." },
      ],
    },
    join: {
      file: "python/str_join",
      caption: "Joining strings",
      notes: [
        { startLine: 3, endLine: 3, text: "The middle piece is a string holding one space. Without it the names would run together." },
        { startLine: 5, endLine: 5, text: "The space counts as a character." },
      ],
    },
    fstring: {
      file: "python/str_fstring",
      caption: "An f-string",
      notes: [
        {
          startLine: 3,
          endLine: 3,
          text: "The `f` before the quote makes it an f-string. `{name}` and `{age}` are replaced by the values of those variables. `age` is a number, and no conversion is needed.",
        },
        { startLine: 4, endLine: 4, text: "Anything that works as a value can go inside the brackets, including a calculation." },
      ],
    },
    escape: {
      file: "python/str_escape",
      caption: "Two escape sequences",
      notes: [
        { startLine: 1, endLine: 1, text: "`\\n` starts a new line, so one `print` shows two lines." },
        { startLine: 2, endLine: 2, text: "Each `\\\"` puts a quote mark in the text without ending the string. The backslashes are not shown." },
      ],
    },
    strip: {
      file: "python/str_strip",
      caption: "Trimming the ends",
      notes: [
        { startLine: 1, endLine: 1, text: "Two spaces before the word and two after." },
        { startLine: 3, endLine: 3, text: "`strip()` gives back a new string without the spaces at the ends. `text` itself is unchanged." },
      ],
    },
    methods: {
      file: "python/str_methods",
      caption: "Changing case and replacing",
      notes: [
        { startLine: 4, endLine: 4, text: "`replace` gives back a new string with every `\"Ada\"` swapped for `\"Augusta\"`." },
        { startLine: 5, endLine: 5, text: "`name` is still the original string." },
      ],
    },
    in: {
      file: "python/str_in",
      caption: "Is it part of the text?",
      notes: [{ startLine: 2, endLine: 2, text: "`\"@\" in email` is `True` when an `@` appears anywhere in `email`." }],
    },
    split: {
      file: "python/str_split",
      caption: "Splitting at commas",
      notes: [
        { startLine: 2, endLine: 2, text: "`split(\",\")` cuts the string at every comma and gives back a list of the pieces. The commas are not in the pieces." },
        { startLine: 4, endLine: 4, text: "A `for` loop over the list from `split`." },
      ],
    },
  },
  mistakes: [
    {
      title: "Trying to change one character",
      example: {
        file: "python/str_immutable",
        notes: [{ startLine: 2, endLine: 2, text: "Reading `word[0]` is fine, but assigning to it is not." }],
      },
      whatHappens:
        "Python stops with a `TypeError` on line 2. A string cannot be changed after it is made, so you cannot write to one of its positions.",
      howToRead:
        "the last line says a `str` object does not support item assignment. `str` is Python's name for the string type, and item assignment means writing `word[0] = ...`.",
      fix: "make a new string and store it: `word = word.replace(\"c\", \"b\")`.",
      fixExample: {
        file: "python/str_immutable_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "`replace` gives back a new string, and the assignment stores it in `word`." }],
      },
    },
    {
      title: "Expecting a method to change the string",
      example: {
        file: "python/str_no_store",
        notes: [{ startLine: 2, endLine: 2, text: "`upper()` gives back a new string, but nothing stores it, so it is thrown away." }],
      },
      whatHappens: "the program runs without an error, but it shows ada, not ADA. The call on line 2 worked, and its result was thrown away.",
      whyEasyToMiss: "no error message appears, and `upper` sounds as if it changes `name`.",
      fix: "store the result: `name = name.upper()`.",
      fixExample: {
        file: "python/str_no_store_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "The new string is stored in `name`." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_str_upper", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "PYTHON\nPYTHON", why: "`upper` gives back a new string. It does not change `title`, so the second `print` shows the original." },
        { text: "python\npython", why: "`print(title.upper())` shows the new upper-case string. Only `title` itself is unchanged." },
      ],
      hints: ["Does calling `title.upper()` change `title`?", "What does each `print` show: the new string or the name?"],
      explanation: "Line 2 shows the new string that `upper()` gives back. Line 3 shows `title`, which has not changed.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_str_split", notes: [] },
      correctPosition: 1,
      wrongOutputs: [
        { text: "14\ngreen", why: "`len(parts)` is the length of the list of pieces, not of the original text. `split` made three pieces." },
        { text: "3\nred", why: "Indexes start at 0. `parts[0]` is red, and `parts[1]` is the second piece, green." },
      ],
      hints: ["How many pieces does `split` make?", "Which piece has index 1?"],
      explanation: "`split(\",\")` makes the list red, green, blue. Its length is 3, and index 1 is the second item.",
    },
    {
      kind: "choice",
      question: "A program has `word = \"cat\"`. Which line makes `word` refer to the string \"CAT\"?",
      options: [
        { text: "`word = word.upper()`", why: "`upper()` gives back a new string, and the assignment stores it in `word`.", correct: true },
        { text: "`word.upper()`", why: "This gives back \"CAT\" but nothing stores it. `word` is unchanged, as in the second mistake above." },
        { text: "`print(word.upper())`", why: "This shows CAT on the screen, but `word` still refers to \"cat\"." },
      ],
      hints: ["Which line stores the new string?", "Does `upper()` change the string it is called on?"],
      explanation: "Methods give back new strings. A name only changes when you assign to it.",
    },
  ],
  recap: [
    "A string is a sequence of characters. `len` counts them and indexes start at 0.",
    "`+` joins strings. An f-string puts values and calculations into text: `f\"{name} is {age}\"`.",
    "`\\n` is a line break and `\\\"` is a quote mark inside a string.",
    "Methods such as `strip`, `upper`, `lower` and `replace` give back new strings. Store the result if you want to keep it.",
    "A string cannot be changed in place: `word[0] = \"b\"` is an error.",
    "`in` asks whether one string is part of another. `split` turns a string into a list of pieces.",
  ],
};
