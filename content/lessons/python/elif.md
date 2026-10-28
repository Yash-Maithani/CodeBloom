{{analogy}}

## Adding elif

In [Making decisions with if and else](/courses/python/decisions), an `if` and an `else` gave two choices. To get more, put `elif` between them. `elif` is short for "else if". Each `elif` has its own condition and its own indented lines. An `if`, its `elif` lines and its `else` form one **chain**.

{{example ticket}}

Python checks the conditions from the top and stops at the first true one. The condition on line 4 does not need to say `age >= 13`: Python only reaches line 4 when line 2 was `False`, so `age` is already 13 or more. To check two things in one condition, such as an age that is at least 13 and under 65, see [Combining conditions with and, or and not](/courses/python/conditions), the next lesson.

{{visual ticket}}

## As many elif lines as you need

You can use as many `elif` lines as you need.

{{example grade}}

Each `elif` is checked only when every condition above it was `False`. So `score >= 70` on line 4 really means 70 to 89, because scores of 90 or more were taken by line 2.

## elif is not the same as another if

What if each choice were a separate `if`? Each `if` starts a new, independent decision, and Python checks every one of them.

{{example separate}}

Both conditions are true for 95, so both groups ran. With `elif`, only the first true condition runs. Use `elif` when the choices exclude each other.
