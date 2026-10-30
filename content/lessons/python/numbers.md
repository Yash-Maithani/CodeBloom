{{analogy}}

## The arithmetic operators

An **operator** is a symbol that works on values, like the `+` you have already used. Python's arithmetic operators are:

- `+` add
- `-` subtract
- `*` multiply
- `/` divide
- `//` divide and round down to a whole number
- `%` the remainder after dividing

{{example basics}}

`/` always gives a float, even when the result is a whole number: `6 / 3` is `2.0`, not 2. `//` divides and rounds down to a whole number. `%` gives the **remainder**, what is left over after the division. 2 goes into 7 three times with 1 left over, so `7 // 2` is 3 and `7 % 2` is 1.

{{example minutes}}

Together, `//` and `%` split an amount into whole units and what is left over: 135 minutes is 2 whole hours with 15 minutes left over.

## Negative numbers

`//` rounds down, which means towards the smaller number. -3.5 rounds down to -4, not to -3. This surprises people who expect it to just drop the decimal part. `%` matches `//`, so that the whole number times the divisor, plus the remainder, gives back the starting number.

{{example negative}}

## Order of operations

Python follows the order you know from maths. `*`, `/`, `//` and `%` are done before `+` and `-`. Operators at the same level are done from left to right. Brackets are done first, so you can use them to choose the order.

{{example order}}

## Decimal numbers are not exact

Python stores a number with a decimal point in binary, and many decimal values, such as 0.1, cannot be stored exactly. The stored value is very slightly off, and sometimes the error shows. It is not a mistake in your program. `round(number, 2)` gives the number rounded to two decimal places. Use it when you show a result.

{{example float}}

## Converting with float() and str()

`float` converts text that represents a number, such as "2.50", into a float. `str` goes the other way: it converts a number into text, so it can be joined to other text with `+`. The next lesson, Input and output, uses `int` in the same way to convert text to a whole number.

{{example convert}}

## Updating a variable with +=

Programs often change a variable using its own value, like `score = score + 5`. For numbers, `score += 5` means exactly the same and is shorter. There are matching forms for the other operators, such as `-=` and `*=`.

{{example update}}
