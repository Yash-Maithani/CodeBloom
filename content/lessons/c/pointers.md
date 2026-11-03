{{analogy}}

## Addresses and pointers

Every variable is stored somewhere in the computer's memory, and that place has an **address**. The `&` operator, "address of", gives it: `&score` is the address of `score`. A **pointer** is a variable that holds an address. Its type says what it points to: `int *` means "pointer to `int`".

Address numbers are not shown on this site. You can print one with `%p`, but it changes every time the program runs (three runs of the same program printed three different addresses), so no output could be verified. The programs below compare addresses and use the values behind them instead.

{{example basic}}

## What the star means

The `*` does two jobs. In a declaration, `int *p` means: `p` is a pointer to an `int`. Anywhere else, `*p` means "the thing `p` points to": reading `*p` gives the `int`, and `*p = 25;` stores into it. This is called **dereferencing**. In `int *p = &score;` the `*` belongs to the type and nothing is dereferenced. Write one pointer per declaration: in `int *a, b;` only `a` is a pointer, and `b` is a plain `int` (gcc reports `b = &y;` as a warning, `-Wint-conversion`).

## Letting a function change a variable

In [Functions](/courses/c/functions), a function got a copy of each argument and could not change the caller's variable. If the argument is an address, the function gets a copy of the address, and the copy points to the same variable. Writing through it changes the caller's variable.

{{example addone}}

The classic use is `swap`, which needs to change two variables at once.

{{example swap}}

## Why scanf needs the &

`scanf` is a function that must store a number in your variable, so it needs the variable's address. That is why `scanf("%d", &age)` has the `&`. The message in [Printing and reading values with printf and scanf](/courses/c/printf-scanf), `int *`, was this type: "pointer to `int`". If you already have a pointer, pass it as it is. The typed line is in the Typed input panel.

{{example scanf}}

## Pointers and arrays

In an expression, the name of an array becomes the address of its first item, so `int *p = numbers;` needs no `&`. Adding 1 to a pointer moves it to the next item, not the next byte. `numbers[i]` is just another way to write `*(numbers + i)`; that is why `&numbers[i]` in `scanf`, in [Arrays](/courses/c/arrays), is the address of one item.

{{example array}}

A pointer may move to any item of an array, or to the place just after the last item to compare against, but it may not be dereferenced there. Moving it anywhere else is undefined behavior.

{{example walk}}

## Why a function can change your array

A parameter written as `int values[]` is another way to write `int *values`: the function gets the address of the first item. That explains two things in [Arrays](/courses/c/arrays). The function changes the caller's array because it works on the same items. And it does not know the length, because an address says where the items start, not how many there are.

{{example sametype}}

It also explains the `sizeof` mistake in Arrays. Inside the function, `values` is a pointer, so `sizeof values` is the size of a pointer, not of the array. The size of a pointer depends on the computer, so this program prints 1 for "is this the size of a pointer?" instead of the number.

{{example paramsize}}

## Strings and scanf

In [Strings](/courses/c/strings), `scanf("%19s", name)` had no `&`. `name` is an array, so in the call it already is the address of its first character. Writing `&name` has a different type, and gcc reports it with its format check (`-Wformat=`). The typed line is in the Typed input panel.

{{example scanfstring}}

## NULL

`NULL` is the pointer value that means "points to nothing". A function can return it to say "not found". Check for it before you dereference.

{{example find}}

## When a pointer is wrong

These are all **undefined behavior**: dereferencing `NULL`, dereferencing a pointer that was never given a value, using the address of a local variable after its function has ended, and moving a pointer outside its array. The program may crash, print garbage, or seem to work, and writing through such a pointer is a common cause of security bugs.

What CodeBloom's tests with gcc 13.3 on Linux showed, and no more: reading or writing through `NULL` stopped the program with a segmentation fault, but C does not promise that. `-O2 -Wnull-dereference` warned about it, and nothing warned at `-O0`. A pointer used before it had a value was reported by `-Wall`; unoptimized, the read printed a number and the write seemed to work, and optimized the same program crashed. A pointer moved past an array was reported by `-O2 -Wall` only for a constant offset; `-fsanitize=address` reported it when the program ran, and `-fsanitize=undefined` did not. The examples never run such code, because the result cannot be verified.

This lesson does not cover `malloc`, pointers to pointers or function pointers.
