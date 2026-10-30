import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: arrays.md. Shared idea: content/concepts/many-values.md, which
// the Python Lists lesson uses too. Using an index that does not exist is undefined
// behavior, so it is taught in prose and a choice question, never as an example: its
// result differs with the optimisation level and cannot be verified. The three mistakes
// are gcc reports: an array assigned with = is an error with every flag; a sizeof on an
// array parameter and too many initial values are warnings by default in gcc 13 that
// CodeBloom's -Werror makes errors.
export const cArrays: LessonSource = {
  course: "c",
  slug: "arrays",
  title: "Arrays",
  status: "published",
  concept: "many-values",
  objective:
    "Store several values in a C array, read and change items by index, find the number of items with `sizeof`, pass an array to a function, and explain why using an index that does not exist is undefined behavior.",
  analogy: {
    title: "A row of lockers",
    text: "Picture a row of lockers. Each locker holds one thing and has a number on its door. To get something, you give the locker's number.",
    limit:
      "real lockers are usually numbered from 1. A C array numbers its positions from 0, it has a fixed number of lockers that all hold the same kind of thing, and nobody checks that the number you ask for is on a door.",
  },
  examples: {
    basics: {
      file: "c/arr_basics",
      caption: "Reading items by index",
      notes: [
        { startLine: 4, endLine: 4, text: "Four items, all `int`. The values in braces fill indexes 0 to 3." },
        { startLine: 5, endLine: 5, text: "Index 0 is the first item." },
        { startLine: 6, endLine: 6, text: "The last index is one less than the number of items." },
      ],
    },
    loop: {
      file: "c/arr_loop",
      caption: "Adding up the items",
      notes: [
        { startLine: 5, endLine: 5, text: "The size of the whole array divided by the size of one item is the number of items." },
        { startLine: 7, endLine: 7, text: "`i < length` stops at index 3, the last item." },
      ],
    },
    change: {
      file: "c/arr_change",
      caption: "Replacing an item",
      notes: [{ startLine: 5, endLine: 5, text: "Assigning to an item replaces it. Index 1 is the second item." }],
    },
    partial: {
      file: "c/arr_partial",
      caption: "Fewer values than items",
      notes: [{ startLine: 4, endLine: 4, text: "Two values for five items. The other three are 0." }],
    },
    input: {
      file: "c/arr_input",
      caption: "Typed numbers in an array",
      notes: [
        { startLine: 4, endLine: 4, text: "Every item starts at 0, so none is left without a value if the input fails." },
        { startLine: 7, endLine: 7, text: "Each pass stores the next typed number in the next item." },
        { startLine: 9, endLine: 9, text: "Counts down from the last index to 0, which prints the numbers in reverse order." },
      ],
    },
    function: {
      file: "c/arr_function",
      caption: "A function that changes an array",
      notes: [
        { startLine: 3, endLine: 3, text: "`int values[]` says the parameter is an array of `int`. It carries no length, so the length is a second parameter." },
        { startLine: 5, endLine: 5, text: "This changes the caller's array, not a copy." },
        { startLine: 11, endLine: 11, text: "Only the name `numbers` is given, without square brackets." },
      ],
    },
  },
  mistakes: [
    {
      title: "Copying an array with =",
      example: {
        file: "c/arr_assign",
        notes: [{ startLine: 6, endLine: 6, text: "`=` cannot copy an array." }],
      },
      whatHappens: "the compiler stops with an error, so no program is made, with every set of flags. C does not allow assigning one array to another.",
      howToRead: "\"assignment to expression with array type\" means the left side is an array, and an array cannot be assigned to.",
      fix: "copy the items one by one, with a loop.",
      fixExample: {
        file: "c/arr_copy_loop",
        caption: "The fix",
        notes: [{ startLine: 7, endLine: 7, text: "Copies one item per pass." }],
      },
    },
    {
      title: "Asking an array parameter for its size",
      example: {
        file: "c/arr_sizeof_param",
        notes: [
          { startLine: 4, endLine: 4, text: "`values` is not the array here. It is the place where the array is, so `sizeof` does not give the array's size." },
        ],
      },
      whatHappens:
        "gcc 13 reports this as a warning even without extra flags (`-Wsizeof-array-argument`), and CodeBloom's `-Werror` makes it an error. The size that `sizeof` gives is the size of a location, not of four items, so the division does not count the items.",
      howToRead: "`will return size of ‘int *’` says that `sizeof` sees a location (`int *`), not an array. The note points at the parameter.",
      fix: "give the function the length as a parameter, computed in `main` where the array is declared.",
      fixExample: {
        file: "c/arr_sizeof_param_fix",
        caption: "The fix",
        notes: [
          { startLine: 3, endLine: 3, text: "The function receives the length as an ordinary number." },
          { startLine: 9, endLine: 9, text: "`sizeof` works here, where `numbers` is declared, so `length` is 4." },
        ],
      },
    },
    {
      title: "More values than items",
      example: {
        file: "c/arr_excess",
        notes: [{ startLine: 4, endLine: 4, text: "Four values for an array of three items." }],
      },
      whatHappens:
        "gcc 13 prints this as a warning even without extra flags, and CodeBloom's `-Werror` makes it an error. Without `-Werror` the program is made and the extra value is ignored.",
      howToRead: "\"excess elements in array initializer\" means the braces hold more values than the array has items. The caret marks the first extra one.",
      fix: "make the array big enough, or remove the extra value.",
      fixExample: {
        file: "c/arr_excess_fix",
        caption: "The fix",
        notes: [{ startLine: 4, endLine: 4, text: "Four items for four values." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_arr_sum", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "10", why: "The loop starts at index 1, so the first item, 3, is never added." },
        { text: "5", why: "`i < 4` includes index 3, the last item, 2. The loop adds indexes 1, 2 and 3." },
        { text: "3", why: "`total += numbers[i]` adds to the old total on every pass. It does not replace the total with the latest item." },
      ],
      hints: ["List the indexes the loop uses. Where does it start, and where does it stop?", "Which items are at those indexes?"],
      explanation: "The loop adds the items at indexes 1, 2 and 3: 1 + 4 + 2.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_arr_function", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "0\n5 5", why: "A function that gets an array works on the caller's array, not a copy, so `items[0]` changes." },
        { text: "0\n0 0", why: "A function that gets a single number works on a copy, so `single` keeps its value." },
        { text: "5\n0 5", why: "The `printf` inside `zero_number` runs after `number = 0`, so it shows 0." },
      ],
      hints: ["Does a function get the caller's array, or a copy of it?", "Does a function get the caller's number, or a copy of it?"],
      explanation: "The array is changed through the function, and the single number is not.",
    },
    {
      kind: "choice",
      question: "A program declares `int scores[4]` and then reads `scores[4]`. What does C guarantee?",
      options: [
        {
          text: "Nothing. The behavior is undefined.",
          why: "Index 4 does not exist, and C does not check. The program may show a leftover value, crash, or seem to work.",
          correct: true,
        },
        { text: "It reads 0, the value after the last item.", why: "Nothing guarantees a 0, or any value at all. What lies beyond the array is whatever the memory holds." },
        {
          text: "It stops with an error message, as a Python list does.",
          why: "C does not check indexes. A Python list stops with an `IndexError`, but a C array does not.",
        },
      ],
      hints: ["Does C check whether an index exists?", "Is index 4 one of the four items?"],
      explanation: "Using an index that does not exist is undefined behavior, and writing past the end of an array is a common cause of security bugs.",
    },
  ],
  recap: [
    "An array holds a fixed number of values of one type. `int scores[4] = {70, 85, 90, 60};` declares four items.",
    "Items are numbered from 0, and the last index is one less than the number of items. `array[i]` reads or changes item `i`.",
    "`sizeof array / sizeof array[0]` gives the number of items where the array is declared.",
    "Fewer values than items fill the rest with 0. Give a local array starting values.",
    "A function that receives an array can change the caller's array, and it does not know the length, so pass the length as another argument.",
    "`=` cannot copy an array. Copy the items with a loop.",
    "An index that does not exist is undefined behavior, and writing past the end is a common security bug. `-fsanitize=address` finds it when the program runs.",
  ],
};
