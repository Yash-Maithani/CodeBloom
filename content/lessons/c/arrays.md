{{analogy}}

## Declaring an array

An **array** holds a fixed number of values of one type. `int scores[4] = {70, 85, 90, 60};` declares an array of four `int` values. The number in square brackets is how many items it has, and the values in braces fill them in order. Each item has an index, starting at 0, and `scores[0]` is the first item. In Python, [Lists](/courses/python/lists) can grow and hold different types. A C array never grows or shrinks, and all its items have the same type.

{{example basics}}

## Going through an array

A `for` loop goes through an array, as in [Loops: while, for and do while](/courses/c/loops). The number of items is `sizeof scores / sizeof scores[0]`: `sizeof` gives a size in bytes, so the size of the whole array divided by the size of one item is the number of items. It works where the array is declared, as the second mistake below shows.

{{example loop}}

## Changing items

{{example change}}

## Items you do not fill in

If you give fewer values than the size, the rest are 0. If you give none at all, the items of a local array have no predictable value, and reading one is undefined behavior, so always give a starting value, such as `int numbers[3] = {0};`.

{{example partial}}

## Reading numbers into an array

`scanf` can store a number in one item. Write `&` in front of the item, as in `&numbers[i]`. [Pointers](/courses/c/pointers), a later lesson, explains the `&`. The typed lines are in the Typed input panel.

{{example input}}

## Arrays and functions

When you give a function an array, it does not receive a copy of the items, and it does not receive the length. It receives the place where the array is. So the function can change the caller's array, which is different from the single numbers in [Functions](/courses/c/functions), and it needs the length as a separate argument. [Pointers](/courses/c/pointers), a later lesson, explains why.

{{example function}}

## Past the end of an array

An array with four items has the indexes 0, 1, 2 and 3. Using index 4 or higher, or a negative index, is **undefined behavior**: C does not check, and the rules of C do not say what happens. The program may read a leftover value, crash, change another variable, or seem to work. Writing past the end overwrites other data in memory, which is a common cause of security bugs, because the data may belong to something else.

gcc often cannot warn you. In CodeBloom's tests with gcc 13, no warning appeared at `-O0` with `-Wall -Wextra` in any out-of-range case. With `-O2 -Wall` it can warn when the index is a constant or a loop clearly runs past the end. Compiling with `-fsanitize=address -g` or `-fsanitize=undefined -g` makes the program report an out-of-range index when it runs. The CodeBloom examples never go past the end, because the result cannot be verified.

The usual cause is a loop that goes one too far: `i <= 4` on a four-item array, where `i < 4` was meant.
