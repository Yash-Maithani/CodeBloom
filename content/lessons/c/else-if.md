{{analogy}}

## Adding else if

In [Making decisions with if and else](/courses/c/decisions), an `if` and an `else` gave two choices. To get more, put `else if` between them. C has no separate keyword for it: `else if` is an `else` whose group is another `if`. Each `else if` has its own condition and its own braces. In Python the same idea is spelled `elif`: see [More decisions with elif](/courses/python/elif).

{{example ticket}}

C checks the conditions from the top and stops at the first true one. The condition on line 7 does not need to say `age >= 13`: C only reaches line 7 when line 5 was false, so `age` is already 13 or more. To check two things in one condition, such as an age that is at least 13 and under 65, see [Combining conditions with &&, || and !](/courses/c/conditions), the next lesson.

## As many else if lines as you need

{{example grade}}

Each `else if` is checked only when every condition above it was false. So `score >= 70` on line 7 really means 70 to 89, because scores of 90 or more were taken by line 5.

## else if is not the same as another if

What if each choice were a separate `if`? Each `if` starts a new, independent decision, and C checks every one of them.

{{example separate}}

Both conditions are true for 95, so both groups ran. With `else if`, only the first true condition runs. Use `else if` when the choices exclude each other.

## Choosing by value with switch

When the choice depends on which whole number a variable holds, `switch` can be easier to read than a long chain. `switch (day)` looks at the value of `day`, which must be a whole number, and jumps to the `case` label with that value. `break` leaves the switch. `default:` runs when no label matches, and it is optional.

{{example day}}

A `case` label is not a condition. It is a place to jump to. Several labels can share one group of instructions by stacking them: `case 6:` has no instructions of its own, so C carries on into the instructions of `case 7:`.

{{example weekend}}

A `switch` often works on what a person typed.

{{example menu}}

The first mistake below shows what happens when `else if` conditions are in the wrong order. The second and third show two traps that gcc reports only with extra warnings turned on, so compile your own programs with `-Wall -Wextra`.
