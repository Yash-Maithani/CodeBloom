{{analogy}}

## Comparing values

In Python, a comparison is a question about two values, and Python answers it with `True` or `False`. These two answers are values too, with their own type: `bool`, short for Boolean.

{{example compare}}

Python has six comparisons:

- `==` equal to
- `!=` not equal to
- `<` less than
- `>` greater than
- `<=` less than or equal to
- `>=` greater than or equal to

## Choosing with if and else

An `if` uses a comparison as its condition. This is the program from the CodeBloom homepage:

{{example vote}}

Indentation is how Python knows which lines belong to the `if` and which belong to the `else`. It is part of the program, not decoration: change the indentation and you change what the program does. Use four spaces for each level. Many code editors insert four spaces when you press the Tab key.

## When there is no else

An `else` is optional. Without one, Python either runs the indented lines or skips them, then carries on.

{{example fee}}

The first practice question below runs the same program with a larger order.
