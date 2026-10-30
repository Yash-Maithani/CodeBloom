{{analogy}}

## &&: both must be true

In [More decisions with else if and switch](/courses/c/else-if), each condition asked one question. With `&&`, one condition can ask two. It is true only when both parts are true. Python spells it with the word `and`: see [Combining conditions with and, or and not](/courses/python/conditions).

{{example and}}

## ||: at least one must be true

`||` is true when at least one part is true. Each side must be a complete condition of its own.

{{example or}}

## !: turn it around

`!` goes in front of a condition or a number and reverses it. A number that is 0 counts as false, so `!raining` is true when `raining` is 0.

{{example not}}

## The three on numbers

These lessons use 1 and 0 for true and false. Newer C also has the words `true` and `false`, from `<stdbool.h>` or built in since C23, but they are not covered here. `&&`, `||` and `!` give 1 for true and 0 for false, and they treat any number that is not 0 as true. The rules are short:

- `&&` is 1 only when both sides are true.
- `||` is 0 only when both sides are false.
- `!` gives the opposite.

{{example values}}

## Which part is done first

`!` is done first, then `&&`, then `||`. When you mix `&&` with `||`, add brackets, so that the order is clear to you and to the person reading the program. gcc suggests brackets for that case when you compile with `-Wall`, as the third mistake shows.

{{example notorder}}

## C stops checking early

C checks the parts of a condition from left to right. For `&&`, when the left part is false, the answer must be false, so C does not check the right part. For `||`, when the left part is true, the right part is skipped. This protects a calculation that could fail. Dividing a whole number by zero is undefined behavior, as in [Numbers and arithmetic](/courses/c/numbers), and the check on the left stops it from running.

{{example short}}
