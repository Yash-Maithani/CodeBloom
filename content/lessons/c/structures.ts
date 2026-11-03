import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: structures.md. No shared concept: the closest Python lesson,
// Dictionaries, looks things up by a key chosen at run time, which a struct does not. The
// three mistakes are compile errors with every flag. `= {0}` and a list of values that stops
// early were tested with gcc 13.3 and the lesson says exactly what was found.
export const cStructures: LessonSource = {
  course: "c",
  slug: "structures",
  title: "Structures",
  status: "published",
  objective:
    "Define a `struct`, read and change its members with `.`, copy it with `=`, keep several in an array, and pass one to a function by value or through a pointer with `->`.",
  analogy: {
    title: "An index card",
    text: "An index card has labelled boxes: name, age, score. One card holds all the facts about one student, and each box is filled in separately.",
    limit:
      "the labelled boxes of a C struct are fixed when you write the program, and each box has a type. You cannot add a box later, and you cannot look one up by a name that is only decided while the program runs.",
  },
  examples: {
    basic: {
      file: "c/struct_basic",
      caption: "Defining and using a struct",
      notes: [
        { startLine: 3, endLine: 7, text: "Defines a new type, `struct Student`, with three members. No variable exists yet. The semicolon after `}` is required." },
        { startLine: 10, endLine: 10, text: "A variable of the new type. The values fill the members in order." },
        { startLine: 11, endLine: 11, text: "`ada.name` is the `name` member of `ada`." },
        { startLine: 12, endLine: 12, text: "Members change one at a time." },
      ],
    },
    copy: {
      file: "c/struct_copy",
      caption: "Copying with =",
      notes: [
        { startLine: 10, endLine: 10, text: "Copies every member, including the `char` array inside." },
        { startLine: 11, endLine: 12, text: "Change only `second`. `first` still holds Ada and 17." },
      ],
    },
    array: {
      file: "c/struct_array",
      caption: "Several students",
      notes: [
        { startLine: 9, endLine: 9, text: "An array of three structs. Each inner pair of braces fills one student." },
        { startLine: 12, endLine: 12, text: "`students[i]` picks one item, and `.name` picks a member of it." },
      ],
    },
    input: {
      file: "c/struct_input",
      caption: "Reading a name and an age",
      notes: [
        { startLine: 9, endLine: 9, text: "Every member gets a starting value." },
        { startLine: 11, endLine: 11, text: "`s.name` is an array, so there is no `&`." },
        { startLine: 12, endLine: 12, text: "`s.age` is an `int`, so `scanf` needs its address." },
      ],
    },
    byvalue: {
      file: "c/struct_by_value",
      caption: "A copy of the struct",
      notes: [
        { startLine: 8, endLine: 8, text: "`s` is a copy of the whole struct." },
        { startLine: 16, endLine: 16, text: "`ada.age` is still 17." },
      ],
    },
    pointer: {
      file: "c/struct_pointer",
      caption: "A pointer to a struct",
      notes: [
        { startLine: 9, endLine: 9, text: "`s->age` is the `age` member of the struct `s` points to." },
        { startLine: 10, endLine: 10, text: "`(*s).age` means the same. The brackets are needed because `.` binds tighter than `*`." },
        { startLine: 15, endLine: 15, text: "The address is passed, so the function changes `ada` itself." },
      ],
    },
    return: {
      file: "c/struct_return",
      caption: "Returning a struct",
      notes: [{ startLine: 10, endLine: 10, text: "The struct is copied out, so it is safe even though `p` ends here." }],
    },
  },
  mistakes: [
    {
      title: "Using . on a pointer",
      example: {
        file: "c/struct_dot_pointer",
        notes: [{ startLine: 9, endLine: 9, text: "`p->y` is right. `p.x` uses `.`, but `p` is a pointer." }],
      },
      whatHappens: "the compiler stops with an error, so no program is made, with every set of flags.",
      howToRead: "\"‘p’ is a pointer\" says the left side of the `.` is a pointer, not a struct. The line below the caret suggests `->`.",
      fix: "use `->` on a pointer and `.` on a struct. `*p.x` does not work either: `.` binds first, so it asks for a member of `p` itself. Write `p->x` or `(*p).x`.",
      fixExample: {
        file: "c/struct_dot_pointer_fix",
        caption: "The fix",
        notes: [{ startLine: 9, endLine: 9, text: "`->` follows the pointer for both members." }],
      },
    },
    {
      title: "Comparing structs with ==",
      example: {
        file: "c/struct_equal",
        notes: [{ startLine: 11, endLine: 11, text: "`==` does not work on whole structs." }],
      },
      whatHappens: "the compiler stops with an error, so no program is made, with every set of flags.",
      howToRead: "\"invalid operands to binary ==\" means `==` cannot compare these two types. The text in brackets names them.",
      fix: "compare the members: `a.x == b.x && a.y == b.y`.",
      fixExample: {
        file: "c/struct_equal_fix",
        caption: "The fix",
        notes: [{ startLine: 11, endLine: 11, text: "Each member is compared, and both must match." }],
      },
    },
    {
      title: "Assigning text to a char array member",
      example: {
        file: "c/struct_name_assign",
        notes: [{ startLine: 10, endLine: 10, text: "`name` is an array, and `=` cannot assign to an array, even inside a struct." }],
      },
      whatHappens: "the compiler stops with an error, so no program is made, with every set of flags.",
      howToRead: "the same message as copying an array in Arrays: the left side is an array.",
      fix: "copy the text with `strcpy(s.name, \"Ada\");` from `<string.h>`.",
      fixExample: {
        file: "c/struct_name_assign_fix",
        caption: "The fix",
        notes: [{ startLine: 11, endLine: 11, text: "`strcpy` copies the characters and the terminator into `s.name`, which has room for them." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_struct_copy", notes: [] },
      correctPosition: 4,
      wrongOutputs: [
        { text: "10 10", why: "`b` is a copy, so changing `b.x` does not change `a.x`." },
        { text: "1 1", why: "The line `b.x = 10;` changes `b.x` to 10, so `b.x` is no longer 1." },
        { text: "10 1", why: "The first value printed is `a.x`, and the second is `b.x`." },
      ],
      hints: ["Does `b = a` make `b` another name for `a`, or a copy?", "Which struct does `b.x = 10` change?"],
      explanation: "`b` is a separate copy, so only `b.x` changes.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_struct_fn", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "6 6", why: "`move_value` gets a copy, so `a.x` stays 1." },
        { text: "6 1", why: "It is `move_pointer` that changes the caller's struct, so `y` changes and `x` does not." },
        { text: "1 1", why: "`move_pointer` gets the address of `a`, so `a.y` becomes 6." },
      ],
      hints: ["Which function receives a copy, and which receives an address?", "Which member does each function change?"],
      explanation: "Only the pointer version changes `a`.",
    },
    {
      kind: "choice",
      question: "`struct Point *p = &a;` Which expression reads the `x` member of `a` through `p`?",
      options: [
        { text: "`p->x`", why: "`->` follows the pointer and reaches the member.", correct: true },
        { text: "`p.x`", why: "`.` needs a struct, but `p` is a pointer. gcc says \"‘p’ is a pointer; did you mean to use ‘->’?\"." },
        {
          text: "`*p.x`",
          why: "`.` binds before `*`, so this asks for member `x` of `p` itself, which fails with the same message. `(*p).x` would work.",
        },
      ],
      hints: ["Is `p` a struct or a pointer to one?", "Which operator binds first, `.` or `*`?"],
      explanation: "Use `->` on a pointer to a struct.",
    },
  ],
  recap: [
    "A struct groups values of different types under one name. Define it once with `struct Name { members };`, and do not forget the semicolon.",
    "`.` reaches a member. `->` reaches a member through a pointer, and `p->x` is `(*p).x`.",
    "`=` copies a whole struct, including arrays inside it. `==` does not work on structs: compare the members.",
    "A struct passed to a function is copied. Pass its address to change the caller's struct.",
    "Text in a `char` array member is set with `strcpy` or `scanf`, not with `=`.",
    "Give every member a value when you declare a struct.",
  ],
};
