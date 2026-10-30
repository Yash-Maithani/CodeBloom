import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: strings.md. Shared idea: content/concepts/text.md, which the
// Python lesson uses too. A missing terminator, a scanf("%s") without a width and a
// strcpy into a too-small array are undefined behavior, so they are taught in prose and a
// choice question, never as examples that run. The three mistakes are gcc reports: == on
// two arrays is a -Wall warning (-Warray-compare) that CodeBloom's -Werror makes an error;
// = on arrays is an error with every flag; "A" for a char is a gcc 13 default warning
// (-Wint-conversion) that -Werror makes an error.
export const cStrings: LessonSource = {
  course: "c",
  slug: "strings",
  title: "Strings",
  status: "published",
  concept: "text",
  objective:
    "Store text in a `char` array, explain the terminator, read a word safely with `scanf`, and compare and copy strings with `strcmp` and `strcpy`.",
  analogy: {
    title: "A string of beads",
    text: "Picture a string of beads, each bead one character, laid out in order. At the end there is one special bead that means \"the string stops here\".",
    limit:
      "in C the end bead is a real item in the array, with the value 0, and it needs room. C has no separate string type, and you cannot join or compare two strings with `+` or `==`. You use functions.",
  },
  examples: {
    codes: {
      file: "c/str_codes",
      caption: "Characters are numbers",
      notes: [
        { startLine: 4, endLine: 4, text: "`%d` shows the number stored for `'A'`." },
        { startLine: 5, endLine: 5, text: "`%c` shows the character with number 66." },
        { startLine: 6, endLine: 6, text: "`'A' + 2` is 67, the character after `'B'`." },
      ],
    },
    basics: {
      file: "c/str_basics",
      caption: "A string is an array of characters",
      notes: [
        { startLine: 4, endLine: 4, text: "C counts the characters and adds the terminator, so `word` has four items." },
        { startLine: 5, endLine: 5, text: "`%s` prints characters until it meets the terminator." },
        { startLine: 6, endLine: 6, text: "Index 0 is the first character, as in any array." },
      ],
    },
    length: {
      file: "c/str_length",
      caption: "strlen and sizeof",
      notes: [
        { startLine: 2, endLine: 2, text: "`<string.h>` declares `strlen`, `strcmp` and `strcpy`." },
        { startLine: 7, endLine: 7, text: "Five characters before the terminator." },
        { startLine: 8, endLine: 8, text: "The array has six items: five letters and the terminator." },
        { startLine: 10, endLine: 10, text: "`big` has twenty items. `strlen` still counts only the five characters." },
      ],
    },
    count: {
      file: "c/str_count",
      caption: "Counting up to the terminator",
      notes: [{ startLine: 6, endLine: 6, text: "Stops at the terminator. `'\\0'` is the terminator written as a character." }],
    },
    scanf: {
      file: "c/str_scanf",
      caption: "Reading a word safely",
      notes: [
        { startLine: 4, endLine: 4, text: "Room for 19 letters and the terminator." },
        { startLine: 6, endLine: 6, text: "`%19s` stores at most 19 characters, and then the terminator. There is no `&`." },
      ],
    },
    compare: {
      file: "c/str_compare",
      caption: "Comparing with strcmp",
      notes: [
        { startLine: 8, endLine: 8, text: "`strcmp` gives 0 for equal strings, so the comparison with 0 is true, which is 1." },
        { startLine: 9, endLine: 9, text: "\"tea\" and \"milk\" differ, so `strcmp` gives a number that is not 0." },
      ],
    },
    copy: {
      file: "c/str_copy",
      caption: "Copying with strcpy",
      notes: [
        { startLine: 7, endLine: 7, text: "Copies the six characters of `source`, including the terminator, into `copy`. `copy` has room for 20." },
        { startLine: 9, endLine: 9, text: "Changes `source` only. `copy` is a separate array." },
      ],
    },
  },
  mistakes: [
    {
      title: "Comparing strings with ==",
      example: {
        file: "c/str_equal_op",
        notes: [{ startLine: 6, endLine: 6, text: "`==` does not compare the characters. It compares where the two arrays are in memory." }],
      },
      whatHappens:
        "gcc reports this when you compile with `-Wall` (`-Warray-compare`), and CodeBloom's `-Werror` makes it an error. With plain `gcc`, gcc says nothing, and the program is made. It then prints Different, because the two arrays are two separate places, although they hold the same text.",
      howToRead:
        "\"comparison between two arrays\" says both sides are arrays. The note suggests comparing addresses, which is not what you want here. Compare the characters with `strcmp`.",
      fix: "`strcmp(first, second) == 0`.",
      fixExample: {
        file: "c/str_equal_fix",
        caption: "The fix",
        notes: [{ startLine: 7, endLine: 7, text: "`strcmp` compares the characters, and 0 means they are equal." }],
      },
    },
    {
      title: "Copying a string with =",
      example: {
        file: "c/str_assign",
        notes: [{ startLine: 6, endLine: 6, text: "`=` cannot copy an array, and a string is an array." }],
      },
      whatHappens: "the compiler stops with an error, so no program is made, with every set of flags.",
      howToRead: "\"assignment to expression with array type\" means the left side is an array.",
      fix: "`strcpy(second, first);` from `<string.h>`.",
      fixExample: {
        file: "c/str_assign_fix",
        caption: "The fix",
        notes: [{ startLine: 7, endLine: 7, text: "`strcpy` copies the characters and the terminator. `second` has room for them." }],
      },
    },
    {
      title: "Double quotes for one character",
      example: {
        file: "c/str_quote",
        notes: [{ startLine: 4, endLine: 4, text: "`\"A\"` is text, an array of two items. A `char` holds one character, so single quotes are needed." }],
      },
      whatHappens:
        "gcc 13 prints this as a warning even without extra flags (`-Wint-conversion`), and CodeBloom's `-Werror` makes it an error. Without `-Werror` the program is made, but `letter` does not hold an `A`.",
      howToRead:
        "`from ‘char *’` says the value is text (a location), not one character. `makes integer from pointer` says C had to turn that location into a number, which is not what you meant.",
      fix: "`char letter = 'A';`.",
      fixExample: {
        file: "c/str_quote_fix",
        caption: "The fix",
        notes: [{ startLine: 4, endLine: 4, text: "Single quotes make one character." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_str_index", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "h 5 6", why: "Indexes start at 0. `word[1]` is the second character, e." },
        { text: "e 5 5", why: "`sizeof word` counts the terminator too, so it is 6, one more than `strlen`." },
        { text: "e 6 6", why: "`strlen` stops before the terminator, so it gives 5." },
      ],
      hints: ["What is the character at index 1 of \"hello\"?", "Does `strlen` count the terminator? Does `sizeof` count it?"],
      explanation: "`word` holds h, e, l, l, o and the terminator. `word[1]` is e, `strlen` is 5, and `sizeof word` is 6.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_str_compare", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "0 1", why: "`strcmp` gives 0 for strings that are equal, so `strcmp(a, b) == 0` is true, which is 1." },
        { text: "1 1", why: "\"tea\" and \"milk\" are different, so `strcmp(a, c)` is not 0 and the comparison is false, which is 0." },
        { text: "0 0", why: "\"tea\" and \"tea\" are equal, so `strcmp(a, b)` is 0 and the comparison is true." },
      ],
      hints: ["What does `strcmp` give for equal strings?", "What does a true comparison print?"],
      explanation: "Equal strings give 0, so the first comparison is true (1), and different strings give a number that is not 0, so the second is false (0).",
    },
    {
      kind: "choice",
      question: "`name` is declared as `char name[20];`. Which call reads one word into it safely?",
      options: [
        { text: "`scanf(\"%19s\", name);`", why: "It stores at most 19 characters and then the terminator, which fits in 20 items.", correct: true },
        {
          text: "`scanf(\"%s\", name);`",
          why: "With no width there is no limit. A longer word is written past the end of the array, which is undefined behavior and a classic security bug.",
        },
        {
          text: "`scanf(\"%20s\", name);`",
          why: "The width is the number of characters it may store before the terminator, so 20 characters plus the terminator is 21 items, one more than the array has.",
        },
      ],
      hints: ["How many items does the terminator use?", "Does the width count the terminator?"],
      explanation: "Use a width one less than the size of the array.",
    },
  ],
  recap: [
    "A `char` holds one character, written in single quotes. `%c` prints it and `%d` prints its number.",
    "A string is an array of `char` that ends with `'\\0'`, the terminator, so it needs one more item than its characters.",
    "`%s` prints a string. `strlen` counts the characters before the terminator, and `sizeof` gives the size of the whole array.",
    "Read a word with a width one less than the size, such as `%19s`. Never use `%s` with no width, and never use `gets`.",
    "Compare strings with `strcmp(a, b) == 0` and copy them with `strcpy`. `==` compares places, and `=` cannot copy an array.",
    "Writing past the end of an array is undefined behavior and a common security bug: `strcpy` needs a big enough destination.",
    "Use single quotes for one character and double quotes for text.",
  ],
};
