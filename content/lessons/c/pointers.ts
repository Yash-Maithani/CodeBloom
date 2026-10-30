import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: pointers.md. No shared concept: Python has no pointers.
// Addresses change on every run, so no example prints one; they compare addresses and use
// the values behind them. Dereferencing NULL or a pointer with no value, a returned address
// of a local, and a pointer moved outside its array are undefined behavior: they are taught
// in prose and a choice question, never as examples that run. Mistakes 1 and 3 are gcc 13
// default warnings that CodeBloom's -Werror makes errors; mistake 2 compiles and runs
// with every flag.
export const cPointers: LessonSource = {
  course: "c",
  slug: "pointers",
  title: "Pointers",
  status: "published",
  objective:
    "Use `&` and `*` to work with addresses, let a function change the caller's variable, explain how arrays and strings reach functions, and recognize the pointer mistakes that C leaves undefined.",
  analogy: {
    title: "A note with a street address",
    text: "A variable is a house, its value is who lives there, and its address is the street address. A pointer is a note with an address written on it. With the note, you can go to the house and read or change what is there.",
    limit:
      "street addresses are fixed, and a wrong one usually brings the mail back. A C address is a number chosen each time the program runs, so it differs from run to run. And a pointer can hold an address where nothing valid lives, and nobody checks.",
  },
  examples: {
    basic: {
      file: "c/ptr_basic",
      caption: "An address and the value behind it",
      notes: [
        { startLine: 5, endLine: 5, text: "`int *p` declares `p` as a pointer to `int`. `&score` is the address of `score`, so `p` now holds it." },
        { startLine: 6, endLine: 6, text: "`*p` is the `int` that `p` points to." },
        { startLine: 7, endLine: 7, text: "Compares two addresses. They are the same, so the result is 1. The address itself is never printed." },
        { startLine: 8, endLine: 8, text: "Stores 25 in the place `p` points to, which is `score`." },
        { startLine: 9, endLine: 9, text: "`score` changed, although its name does not appear on line 8." },
      ],
    },
    addone: {
      file: "c/ptr_add_one",
      caption: "A function that changes the caller's variable",
      notes: [
        { startLine: 3, endLine: 3, text: "The parameter is a pointer to `int`. It receives a copy of an address, and the copy points to the same variable." },
        { startLine: 4, endLine: 4, text: "`*number` is the caller's `score`. Read it, add 1 and store it back." },
        { startLine: 9, endLine: 9, text: "`&score` passes the address. In Functions the same call with `score` left it at 10." },
        { startLine: 10, endLine: 10, text: "Now 11." },
      ],
    },
    swap: {
      file: "c/ptr_swap",
      caption: "Swapping two variables",
      notes: [
        { startLine: 4, endLine: 4, text: "`temp` keeps the value of `x`, so it is not lost." },
        { startLine: 5, endLine: 5, text: "Copies `y`'s value into `x`." },
        { startLine: 12, endLine: 12, text: "Both addresses are passed. A function with plain `int` parameters could not do this." },
      ],
    },
    scanf: {
      file: "c/ptr_scanf",
      caption: "A pointer already holds the address",
      notes: [
        { startLine: 5, endLine: 5, text: "`where` holds the address of `age`." },
        { startLine: 7, endLine: 7, text: "No `&`: `where` already is the address, the same value as `&age`." },
        { startLine: 8, endLine: 8, text: "`scanf` stored the number in `age` through the address." },
      ],
    },
    array: {
      file: "c/ptr_array",
      caption: "Moving through an array",
      notes: [
        { startLine: 5, endLine: 5, text: "The array name becomes the address of its first item, so there is no `&`." },
        { startLine: 7, endLine: 7, text: "`p + 1` is the address of the next `int`, not the next byte." },
        { startLine: 8, endLine: 8, text: "`numbers[1]` and `*(numbers + 1)` are the same thing, so this prints 1." },
        { startLine: 9, endLine: 9, text: "Moves `p` to the next item." },
      ],
    },
    walk: {
      file: "c/ptr_walk",
      caption: "Adding up with a pointer",
      notes: [
        {
          startLine: 6,
          endLine: 6,
          text: "`p` starts at the first item. `numbers + 4` is the place just after the last item: it may be compared with, but never read. The loop ends when `p` gets there.",
        },
        { startLine: 7, endLine: 7, text: "`*p` is the current item." },
      ],
    },
    sametype: {
      file: "c/ptr_same_type",
      caption: "An array parameter is a pointer",
      notes: [
        { startLine: 3, endLine: 3, text: "The prototype writes the parameter as an array." },
        { startLine: 12, endLine: 12, text: "The definition writes it as a pointer. gcc accepts both because they are the same type." },
        { startLine: 13, endLine: 13, text: "Indexing works on a pointer, and it changes the caller's array." },
      ],
    },
    paramsize: {
      file: "c/ptr_param_size",
      caption: "sizeof of an array and of a pointer",
      notes: [
        { startLine: 4, endLine: 4, text: "Inside the function, `values` is a pointer, so `sizeof values` is the size of a pointer." },
        { startLine: 9, endLine: 9, text: "In `main`, `numbers` is the array: the size of four `int`." },
      ],
    },
    scanfstring: {
      file: "c/ptr_scanf_string",
      caption: "An array name is an address",
      notes: [
        { startLine: 6, endLine: 6, text: "`name` alone is the address of its first character, so there is no `&`." },
        { startLine: 8, endLine: 8, text: "`name` and `&name[0]` are the same address, so this prints 1." },
      ],
    },
    find: {
      file: "c/ptr_find",
      caption: "Returning a pointer or NULL",
      notes: [
        { startLine: 3, endLine: 3, text: "The `int *` before the name says the function returns a pointer." },
        { startLine: 6, endLine: 6, text: "The address of an item in the caller's array. The array still exists after the function ends." },
        { startLine: 9, endLine: 9, text: "`NULL` means \"points to nothing\"." },
        { startLine: 16, endLine: 16, text: "Check before you dereference." },
        { startLine: 19, endLine: 19, text: "The pointer is `NULL`, so it must not be dereferenced." },
      ],
    },
  },
  mistakes: [
    {
      title: "Leaving out the & in the call",
      example: {
        file: "c/ptr_no_amp",
        notes: [{ startLine: 9, endLine: 9, text: "`score` is an `int`, but the function wants the address of one." }],
      },
      whatHappens:
        "gcc 13 reports this as a warning even without extra flags (`-Wint-conversion`), and CodeBloom's `-Werror` makes it an error. A program made without `-Werror` would use the number 10 as an address, which is undefined behavior: the rules of C do not say what happens.",
      howToRead:
        "\"makes pointer from integer\" says an `int` was given where a pointer is expected. The note says what the function expected (`int *`) and what it got (`int`).",
      fix: "pass the address: `add_one(&score);`.",
      fixExample: {
        file: "c/ptr_no_amp_fix",
        caption: "The fix",
        notes: [{ startLine: 9, endLine: 9, text: "`&score` is the address of `score`." }],
      },
    },
    {
      title: "Changing the pointer instead of what it points to",
      example: {
        file: "c/ptr_wrong_target",
        notes: [
          {
            startLine: 5,
            endLine: 5,
            text: "This changes `number`, the function's own copy of the address, so it now points at `zero`. `score` is not touched.",
          },
        ],
      },
      whatHappens:
        "the program compiles and runs without any message, with every set of flags. It is not undefined behavior: a pointer parameter is a copy like any other. The line that reads `*number` shows 0, so the function seems to work.",
      whyEasyToMiss: "gcc cannot know you meant to change `score`, and \"Inside\" shows the value you wanted.",
      fix: "store through the pointer: `*number = 0;`.",
      fixExample: {
        file: "c/ptr_wrong_target_fix",
        caption: "The fix",
        notes: [{ startLine: 4, endLine: 4, text: "`*number` is the caller's `score`, so it is now 0." }],
      },
    },
    {
      title: "Returning the address of a local variable",
      example: {
        file: "c/ptr_return_local",
        notes: [{ startLine: 5, endLine: 5, text: "`value` exists only while `make_number` runs. After the function ends, the address points at nothing valid." }],
      },
      whatHappens:
        "gcc 13 reports this as a warning even without extra flags (`-Wreturn-local-addr`), and CodeBloom's `-Werror` makes it an error. Using the returned pointer in a program made without `-Werror` is undefined behavior. In CodeBloom's test with gcc 13.3 on Linux the program stopped with a segmentation fault, but C does not promise that.",
      howToRead: "\"returns address of local variable\" says the function hands back an address that will be invalid.",
      fix: "return the value itself, or return a pointer into data that outlives the function, as `find` did with the caller's array.",
      fixExample: {
        file: "c/ptr_return_local_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "Returns the value, which is copied out." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_ptr_star", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "5 7", why: "`*p` is `a` itself, so storing through `p` changes `a`." },
        { text: "5 5", why: "`*p = *p + 2` stores 7 in the place `p` points to, which is `a`. Nothing is lost." },
        { text: "7 5", why: "`*p` is read after the assignment and is the same variable as `a`, so it is 7 too." },
      ],
      hints: ["What does `*p` refer to?", "After line 6, are `a` and `*p` two variables or one?"],
      explanation: "`p` points to `a`, so `*p` and `a` are the same variable. Both show 7.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_ptr_copy", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "2 2", why: "`b` is an ordinary `int` parameter, a copy of `y`. Changing it does not change `y`." },
        { text: "1 1", why: "`change` receives the address of `x`, so it changes `x` itself." },
        { text: "1 2", why: "It is the first parameter that is an address, and the second that is a copy." },
      ],
      hints: ["Which parameter holds an address, and which holds a copy?", "Which variable does `*a = *a + 1` change?"],
      explanation: "`x` is changed through the pointer. `y` is copied into `b`, and only the copy changes.",
    },
    {
      kind: "choice",
      question: "A program sets `int *p = NULL;` and then reads `*p`. What does C guarantee?",
      options: [
        {
          text: "Nothing. The behavior is undefined.",
          why: "C does not check pointers. On many systems the program stops with a segmentation fault, as in CodeBloom's test, but C does not promise it.",
          correct: true,
        },
        {
          text: "It reads 0, the value of NULL.",
          why: "`NULL` is an address, not the value stored there. `*p` is whatever lives at that address, and nothing valid does.",
        },
        {
          text: "It stops with an error message that names the line, as a Python exception does.",
          why: "C adds no checks. At most, gcc can warn at compile time in simple cases, and only with `-O2 -Wnull-dereference`.",
        },
      ],
      hints: ["Does C check a pointer before it follows it?", "Does `NULL` point to a value you can read?"],
      explanation: "Dereferencing `NULL` is undefined behavior. Check for `NULL` first.",
    },
  ],
  recap: [
    "`&x` is the address of `x`. A pointer holds an address, and `int *p` means \"pointer to `int`\".",
    "`*p` means the thing `p` points to. In a declaration the `*` is part of the type, and elsewhere it dereferences.",
    "Pass `&x` and a pointer parameter to let a function change `x`. This is also why `scanf` needs `&`.",
    "An array name becomes the address of its first item. `p + 1` moves to the next item. `int values[]` in a parameter list is `int *values`, which is why a function changes the caller's array, does not know its length, and why `sizeof` gives the size of a pointer there.",
    "`NULL` means \"points to nothing\". Check for it before you dereference.",
    "Dereferencing `NULL`, a pointer with no value, or a dangling pointer, and moving a pointer outside its array, are undefined behavior. Never return the address of a local variable.",
    "Changing the pointer (`number = ...`) is not the same as changing what it points to (`*number = ...`).",
  ],
};
