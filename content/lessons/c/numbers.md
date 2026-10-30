{{analogy}}

## The arithmetic operators

Every program here has the same frame as the one in [Your first C program](/courses/c/first-program). Look at the lines inside `main`. An **operator** is a symbol that works on values. C's arithmetic operators are:

- `+` add
- `-` subtract
- `*` multiply
- `/` divide
- `%` the remainder after dividing whole numbers

{{example basics}}

When both numbers are whole numbers, `/` gives a whole number: C drops the decimal part. It does not round, so `7 / 2` is 3. If one of the numbers has a decimal point, C divides as decimals, so `7.0 / 2` is 3.5. `%` gives the **remainder**, what is left over after the division: 2 goes into 7 three times with 1 left over, so `7 % 2` is 1. In Python, `/` always gives a decimal number and `//` is the whole-number division: see [Numbers and arithmetic in Python](/courses/python/numbers).

{{example minutes}}

Together, `/` and `%` split an amount into whole units and what is left over: 135 minutes is 2 whole hours with 15 minutes left over.

## Negative numbers

With whole numbers, C drops the decimal part of the result, so it rounds towards zero: -3.5 becomes -3. The C standard has said this since 1999. The remainder matches, so that the quotient times the divisor, plus the remainder, gives back the starting number. Python's `//` rounds down instead, so it gives -4 for -7 // 2.

{{example negative}}

## Order of operations

C follows the order you know from maths. `*`, `/` and `%` are done before `+` and `-`. Operators at the same level go from left to right, and brackets go first.

{{example order}}

## Mixing whole and decimal numbers

When a calculation has a decimal number on one side, C converts the other side to a decimal number first. You can also ask for the conversion yourself with a **cast**: the type in brackets in front of a value, such as `(double)total`.

{{example mixed}}

## Decimal numbers are not exact

A `double` is stored in binary, and many decimal values, such as 0.1, cannot be stored exactly. The stored value is very slightly off. `%f` shows six digits after the point, which hides the error, and more digits show it. It is not a mistake in your program. Python shows the same value.

{{example float}}

## Updating a variable

Programs often change a variable using its own value, like `score = score + 5`. `score += 5` means the same and is shorter, and `-=` and `*=` work the same way. `score++` adds 1. Write `++` as an instruction on its own line: mixing it into a larger expression that uses the same variable can be undefined behavior, and the rules of C do not say what such a line means.

{{example update}}

## Limits that C does not check

Dividing a whole number by zero is **undefined behavior**: the rules of C do not say what happens, so the program may crash, print nonsense, or even seem to work. Python stops with a clear error instead. Check the divisor first. A later lesson, Making decisions with if and else, shows how to check a value, and [Combining conditions with &&, || and !](/courses/c/conditions) shows a safe way to divide.

An `int` also has a limit. On most computers the largest is 2147483647, and a calculation that goes beyond it is undefined behavior as well. Keep the numbers small for now.
