{{analogy}}

## The while loop

In [Making decisions with if and else](/courses/c/decisions), an `if` ran its group once, or not at all. A `while` loop is like an `if` that asks its question again after the group has run. While the condition is true, the group runs again. In Python the same loop is written without parentheses or braces: see [Loops: while and for](/courses/python/loops).

{{example count}}

`count` is the loop's counter. A loop like this needs three parts that work together: a starting value (line 4), a condition (line 5) and a change to the variable inside the group (line 7). If one is missing, the loop usually does the wrong thing. If the condition is false the first time C checks it, the group runs zero times.

## Loops that never end

What if nothing in the group changes `count`? Then the condition stays true for ever and the loop never ends. This is an infinite loop, the most common `while` mistake. gcc cannot tell you: it says nothing with any set of flags, because the program is correct C. The program just keeps running, and nothing in C stops it. In a terminal you stop it with Ctrl+C. To avoid an infinite loop, check that the group changes something the condition depends on, and that the change moves toward false.

## Asking until the answer is right

A `while` loop is the right tool when you do not know in advance how many passes you need. This program keeps asking until the number is 7. The typed lines are in the Typed input panel.

{{example ask}}

This loop assumes the person keeps typing numbers. If the person types something that is not a number, or the input ends, `scanf` stores nothing and `guess` keeps its value, so the loop would repeat for ever. Checking what `scanf` returned, as in [Making decisions with if and else](/courses/c/decisions), is how a real program avoids that.

## The for loop

Often you know how many passes you need. A `for` loop puts the start, the condition and the change in one line, separated by semicolons. A variable declared in the first part exists only inside the loop. This needs C99 or later, which the examples use.

{{example for}}

A loop often builds up a result, one pass at a time. `total += number` is the shorthand from [Numbers and arithmetic](/courses/c/numbers).

{{example sum}}

`number--` takes 1 away, the way `number++` adds 1, so a loop can count down.

{{example down}}

## The do while loop

A `do while` loop checks its condition after the group, not before. So its group always runs at least once, even when the condition is false from the start. Note the semicolon after the closing parenthesis. A `while` loop with the same condition would run zero times.

{{example dowhile}}

## while, for or do while?

Use `for` when you know how many passes you need, `while` when you repeat until something happens, and `do while` when the group must run once before the first check. Python has no `do while` loop, and its `for` loop goes through a sequence instead of counting with three parts.
