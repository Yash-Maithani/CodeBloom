import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: functions.md. Shared idea: content/concepts/functions.md.
// No step-through visual: the tracer records only module-level names, shows a
// function as an object with a changing memory address, and has no parameters or
// local variables to show (decision D68).
export const pythonFunctions: LessonSource = {
  course: "python",
  slug: "functions",
  title: "Functions",
  status: "published",
  concept: "functions",
  objective: "Write a function with `def`, give it parameters, and get a value back from it with `return`.",
  analogy: {
    title: "A recipe card",
    text: "A recipe card is written once and kept in a drawer. Nothing is cooked until someone takes it out and follows it. Each time, the cook can use different ingredients, and the finished dish is handed over at the end.",
    limit:
      "a cook can improvise and can leave a mess around the kitchen. A function follows its steps exactly, and the names it creates inside belong to it: code outside cannot use them directly. A result gets out by being returned.",
  },
  examples: {
    greet: {
      file: "python/func_greet",
      caption: "Define once, call twice",
      notes: [
        {
          startLine: 1,
          endLine: 1,
          text: "`def` creates the function `greet`. The parentheses are empty because this function takes no values. Python does not run the body here. It only remembers it under the name `greet`.",
        },
        { startLine: 2, endLine: 3, text: "The body: the indented lines that run each time the function is called." },
        {
          startLine: 5,
          endLine: 5,
          text: "A **call**: the name followed by parentheses. Python jumps to the body, runs it, and comes back to the line after the call.",
        },
        { startLine: 6, endLine: 6, text: "The same function called again. The instructions were written once." },
      ],
    },
    param: {
      file: "python/func_param",
      caption: "A different name each time",
      notes: [
        { startLine: 1, endLine: 1, text: "`name` is a **parameter**: a variable that is local to the function and is set on each call." },
        { startLine: 4, endLine: 4, text: "`\"Ada\"` is an **argument**: the actual value passed in. While this call runs, `name` refers to it." },
        { startLine: 5, endLine: 5, text: "Same function, different argument." },
      ],
    },
    return: {
      file: "python/func_return",
      caption: "A function that returns a value",
      notes: [
        { startLine: 1, endLine: 1, text: "Two parameters, separated by a comma. They get their values from the call, in order: `a` is 2 and `b` is 3." },
        { startLine: 2, endLine: 2, text: "`return` ends the function and hands the value back to the code that called it." },
        { startLine: 4, endLine: 4, text: "The call `add(2, 3)` is replaced by the value it returns, and that value is stored in `result`." },
        { startLine: 6, endLine: 6, text: "A call can be used anywhere a value can. Here its returned value goes straight into `print`." },
      ],
    },
  },
  mistakes: [
    {
      title: "Forgetting return",
      example: {
        file: "python/func_no_return",
        notes: [
          { startLine: 2, endLine: 2, text: "The sum is stored in a name that is local to the function. Nothing is handed back." },
          { startLine: 5, endLine: 5, text: "`add(2, 3)` returned no value, so `result` holds `None`, Python's value for \"nothing\"." },
        ],
      },
      whatHappens: "the program runs without an error, but `result` is `None`. A function without `return` finishes normally. It just gives back `None`.",
      whyEasyToMiss: "no error message appears. The function worked and the sum was calculated. It was never handed back.",
      fix: "add `return total` at the end of the function, or write `return a + b`.",
      fixExample: {
        file: "python/func_no_return_fix",
        caption: "The fix",
        notes: [{ startLine: 3, endLine: 3, text: "Hands the sum back to the code that called the function." }],
      },
    },
    {
      title: "Using a name from inside a function outside it",
      example: {
        file: "python/func_scope",
        notes: [
          { startLine: 2, endLine: 2, text: "`result` is local to `double`: code outside the function cannot use it directly." },
          { startLine: 6, endLine: 6, text: "This line is outside the function, and no `result` has been created out here." },
        ],
      },
      whatHappens:
        "Python stops with a `NameError` on line 6. The call on line 5 worked and returned a value, but nothing stored it, and the `result` on line 2 belongs to `double`, so line 6 cannot use it.",
      howToRead: "the last line says the name `result` is not defined. The lines above it show line 6, where it was used.",
      fix: "store the returned value in a name outside the function: `result = double(4)`.",
      fixExample: {
        file: "python/func_scope_fix",
        caption: "The fix",
        notes: [{ startLine: 5, endLine: 5, text: "The returned value is stored in a name outside the function, so line 6 can use it." }],
      },
    },
    {
      title: "Passing the wrong number of arguments",
      example: {
        file: "python/func_wrong_count",
        notes: [{ startLine: 4, endLine: 4, text: "Two arguments, but `greet` has one parameter." }],
      },
      whatHappens: "Python stops with a `TypeError` before the body runs. A call must give exactly one argument for each parameter.",
      howToRead:
        "the last line names the function and says how many arguments it takes and how many it was given. The marks under the call show which part Python points at.",
      fix: "pass one argument per parameter, for example `greet(\"Ada\")`.",
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program show?",
      example: { file: "python/practice_func_double", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "8", why: "`print` shows `value + 1`, not `value`. `value` is 8, so the program shows 9." },
        { text: "10", why: "`double(4)` is worked out first and gives 8. Only then is 1 added. The 1 is never passed to the function." },
        { text: "None", why: "`double` has a `return` line, so the call gives back 8. It is a function without `return` that gives back `None`." },
      ],
      hints: ["What does the call `double(4)` give back?", "What does `value + 1` come to?"],
      explanation: "The call returns 8 and `value` stores it, then `print` shows `value + 1`.",
    },
    {
      kind: "predict-output",
      question: "What does this program show? Follow the order in which Python runs the lines.",
      example: { file: "python/practice_func_order", notes: [] },
      correctPosition: 4,
      wrongOutputs: [
        { text: "Ready\nStart\nReady\nEnd", why: "A `def` line only defines the function. It does not run the body. The body runs when the function is called, on line 5." },
        { text: "Start\nEnd\nReady", why: "A call runs the function immediately, at the line where it is written. Python does not save calls for the end." },
        { text: "Start\nEnd", why: "Line 5 is a call, because it has parentheses. A call runs the body, so Ready is shown." },
      ],
      hints: ["Does line 1 run the body, or only define the function?", "When Python reaches a call, where does it go before it carries on?"],
      explanation: "Python defines `announce` without running it, shows Start, runs the body at the call, then shows End.",
    },
    {
      kind: "choice",
      question: "A function creates a name called `total` inside its body and ends without a `return` line. What can the code that called the function do with `total`?",
      options: [
        {
          text: "Nothing directly. `total` is local to the function, and without `return` no value is handed back.",
          why: "A name created inside a function is local to it. Code outside cannot use it, and without `return` there is no returned value to store.",
          correct: true,
        },
        {
          text: "Use `total` directly, because every name in a program can be used everywhere.",
          why: "A name created inside a function is local to it. Using it outside causes a `NameError`, as in the second mistake above.",
        },
        {
          text: "Use `total`, but only on the line right after the call.",
          why: "A local name cannot be used outside the function, not even on the next line. Only a returned value can be used there.",
        },
      ],
      hints: ["Where can a name created inside a function be used?", "What is the way for a value to get out of a function?"],
      explanation:
        "A name created inside a function is local to it, so code outside cannot use it directly. To use a result outside, the function returns it and the caller stores or uses the returned value.",
    },
  ],
  recap: [
    "A function is a named group of instructions. `def name(parameters):` followed by an indented body defines it, and defining does not run it.",
    "Call a function with its name and parentheses. Each call runs the body.",
    "Parameters are the names in the `def` line. Arguments are the values in the call, matched by position. There must be one argument for each parameter.",
    "`return` hands a value back and ends the function. Without it, a call gives back `None`.",
    "`print` shows text to a person. `return` gives a value to the program.",
    "A name created inside a function is local to it. To use a result outside, return it and store or use the returned value.",
    "Define a function before the line that calls it runs.",
  ],
};
