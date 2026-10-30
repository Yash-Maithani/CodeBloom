import type { LessonSource } from "@/lib/lesson-types";

// Prose in reading order: functions.md. Shared idea: content/concepts/functions.md,
// which the Python lesson uses too. The three mistakes are gcc reports: a missing return
// and a call before the declaration are warnings that -Wall (and, in gcc 13, the default
// flags) turn on and CodeBloom's -Werror makes errors; a local variable used outside its
// function is an error with every flag. A returned value that was never set is undefined
// behavior, so it is described in words and never shown as a program that runs.
export const cFunctions: LessonSource = {
  course: "c",
  slug: "functions",
  title: "Functions",
  status: "published",
  concept: "functions",
  objective:
    "Write a C function with a return type, parameters and `return`, declare it before it is used, and explain why a function cannot change the caller's variables.",
  analogy: {
    title: "A recipe card",
    text: "A recipe card is written once and kept in a drawer. Nothing is cooked until someone takes it out and follows it. Each time, the cook can use different ingredients, and the finished dish is handed over at the end.",
    limit:
      "a cook can improvise, and can work on your own ingredients. A C function follows its steps exactly, and it works on photocopies of the ingredients you give it: the originals stay untouched. The names it creates inside belong to it, and code outside cannot use them. Only the value it returns comes out.",
  },
  examples: {
    greet: {
      file: "c/fn_greet",
      caption: "Define once, call twice",
      notes: [
        { startLine: 3, endLine: 3, text: "`void` means this function hands nothing back, and `(void)` means it takes no values. C only learns the function here. It does not run it." },
        { startLine: 4, endLine: 5, text: "The body: the instructions that run each time the function is called." },
        { startLine: 9, endLine: 9, text: "A call. C jumps to the body, runs it, and comes back to the line after the call." },
        { startLine: 10, endLine: 10, text: "The same function called again. The instructions were written once." },
      ],
    },
    param: {
      file: "c/fn_param",
      caption: "A different number each time",
      notes: [
        { startLine: 3, endLine: 3, text: "`int number` is a parameter: a variable that exists only inside the function and gets its value from the call." },
        { startLine: 8, endLine: 8, text: "`3` is the argument. C copies it into `number`." },
        { startLine: 9, endLine: 9, text: "Same function, different argument." },
      ],
    },
    return: {
      file: "c/fn_return",
      caption: "A function that returns a value",
      notes: [
        { startLine: 3, endLine: 3, text: "The `int` before the name says the function hands back a whole number. `a` and `b` get their values from the call, in order." },
        { startLine: 4, endLine: 4, text: "`return` ends the function and hands the value back." },
        { startLine: 8, endLine: 8, text: "The call `add(2, 3)` is replaced by the value it returns, and that value is stored in `result`." },
        { startLine: 10, endLine: 10, text: "A call can be used anywhere a value can. Here the returned value goes straight into `printf`." },
      ],
    },
    average: {
      file: "c/fn_average",
      caption: "Returning a double",
      notes: [
        { startLine: 3, endLine: 3, text: "`double` before the name: this function hands back a decimal number." },
        { startLine: 4, endLine: 4, text: "`2.0` has a decimal point, so the division keeps the decimal part, as in Numbers and arithmetic." },
      ],
    },
    larger: {
      file: "c/fn_larger",
      caption: "A function that compares",
      notes: [
        { startLine: 4, endLine: 7, text: "Two `return` lines. If `a` is bigger, C returns it and the function ends. Otherwise C reaches the second `return`." },
        { startLine: 16, endLine: 16, text: "The call is used as a value, inside `printf`." },
      ],
    },
    prototype: {
      file: "c/fn_prototype",
      caption: "A prototype",
      notes: [
        { startLine: 3, endLine: 3, text: "A prototype: the first line of the definition, ending with a semicolon. It lets `main` call `greet` before the definition below." },
        { startLine: 10, endLine: 10, text: "The definition. Its first line must match the prototype." },
      ],
    },
    byvalue: {
      file: "c/fn_by_value",
      caption: "Changing the parameter",
      notes: [
        { startLine: 4, endLine: 4, text: "Changes `number`, the function's own copy." },
        { startLine: 10, endLine: 10, text: "C copies the value of `score` into `number`." },
        { startLine: 11, endLine: 11, text: "`score` is still 10. Only the copy changed." },
      ],
    },
  },
  mistakes: [
    {
      title: "Forgetting return",
      example: {
        file: "c/fn_no_return",
        notes: [{ startLine: 6, endLine: 6, text: "The function reaches its closing brace without a `return`, although it was declared to hand back an `int`." }],
      },
      whatHappens:
        "gcc reports this when you compile with `-Wall` (the report is called `-Wreturn-type`), and CodeBloom compiles with `-Wall -Wextra -Werror`, so it is an error here. With plain `gcc`, gcc says nothing and the program is made. A function declared with a return type must hand back a value. If the caller uses a value that was never returned, the behavior is undefined. This program ignores the value, so it runs.",
      howToRead:
        "\"control reaches end of non-void function\" means the closing brace was reached with no `return`. A \"non-void\" function is one that was declared to hand back a value.",
      whyEasyToMiss: "plain gcc does not report it, and the program may seem to work. Python gives you `None` in this case, and C gives you nothing you can rely on.",
      fix: "end the function with `return` and a value: `return total;`.",
      fixExample: {
        file: "c/fn_no_return_fix",
        caption: "The fix",
        notes: [{ startLine: 6, endLine: 6, text: "The function now hands back `total`." }],
      },
    },
    {
      title: "Calling a function before it is declared",
      example: {
        file: "c/fn_before_declared",
        notes: [{ startLine: 4, endLine: 4, text: "`add` is called here, but C has read only lines 1 to 3, so it does not know `add` yet." }],
      },
      whatHappens:
        "gcc 13 reports the call as a warning even without extra flags (`-Wimplicit-function-declaration`), and CodeBloom's `-Werror` makes it an error. The C standard no longer allows calling a function that was not declared, so the program is not correct C even where a compiler accepts it.",
      howToRead: "\"implicit declaration\" means C had to guess that `add` exists. The caret marks the call.",
      fix: "write a prototype above `main`, or move the whole definition above `main`.",
      fixExample: {
        file: "c/fn_before_declared_fix",
        caption: "The fix",
        notes: [{ startLine: 3, endLine: 3, text: "The prototype tells C about `add` before `main` calls it." }],
      },
    },
    {
      title: "Using a variable from inside a function",
      example: {
        file: "c/fn_local",
        notes: [{ startLine: 10, endLine: 10, text: "`result` exists only inside `double_it`. `main` has no variable with that name." }],
      },
      whatHappens:
        "the compiler stops with an error, so no program is made, with every set of flags. The call on line 9 worked, but nothing stored its value.",
      howToRead:
        "\"undeclared\" means no declaration with this name is visible here. \"In function ‘main’\" says which function the compiler was reading.",
      fix: "store the returned value in a variable declared in `main`: `int result = double_it(4);`.",
      fixExample: {
        file: "c/fn_local_fix",
        caption: "The fix",
        notes: [{ startLine: 9, endLine: 9, text: "The returned value is stored in a variable that belongs to `main`." }],
      },
    },
  ],
  practice: [
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_fn_value", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "16", why: "`printf` shows `value + 1`, not `value`. `value` is 16, so the program shows 17." },
        { text: "25", why: "`square(4)` is worked out first and gives 16. Only then is 1 added. The 1 is never passed to the function." },
        { text: "4", why: "`square` hands back `n * n`, not its argument." },
      ],
      hints: ["What does the call `square(4)` hand back?", "What does `value + 1` come to?"],
      explanation: "The call returns 16 and `value` stores it. Then `printf` shows `value + 1`.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_fn_copy", notes: [] },
      correctPosition: 2,
      wrongOutputs: [
        { text: "8\n8", why: "The function doubles its own copy. `x` in `main` is a separate variable and keeps its value." },
        { text: "4\n4", why: "The `printf` inside the function runs on the doubled copy, so it shows 8, not 4." },
      ],
      hints: ["What does the function receive: `x` itself, or a copy?", "Which `printf` runs first, and which variable does it show?"],
      explanation: "Inside the function, `n` is a copy of `x`, and it is doubled to 8. `x` in `main` is still 4.",
    },
    {
      kind: "predict-output",
      question: "What does this program print?",
      example: { file: "c/practice_fn_truncate", notes: [] },
      correctPosition: 3,
      wrongOutputs: [
        { text: "6.6", why: "`a` and `b` are `int` parameters, so the decimal parts are dropped when the arguments are copied in. `%d` also shows a whole number." },
        { text: "7", why: "C does not round. It drops the decimal part, so 2.7 becomes 2 and 3.9 becomes 3." },
        { text: "6", why: "Each argument is converted before the addition: 2 + 3, not 2.7 + 3.9." },
      ],
      hints: ["What type are the parameters?", "What happens to the decimal part when a decimal number is stored in an `int`?"],
      explanation: "The parameters are `int`, so 2.7 becomes 2 and 3.9 becomes 3. gcc says nothing unless you compile with `-Wconversion`.",
    },
  ],
  recap: [
    "A function definition is a return type, a name, parameters in parentheses, and instructions in braces. `void` means nothing is handed back or taken.",
    "Call a function with its name and parentheses. Each call runs the body.",
    "Parameters are the variables in the definition. Arguments are the values in the call, copied in by position.",
    "`return` hands a value back and ends the function. A function with a return type must return a value, and gcc reports a missing `return` with `-Wall`.",
    "C must know a function before it is called: define it above `main`, or write a prototype.",
    "A function works on copies of its arguments, so it cannot change the caller's variables. Pointers show how that is done.",
    "A variable declared inside a function exists only inside it.",
  ],
};
