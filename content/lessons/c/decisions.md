{{analogy}}

## Comparisons

C has six comparisons: `==` equal to, `!=` not equal to, `<` less than, `>` greater than, `<=` less than or equal to, and `>=` greater than or equal to. A comparison gives a whole number: 1 if it is true and 0 if it is false. Python's comparisons give `True` and `False`.

{{example compare}}

## Choosing with if and else

An `if` puts its condition in parentheses, and the instructions it controls go between braces. If the condition is true, C runs the instructions in the braces. If it is false, C skips them and runs the `else` group, when there is one. Either way, the program then carries on after the decision.

In C, the braces mark which instructions belong to each choice. Indentation makes a program easier for people to read, but the compiler ignores it. In Python it is the other way round: indentation is the rule, and there are no braces.

{{example vote}}

An `if` does not need an `else`. When the condition is false, the program just carries on.

{{example fee}}

## Braces and a single instruction

If you leave out the braces, an `if` controls only the very next instruction. Many programmers always write braces, because adding a second instruction to an `if` is then safe.

{{example nobraces}}

## Any number can be a condition

A condition does not have to be a comparison. In a condition, 0 counts as false and every other number counts as true.

{{example truthy}}

## Checking whether scanf worked

In [Printing and reading values with printf and scanf](/courses/c/printf-scanf), `scanf` returned 1 when it read a number and less when it could not. Comparing the returned value with 1 lets a program decide what to do with input that was not a whole number.

{{example check}}
