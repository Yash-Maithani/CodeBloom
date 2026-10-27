import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: lists.md. Shared idea: content/concepts/many-values.md.
export const pythonLists: LessonSource = {
  course: "python",
  slug: "lists",
  title: "Lists",
  status: "published",
  concept: "many-values",
  objective: "Store several values in a list, read and change items by position, and go through a list with a `for` loop.",
  analogy: {
    title: "A row of lockers",
    text: "Picture a row of lockers. Each locker holds one thing and has a number on its door. To get something, you give the locker's number.",
    limit: "real lockers are usually numbered from 1 and cannot grow. A Python list numbers its positions from 0, and it grows when you add items.",
  },
  examples: {
    basics: {
      file: "python/list_basics",
      caption: "A list of three fruits",
      notes: [
        { startLine: 1, endLine: 1, text: "Square brackets make a list. This one has three items, all text. The list is stored in `fruits`." },
        {
          startLine: 2,
          endLine: 2,
          text: "`print` shows the whole list in Python's own list notation: square brackets, commas, and quotes around text items. The quotes and brackets are not part of the items.",
        },
        { startLine: 3, endLine: 3, text: "`fruits[0]` is the item at index 0, the first one. The number in square brackets is the **index**." },
        { startLine: 4, endLine: 4, text: "Index 2 is the third item, and in a list of three, the last." },
        { startLine: 5, endLine: 5, text: "`len(fruits)` gives the number of items in the list." },
      ],
    },
    change: {
      file: "python/list_change",
      caption: "Adding and replacing items",
      notes: [
        {
          startLine: 2,
          endLine: 2,
          text: "`append` adds an item at the end. It is a **method**: an action that belongs to a value, written as the value, a dot and the action's name.",
        },
        { startLine: 3, endLine: 3, text: "Assigning to an index replaces the item at that position." },
      ],
    },
    loop: {
      file: "python/list_loop",
      caption: "One pass per item",
      notes: [
        { startLine: 2, endLine: 2, text: "On each pass `fruit` is the next item, in order. The name `fruit` is your choice." },
        { startLine: 3, endLine: 3, text: "Indented, so it repeats once per item." },
        { startLine: 4, endLine: 4, text: "Not indented, so it runs once, after the loop." },
      ],
    },
  },
  mistakes: [
    {
      title: "Using an index that does not exist",
      example: {
        file: "python/list_index_error",
        notes: [{ startLine: 2, endLine: 2, text: "The list has three items, so the valid indexes are 0, 1 and 2. There is no index 3." }],
      },
      whatHappens: "Python stops with an `IndexError` on line 2. Index 3 would be the fourth item, and there is none.",
      whyEasyToMiss: "the list has three items, so 3 feels like the last position. The last index is always one less than the length.",
      howToRead: "the last line gives the error type and says the index is out of range. The lines above it show the code that failed.",
      fix: "use an index from 0 to `len(fruits) - 1`. For the last item of this list, that is 2.",
      fixExample: {
        file: "python/list_index_error_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "Index 2 is the last item of a list of three." }],
      },
    },
    {
      title: "Thinking a second name makes a copy",
      example: {
        file: "python/list_alias",
        notes: [
          { startLine: 2, endLine: 2, text: "This does not copy the list. It gives the same list a second name." },
          { startLine: 3, endLine: 3, text: "Changes the one list that both names refer to." },
        ],
      },
      whatHappens:
        "the program runs without an error, but `original` has changed too, though only `other` was used to add the 4. `other = original` gives the list a second name. It does not make a second list.",
      whyEasyToMiss:
        "no error message appears, and the same pattern with a number behaves differently. After `other = original`, giving `other` a new number would leave `original` alone. A list is changed in place, so both names see the change.",
      fix: "make a real copy with `original.copy()`, so the names refer to two separate lists.",
      fixExample: {
        file: "python/list_alias_fix",
        caption: "The fix",
        notes: [{ startLine: 2, endLine: 2, text: "`copy()` makes a new list with the same items. `other` refers to the new list." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_list_positions", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "a\nc", why: "Positions start at 0, not 1. Index 1 is the second item, b, and index 3 is the fourth item, d." },
        { text: "b\n3", why: "`letters[...]` gives the item at that position, not the position itself. `len(letters) - 1` is 3, and the item at index 3 is d." },
      ],
      hints: ["Index 0 holds a. Count from there.", "What is `len(letters) - 1`?"],
      explanation: "Index 1 is the second item, b. The length is 4, so `len(letters) - 1` is 3, the index of the last item, d.",
    },
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_list_total", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "6", why: "`append` adds 4 to the list before the loop starts, so the loop goes through all four items, including the 4." },
        { text: "4", why: "4 is the number of items. The loop adds the items together, so the program shows their sum, not how many there are." },
      ],
      hints: ["What does the list hold when the loop starts?", "What is `total` after each pass?"],
      explanation: "The list is 1, 2, 3 and 4 when the loop starts, and `total` adds each item: 1, 3, 6, 10.",
    },
    {
      kind: "choice",
      question: "These lines run in order: `scores = [5, 8]`, then `backup = scores`, then `backup.append(9)`. What is true afterwards?",
      options: [
        {
          text: "`scores` has three items, because `backup` is another name for the same list.",
          why: "There is one list with two names, and `append` changed that list.",
          correct: true,
        },
        {
          text: "`scores` still has two items, because `backup` is a separate list.",
          why: "`backup = scores` does not make a new list. Only `scores.copy()` does.",
        },
        {
          text: "Python reports an error, because a list cannot have two names.",
          why: "Any value can have several names. The second mistake above ran without an error.",
        },
      ],
      hints: ["How many lists exist after the second line: one or two?", "Does the list remember which name was used to change it?"],
      explanation: "Line 2 gives the existing list a second name. Line 3 changes that list, and both names refer to it.",
    },
  ],
  recap: [
    "A list keeps many values in order under one name. Write it with square brackets: `[\"a\", \"b\"]`.",
    "Each item has an index, counted from 0. The last index is `len(list) - 1`, and an index that does not exist gives an `IndexError`.",
    "`list[index]` reads an item, `list[index] = value` replaces it, and `list.append(value)` adds one at the end.",
    "`len(list)` gives the number of items.",
    "`for item in list:` runs its group once per item, in order, and zero times for an empty list.",
    "`other = original` does not copy a list. It gives it a second name. Use `original.copy()` for a real copy.",
  ],
};
