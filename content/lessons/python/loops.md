{{analogy}}

## The while loop

In [Making decisions with if and else](/courses/python/decisions), an `if` ran its group once, or not at all. A `while` loop is like an `if` that asks its question again after the group has run. While the condition is true, the group runs again.

{{example count}}

`count` is the loop's counter. A loop like this needs three parts that work together: a starting value (line 1), a condition (line 2) and a change to the variable inside the group (line 4). If one is missing, the loop usually does the wrong thing.

{{visual count}}

If the condition is false the first time Python checks it, the group runs zero times.

## Loops that never end

What if nothing in the group changes `count`? Then the condition stays true for ever and the loop never ends. This is an infinite loop, the most common `while` mistake.

Python itself never stops an infinite loop. It does not check whether a loop will end, and it has no time limit of its own, so the program just keeps going until something outside stops it. The CodeBloom playground is such a thing: it stops a run after its 5-second limit, and you can also press Stop.

To avoid an infinite loop, check that the group changes something the condition depends on, and that the change moves toward `False`.

## Asking until the answer is right

A `while` loop is the right tool when you do not know in advance how many passes you need. This program keeps asking until the word is `open`. In the playground, the Input box starts with three lines: `wrong`, `guess` and `open`. Each `input` call reads the next line, and the typed line appears after the prompt in the output.

{{example ask}}

## The for loop and range

Often you know how many passes you need. A `for` loop runs its group once for each value in a sequence, and hands the group one value at a time. `range` makes a sequence of whole numbers.

{{example range}}

The rule is: `range(start, stop)` starts at `start` and stops before `stop`. The stop value is never included. The number of values is stop minus start, so `range(1, 4)` gives three. With one number, `range(stop)`, the start is 0. If stop is not greater than start, there are no values and the group runs zero times.

Being one too high or one too low is such a common mistake that it has a name: an **off-by-one error**.

Loops are often used to build up a result, one pass at a time.

{{example sum}}

## while or for?

Use `for` when you know the values in advance, such as the numbers 1 to 10, or, later in this course, the items in a list. Use `while` when the loop should continue until something happens, such as a correct answer. Every `for` loop over a range can also be written as a `while` loop, but `for` keeps the start, the stop and the change in one line, so there is less to forget.
