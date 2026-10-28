{{analogy}}

## and: both must be true

In [More decisions with elif](/courses/python/elif), each condition asked one question. With `and`, one condition can ask two. It is true only when both parts are true.

{{example and}}

## or: at least one must be true

`or` is true when at least one part is true. `==` also compares text: `day == "Sunday"` is true when `day` holds exactly that text, with the same capital letters.

{{example or}}

## not: turn it around

`not` goes in front of a condition or a `True` or `False` value and reverses it.

{{example not}}

## The three on True and False

You can ask Python to work out `and`, `or` and `not` directly. The rules are short:

- `and` is `True` only when both sides are `True`.
- `or` is `False` only when both sides are `False`.
- `not` gives the opposite.

{{example values}}

## Which part is done first

`not` is done first, then `and`, then `or`. When you mix `and` with `or`, add brackets, so that the order is clear to you and to the person reading the program.

{{example precedence}}

## Python stops checking early

Python checks the parts of a condition from left to right. For `and`, when the left part is `False`, the answer must be `False`, so Python does not check the right part. For `or`, when the left part is `True`, the right part is skipped. This protects a calculation that could fail, such as a division by zero from [Numbers and arithmetic](/courses/python/numbers).

{{example short}}
